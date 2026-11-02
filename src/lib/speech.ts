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
  let heard = ""; // finished parts from earlier rounds
  let current = ""; // the round in progress
  let alternatives: string[] = [];
  let rec: any = null;

  const result = new Promise<string>((resolve, reject) => {
    const finish = () => {
      const best = [heard, current].filter(Boolean).join(" ");
      resolve([best, ...alternatives.filter((a) => a !== best)].join(" | "));
    };
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
        const res = e.results[e.results.length - 1];
        current = Array.from(e.results as ArrayLike<any>).map((r: any) => r[0].transcript).join(" ").trim();
        if (res.isFinal) alternatives.push(...Array.from(res as ArrayLike<any>).slice(1).map((a: any) => a.transcript));
        if (current) lastHeardAt = Date.now();
        onPartial?.([heard, current].filter(Boolean).join(" "));
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
        heard = [heard, current].filter(Boolean).join(" ");
        current = "";
        if (keepGoing()) {
          try {
            round();
            return;
          } catch {
            /* fall through and finish */
          }
        }
        if (!heard && !stopped) reject(new Error("We didn't hear anything. Tap the microphone and try again."));
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
