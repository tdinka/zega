"use client";
// Read-aloud (text to speech) and spoken answers (speech recognition), using
// what the browser already has. Both are optional: typing always works.

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let cachedVoice: SpeechSynthesisVoice | null = null;
function englishVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  cachedVoice =
    voices.find((v) => v.lang === "en-US" && /natural|google|samantha|aria|jenny/i.test(v.name)) ||
    voices.find((v) => v.lang === "en-US") ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null;
  return cachedVoice;
}

export function speak(text: string, rate = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (!canSpeak()) return resolve();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[()]/g, ""));
    u.lang = "en-US";
    u.rate = rate;
    const v = englishVoice();
    if (v) u.voice = v;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}

type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

function RecognitionCtor(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function canListen(): boolean {
  return RecognitionCtor() !== null;
}

/** One piece of a spoken answer: the recognizer's best guess and its other guesses. */
export type Piece = { best: string; others: string[] };
const text = (pieces: Piece[]) => pieces.map((p) => p.best).filter(Boolean).join(" ");

/**
 * Everything heard, as "best | alternative | …". Each alternative is the whole answer with one
 * piece heard another way: "speech religion a symbol" also comes as "speech religion assembly",
 * so a "Name three" answer keeps its first two parts.
 */
export function joinPieces(pieces: Piece[]): string {
  const best = text(pieces);
  const alternatives = pieces.flatMap((p, i) => p.others.map((o) => text(pieces.map((q, j) => (j === i ? { best: o, others: [] } : q)))));
  return [best, ...Array.from(new Set(alternatives)).filter((a) => a && a !== best).slice(0, 6)].join(" | ");
}

/**
 * Listens for one spoken answer. onPartial gets words as they're heard.
 * Resolves with everything heard (all alternatives joined, so the matcher can
 * use whichever transcription fits), or rejects with a plain-English reason.
 */
export function listenOnce(onPartial?: (text: string) => void): { result: Promise<string>; stop: () => void } {
  const Ctor = RecognitionCtor();
  if (!Ctor) return { result: Promise.reject(new Error("This browser can't listen. Type your answer instead.")), stop: () => {} };
  // Phones end recognition at the first pause (iPhone after ~1 second), which cut
  // off "Name five" answers mid-list. So each time it ends, we start again and keep
  // adding, until the learner taps done or stays quiet for PAUSE_MS.
  const PAUSE_MS = 4000;
  const FIRST_WORDS_MS = 8000;
  const MAX_MS = 45000;
  const startedAt = Date.now();
  let lastHeardAt = 0;
  let stopped = false;
  const heard: Piece[] = []; // finished rounds
  let current: Piece[] = []; // the round in progress
  let rec: any = null;

  const result = new Promise<string>((resolve, reject) => {
    const finish = () => resolve(joinPieces([...heard, ...current]));
    const keepGoing = () => {
      if (stopped) return false;
      const now = Date.now();
      if (now - startedAt > MAX_MS) return false;
      return lastHeardAt ? now - lastHeardAt < PAUSE_MS : now - startedAt < FIRST_WORDS_MS;
    };
    const round = () => {
      rec = new Ctor();
      rec.lang = "en-US";
      rec.interimResults = true;
      rec.maxAlternatives = 3;
      rec.continuous = false;
      rec.onresult = (e: any) => {
        current = Array.from(e.results as ArrayLike<any>).map((r: any) => ({
          best: String(r[0].transcript).trim(),
          others: r.isFinal ? Array.from(r as ArrayLike<any>).slice(1).map((a: any) => String(a.transcript).trim()) : [],
        }));
        if (text(current)) lastHeardAt = Date.now();
        onPartial?.(text([...heard, ...current]));
      };
      rec.onerror = (e: any) => {
        const code = e?.error;
        if (code === "not-allowed" || code === "service-not-allowed") {
          stopped = true;
          reject(new Error("Microphone access is blocked. Allow the microphone for this site, or type your answer."));
        } else if (code !== "no-speech" && code !== "aborted") {
          stopped = true;
          reject(new Error("Listening stopped. Try again, or type your answer."));
        }
        // no-speech: onend decides whether to keep waiting or finish.
      };
      rec.onend = () => {
        heard.push(...current);
        current = [];
        if (keepGoing()) {
          try {
            round();
            return;
          } catch {
            /* fall through and finish */
          }
        }
        if (!text(heard) && !stopped) reject(new Error("We didn't hear anything. Tap the microphone and try again."));
        else finish();
      };
      rec.start();
    };
    try {
      round();
    } catch {
      reject(new Error("Listening stopped. Try again, or type your answer."));
    }
  });
  return {
    result,
    stop: () => {
      stopped = true;
      rec?.stop();
    },
  };
}
