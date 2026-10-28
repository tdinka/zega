"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { QuestionAmharic, T } from "@/components/Amharic";
import AnswerList from "@/components/AnswerList";
import { poolFor, sectionOf, shuffle, type Question } from "@/lib/content";
import { canSpeak, speak, stopSpeaking } from "@/lib/speech";
import { useStore } from "@/lib/store";

const BOX_LABEL = ["", "New", "Learning", "Getting there", "Almost", "Solid"];

/** Next cards: lowest box first (what you know least), shuffled within each box. */
function buildDeck(pool: Question[], boxes: Record<string, number>): Question[] {
  const byBox = new Map<number, Question[]>();
  for (const q of pool) {
    const b = boxes[q.n] ?? 1;
    byBox.set(b, [...(byBox.get(b) ?? []), q]);
  }
  return [1, 2, 3, 4, 5].flatMap((b) => shuffle(byBox.get(b) ?? []));
}

export default function Study() {
  const [store, update, ready] = useStore();
  const [deck, setDeck] = useState<Question[]>([]);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionDone, setSessionDone] = useState(0);
  const { test, speechRate } = store.settings;
  const pool = useMemo(() => poolFor(test), [test]);

  useEffect(() => {
    if (!ready) return;
    setDeck(buildDeck(pool, store.boxes));
    setI(0);
    setRevealed(false);
    return stopSpeaking;
  }, [ready, pool]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = deck[i];
  const solid = pool.filter((p) => (store.boxes[p.n] ?? 1) >= 4).length;

  function grade(knew: boolean) {
    if (!q) return;
    update((s) => {
      const cur = s.boxes[q.n] ?? 1;
      return { ...s, boxes: { ...s.boxes, [q.n]: knew ? Math.min(5, cur + 1) : 1 } };
    });
    setSessionDone((n) => n + 1);
    setRevealed(false);
    stopSpeaking();
    // Missed cards come back a few cards later in this session.
    if (!knew) setDeck((d) => [...d.slice(0, i + 4), q, ...d.slice(i + 4)]);
    setI((x) => x + 1);
  }

  if (!ready) return <div className="mx-auto max-w-2xl px-4 py-10 text-ink-soft">Loading your cards…</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <T k="study.title" as="h1" className="block font-display text-3xl font-semibold" amClass="text-lg" />
          <p className="mt-1 text-sm text-ink-soft">
            {test === "standard" ? "2025 test, all 128 questions" : "65/20 test, 20 starred questions"} ·{" "}
            <Link href="/start" className="underline">change</Link>
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-semibold tabular-nums text-navy">
            {solid}<span className="text-base text-ink-faint">/{pool.length}</span>
          </p>
          <p className="text-xs text-ink-soft">cards you know well</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper-200" role="progressbar" aria-valuemin={0} aria-valuemax={pool.length} aria-valuenow={solid}>
        <div className="h-full rounded-full bg-marigold transition-all" style={{ width: `${(solid / pool.length) * 100}%` }} />
      </div>

      {!q ? (
        <div className="card mt-8 p-8 text-center">
          <T k="study.done" as="p" className="block font-display text-xl font-semibold" amClass="text-base" />
          <p className="mt-2 text-sm text-ink-soft">You went through {sessionDone} cards.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="btn-quiet" onClick={() => { setDeck(buildDeck(pool, store.boxes)); setI(0); setSessionDone(0); }}>
              Study again
            </button>
            <Link href="/practice" className="btn-primary">Try a practice test</Link>
          </div>
        </div>
      ) : (
        <div className="card mt-8 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <span className="qnum">
              Question {q.n} {q.star && <span className="ml-1 text-marigold-dark">★</span>}
            </span>
            <span className="text-xs text-ink-faint">{BOX_LABEL[store.boxes[q.n] ?? 1]} · {sectionOf(q.n).title}</span>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold leading-snug">{q.q}</p>
          <div className="mt-2">
            <QuestionAmharic n={q.n} show="question" />
          </div>
          {canSpeak() && (
            <button type="button" className="btn-quiet mt-4" onClick={() => speak(q.q, speechRate)}>
              ▶ <T k="study.listen" amClass="hidden" />
            </button>
          )}

          {!revealed ? (
            <button type="button" className="btn-primary mt-6 w-full" onClick={() => setRevealed(true)}>
              <T k="study.reveal" amClass="hidden" />
            </button>
          ) : (
            <>
              <div className="mt-6 rounded-lg bg-paper p-4">
                <AnswerList q={q} />
                <div className="mt-3">
                  <QuestionAmharic n={q.n} show="help" />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button type="button" className="btn-quiet border-wrong/30 py-3 text-wrong" onClick={() => grade(false)}>
                  <T k="study.notYet" amClass="text-xs" />
                </button>
                <button type="button" className="btn-quiet border-good/40 bg-good-50 py-3 text-good" onClick={() => grade(true)}>
                  <T k="study.knew" amClass="text-xs" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <p className="mt-4 text-center text-xs text-ink-faint">Cards you miss come back sooner. Cards you know come back less often.</p>
    </div>
  );
}
