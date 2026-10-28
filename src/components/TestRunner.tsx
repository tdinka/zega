"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QuestionAmharic, T } from "./Amharic";
import AnswerList from "./AnswerList";
import { TEST_INFO, type Question } from "@/lib/content";
import { buildTest, canChoose, choicesFor, grade, verdict, type Asked } from "@/lib/quiz";
import { canListen, canSpeak, listenOnce, speak, stopSpeaking } from "@/lib/speech";
import { FREE_TESTS, isUnlocked, useStore } from "@/lib/store";

type Mode = "practice" | "interview";
type Phase = "intro" | "asking" | "feedback" | "done";

function Mic({ onHeard, disabled }: { onHeard: (text: string) => void; disabled?: boolean }) {
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState("");
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef<() => void>(() => {});

  async function start() {
    setError(null);
    setPartial("");
    setListening(true);
    stopSpeaking();
    const { result, stop } = listenOnce(setPartial);
    stopRef.current = stop;
    try {
      const heard = await result;
      if (heard.replace(/\|/g, "").trim()) onHeard(heard);
      else setError("We didn't catch that. Try again, or type your answer.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Listening stopped.");
    } finally {
      setListening(false);
    }
  }

  if (!canListen()) return null;
  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => (listening ? stopRef.current() : start())}
        className={`flex w-full items-center justify-center gap-3 rounded-xl border-2 px-4 py-4 font-semibold transition ${
          listening ? "border-wrong bg-wrong-50 text-wrong" : "border-navy bg-navy-50 text-navy hover:bg-navy/10"
        }`}
      >
        <span aria-hidden className={`h-3 w-3 rounded-full ${listening ? "animate-pulse bg-wrong" : "bg-navy"}`} />
        {listening ? "Listening… tap when you're done" : <T k="interview.mic" amClass="text-xs font-normal" />}
      </button>
      {partial && listening && <p className="mt-2 text-sm italic text-ink-soft">“{partial}”</p>}
      {error && <p role="alert" className="mt-2 text-sm text-wrong">{error}</p>}
    </div>
  );
}

export default function TestRunner({ mode }: { mode: Mode }) {
  const [store, update, ready] = useStore();
  const { test, place, mine, speechRate } = store.settings;
  const info = TEST_INFO[test];
  const unlocked = ready && isUnlocked(store);
  const locked = ready && !unlocked && (mode === "interview" || store.freeTestsUsed >= FREE_TESTS);

  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [skipped, setSkipped] = useState<number[]>([]);
  const [asked, setAsked] = useState<Asked[]>([]);
  const [how, setHow] = useState<"choose" | "say">(mode === "interview" ? "say" : "choose");
  const [typed, setTyped] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [choices, setChoices] = useState<{ options: string[]; correct: string[] } | null>(null);
  const [last, setLast] = useState<{ correct: boolean; said: string } | null>(null);
  const [stopReason, setStopReason] = useState<"passed" | "failed" | null>(null);

  const q = questions[asked.length];
  const choosing = mode === "practice" && how === "choose" && q && canChoose(q);

  useEffect(() => {
    if (q && choosing) setChoices(choicesFor(q));
  }, [q?.n, choosing]); // eslint-disable-line react-hooks/exhaustive-deps

  // The officer reads each new question aloud in interview mode.
  useEffect(() => {
    if (mode === "interview" && phase === "asking" && q) void speak(q.q, speechRate);
  }, [mode, phase, q?.n]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => stopSpeaking, []);

  function begin() {
    const t = buildTest(test, place, mine);
    setQuestions(t.questions);
    setSkipped(t.skipped);
    setAsked([]);
    setLast(null);
    setStopReason(null);
    setPhase("asking");
    if (!unlocked && mode === "practice") update((s) => ({ ...s, freeTestsUsed: s.freeTestsUsed + 1 }));
  }

  function submit(said: string) {
    if (!q || !said.trim()) return;
    const result = grade(q, said, place, mine);
    const shown = said.split(" | ")[0];
    const next = [...asked, { n: q.n, said: shown, correct: result.correct }];
    setAsked(next);
    setTyped("");
    setPicked([]);
    setLast({ correct: result.correct, said: shown });
    // Learning from the test: a miss sends the flashcard back to the start.
    update((s) => ({
      ...s,
      boxes: { ...s.boxes, [q.n]: result.correct ? Math.min(5, (s.boxes[q.n] ?? 1) + 1) : 1 },
    }));
    const v = verdict(test, next);
    if (v !== "continue") {
      setStopReason(v);
      update((s) => ({
        ...s,
        tests: [
          ...s.tests,
          { at: new Date().toISOString(), test, mode, correct: next.filter((a) => a.correct).length, wrong: next.filter((a) => !a.correct).length, passed: v === "passed" },
        ].slice(-50),
      }));
    }
    if (mode === "practice") setPhase("feedback");
    else if (v !== "continue") finish();
  }

  function finish() {
    stopSpeaking();
    setPhase("done");
  }

  function nextQuestion() {
    if (stopReason) finish();
    else setPhase("asking");
  }

  const right = asked.filter((a) => a.correct).length;
  const wrong = asked.length - right;

  if (!ready) return <div className="mx-auto max-w-2xl px-4 py-10 text-ink-soft">Loading…</div>;

  // ---------- Intro ----------
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <T k={mode === "practice" ? "test.title" : "interview.title"} as="h1" className="block font-display text-3xl font-semibold" amClass="text-lg" />
        <div className="card mt-6 p-6">
          {mode === "interview" && <T k="interview.intro" as="p" className="block text-ink" amClass="text-sm" />}
          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              [info.asked, "questions at most"],
              [info.toPass, "right answers to pass"],
              [info.toFail, "wrong answers end it"],
            ].map(([num, label]) => (
              <div key={String(label)} className="rounded-lg bg-paper p-3">
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-3xl font-semibold tabular-nums text-navy">{num}</dd>
                <dd className="mt-1 text-xs text-ink-soft">{label}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-ink-soft">
            {test === "standard" ? "2025 test: questions come from all 128." : "65/20 test: questions come from the 20 starred ones."}{" "}
            Like the real interview, it ends as soon as you pass or can no longer pass.{" "}
            <Link href="/start" className="underline">Change test</Link>
          </p>
          {mode === "interview" && (!canSpeak() || !canListen()) && (
            <p className="mt-3 rounded-lg bg-marigold-50 p-3 text-sm">
              {canListen() ? "" : "This browser can't listen to spoken answers, so you'll type them. "}
              {canSpeak() ? "" : "This browser can't read questions aloud, so they'll appear on screen. "}
              Chrome, Edge and Safari support both.
            </p>
          )}

          {locked ? (
            <div className="mt-6 rounded-lg border border-marigold/40 bg-marigold-50 p-4">
              <p className="font-semibold">
                {mode === "interview" ? "The mock interview is part of the unlocked version." : "You've used your free practice test."}
              </p>
              <p className="mt-1 text-sm text-ink-soft">Unlock once for unlimited tests, the spoken interview and Amharic help for every question.</p>
              <Link href="/unlock" className="btn-primary mt-3">See unlock options</Link>
            </div>
          ) : (
            <button type="button" className="btn-primary mt-6 w-full" onClick={begin}>
              <T k={mode === "practice" ? "test.start" : "interview.start"} amClass="hidden" />
            </button>
          )}
          {!unlocked && mode === "practice" && !locked && <p className="mt-2 text-center text-xs text-ink-faint">Free version: 1 practice test.</p>}
        </div>
      </div>
    );
  }

  // ---------- Results ----------
  if (phase === "done") {
    const passed = stopReason === "passed";
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className={`card overflow-hidden`}>
          <div className={`p-6 ${passed ? "bg-good-50" : "bg-wrong-50"}`}>
            <T k={passed ? "test.passed" : "test.failed"} as="h1" className={`block font-display text-3xl font-semibold ${passed ? "text-good" : "text-wrong"}`} amClass="text-lg" />
            <p className="mt-2 text-ink">
              {right} right, {wrong} wrong, out of {asked.length} question{asked.length === 1 ? "" : "s"} asked.
              {passed ? ` The officer would stop here: you needed ${info.toPass}.` : ` ${info.toPass} right answers are needed to pass.`}
            </p>
          </div>
          <ol className="divide-y divide-line">
            {asked.map((a) => {
              const qq = questions.find((x) => x.n === a.n)!;
              return (
                <li key={a.n} className="p-5">
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full text-sm font-bold text-white ${a.correct ? "bg-good" : "bg-wrong"}`} aria-label={a.correct ? "Right" : "Wrong"}>
                      {a.correct ? "✓" : "✕"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug"><span className="qnum mr-1">{qq.n}.</span>{qq.q}</p>
                      <p className="mt-1 text-sm text-ink-soft">You said: “{a.said}”</p>
                      {!a.correct && (
                        <div className="mt-3 rounded-lg bg-paper p-3">
                          <AnswerList q={qq} />
                          <div className="mt-2"><QuestionAmharic n={qq.n} show="help" /></div>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={() => setPhase("intro")}><T k="test.again" amClass="hidden" /></button>
          <Link href="/study" className="btn-quiet">Back to flashcards</Link>
          <Link href="/progress" className="btn-quiet">See my progress</Link>
        </div>
      </div>
    );
  }

  // ---------- Asking / feedback ----------
  if (!q && phase === "asking") return null;
  const current = phase === "feedback" ? questions[asked.length - 1] : q;
  const need = current.count ?? 1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">Question {Math.min(asked.length + (phase === "feedback" ? 0 : 1), info.asked)} of up to {info.asked}</span>
        <span className="tabular-nums">
          <span className="text-good">{right} right</span> · <span className="text-wrong">{wrong} wrong</span>
        </span>
      </div>
      <div className="mt-2 flex gap-1" aria-hidden>
        {Array.from({ length: info.asked }, (_, k) => (
          <span key={k} className={`h-1.5 flex-1 rounded-full ${k < asked.length ? (asked[k].correct ? "bg-good" : "bg-wrong") : "bg-paper-200"}`} />
        ))}
      </div>
      {skipped.length > 0 && asked.length === 0 && (
        <p className="mt-3 text-xs text-ink-faint">
          Questions {skipped.join(", ")} are left out until you add your own answers in <Link href="/start" className="underline">Settings</Link>.
        </p>
      )}

      <div className="card mt-6 p-5 sm:p-7">
        <span className="qnum">Question {current.n}</span>
        {mode === "interview" && phase === "asking" ? (
          <div className="mt-3">
            <p className="font-display text-xl font-semibold leading-snug sm:text-2xl">{current.q}</p>
            {canSpeak() && (
              <button type="button" className="btn-quiet mt-3" onClick={() => speak(current.q, speechRate * 0.9)}>
                ↻ <T k="interview.repeat" amClass="hidden" />
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mt-3 font-display text-xl font-semibold leading-snug sm:text-2xl">{current.q}</p>
            <div className="mt-2"><QuestionAmharic n={current.n} show="question" /></div>
          </>
        )}
        {need > 1 && phase === "asking" && <p className="mt-2 text-sm font-semibold text-navy">Give {need} answers.</p>}

        {phase === "asking" && (
          <div className="mt-6">
            {mode === "practice" && canChoose(current) && (
              <div className="mb-4 inline-flex rounded-lg border border-line bg-paper p-1 text-sm" role="tablist">
                {(["choose", "say"] as const).map((h) => (
                  <button
                    key={h}
                    type="button"
                    role="tab"
                    aria-selected={how === h}
                    onClick={() => setHow(h)}
                    className={`rounded-md px-3 py-1.5 ${how === h ? "bg-white font-semibold shadow-sm" : "text-ink-soft"}`}
                  >
                    <T k={h === "choose" ? "test.choose" : "test.say"} amClass="hidden" />
                  </button>
                ))}
              </div>
            )}

            {choosing && choices ? (
              <div>
                <div className="grid gap-2">
                  {choices.options.map((o) => {
                    const on = picked.includes(o);
                    return (
                      <button
                        key={o}
                        type="button"
                        onClick={() =>
                          setPicked((p) => (need === 1 ? [o] : on ? p.filter((x) => x !== o) : p.length < need ? [...p, o] : p))
                        }
                        className={`rounded-lg border px-4 py-3 text-left transition ${on ? "border-navy bg-navy-50 ring-1 ring-navy" : "border-line bg-white hover:border-ink-faint"}`}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
                <button type="button" className="btn-primary mt-4 w-full" disabled={picked.length !== need} onClick={() => submit(picked.join(", "))}>
                  <T k="test.check" amClass="hidden" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Mic onHeard={(t) => submit(t)} />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit(typed);
                  }}
                  className="flex gap-2"
                >
                  <label htmlFor="typed" className="sr-only">Your answer</label>
                  <input
                    id="typed"
                    className="field min-w-0 flex-1"
                    autoComplete="off"
                    autoCapitalize="off"
                    placeholder={canListen() ? "…or type your answer in English" : "Type your answer in English"}
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                  />
                  <button type="submit" className="btn-primary px-4" disabled={!typed.trim()}>
                    {mode === "interview" ? "Answer" : "Check"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {phase === "feedback" && last && (
          <div className="mt-5">
            <div className={`rounded-lg p-4 ${last.correct ? "bg-good-50" : "bg-wrong-50"}`}>
              <T k={last.correct ? "test.right" : "test.wrong"} className={`block font-semibold ${last.correct ? "text-good" : "text-wrong"}`} amClass="text-sm" />
              <p className="mt-1 text-sm text-ink-soft">You said: “{last.said}”</p>
            </div>
            <div className="mt-4 rounded-lg bg-paper p-4">
              <AnswerList q={current} />
              <div className="mt-3"><QuestionAmharic n={current.n} show="help" /></div>
            </div>
            <button type="button" className="btn-primary mt-5 w-full" onClick={nextQuestion}>
              {stopReason ? "See results" : <T k="test.next" amClass="hidden" />}
            </button>
          </div>
        )}
      </div>

      <button type="button" onClick={finish} className="mt-4 text-sm text-ink-soft underline">End this test</button>
    </div>
  );
}
