"use client";

import Link from "next/link";
import { T } from "@/components/Amharic";
import { poolFor, SECTIONS, TEST_INFO } from "@/lib/content";
import { isUnlocked, useStore } from "@/lib/store";

export default function Progress() {
  const [store, update, ready] = useStore();
  if (!ready) return <div className="mx-auto max-w-2xl px-4 py-10 text-ink-soft">Loading…</div>;

  const { test } = store.settings;
  const pool = poolFor(test);
  const box = (n: number) => store.boxes[n] ?? 1;
  const known = pool.filter((q) => box(q.n) >= 4).length;
  const recent = store.tests.filter((t) => t.test === test).slice(-3);
  const testScore = recent.length
    ? recent.reduce((s, t) => s + t.correct / Math.max(1, t.correct + t.wrong), 0) / recent.length
    : 0;
  // Readiness: 60% how many cards you know well, 40% your last three tests.
  const readiness = Math.round((known / pool.length) * 60 + testScore * 40);
  const lastPassed = recent.length > 0 && recent[recent.length - 1].passed;
  const verdict =
    readiness >= 85 && lastPassed
      ? ["You look ready.", "Keep doing a practice test every day until your interview."]
      : readiness >= 60
        ? ["Getting close.", "Focus on the sections below that aren't full yet."]
        : ["Keep going.", "Study a few flashcards every day, then try practice tests."];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <T k="progress.title" as="h1" className="block font-display text-3xl font-semibold" amClass="text-lg" />
      <p className="mt-1 text-sm text-ink-soft">{TEST_INFO[test].label} · <Link href="/start" className="underline">Settings</Link></p>

      <div className="card mt-6 grid gap-6 p-6 sm:grid-cols-[auto,1fr] sm:items-center">
        <div className="relative mx-auto h-36 w-36">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E8ECF2" strokeWidth="3.2" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#D9961A" strokeWidth="3.2" strokeLinecap="round" strokeDasharray={`${readiness} 100`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-semibold tabular-nums">{readiness}%</span>
            <span className="text-xs text-ink-soft"><T k="progress.readiness" amClass="text-[10px]" /></span>
          </div>
        </div>
        <div>
          <p className="font-display text-xl font-semibold">{verdict[0]}</p>
          <p className="mt-1 text-sm text-ink-soft">{verdict[1]}</p>
          <p className="mt-3 text-sm">
            <b className="tabular-nums">{known}</b> of {pool.length} cards known well ·{" "}
            <b className="tabular-nums">{store.tests.filter((t) => t.test === test).length}</b> tests taken
          </p>
          {!isUnlocked(store) && <p className="mt-2 text-xs text-ink-faint">The readiness score is part of the unlocked version, shown here as a preview.</p>}
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl font-semibold">By section</h2>
      <ul className="mt-4 space-y-3">
        {SECTIONS.map((s) => {
          const qs = pool.filter((q) => q.n >= s.from && q.n <= s.to);
          if (!qs.length) return null;
          const k = qs.filter((q) => box(q.n) >= 4).length;
          return (
            <li key={s.id}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0"><span className="text-ink-soft">{s.group}:</span> {s.title}</span>
                <span className="tabular-nums text-ink-soft">{k}/{qs.length}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-200">
                <div className="h-full rounded-full bg-navy" style={{ width: `${(k / qs.length) * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>

      {recent.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-xl font-semibold">Recent tests</h2>
          <ul className="card mt-4 divide-y divide-line">
            {store.tests.filter((t) => t.test === test).slice(-8).reverse().map((t) => (
              <li key={t.at} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span>{new Date(t.at).toLocaleDateString()} · {t.mode === "interview" ? "Mock interview" : "Practice test"}</span>
                <span className={`font-semibold ${t.passed ? "text-good" : "text-wrong"}`}>{t.passed ? "Passed" : "Not passed"} · {t.correct}/{t.correct + t.wrong}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/study" className="btn-primary">Study flashcards</Link>
        <Link href="/practice" className="btn-quiet">Practice test</Link>
        <button
          type="button"
          className="btn-quiet text-wrong"
          onClick={() => {
            const box = document.getElementById("confirm-reset");
            if (box) box.hidden = !box.hidden;
          }}
        >
          Start over
        </button>
      </div>
      <div id="confirm-reset" hidden className="mt-3 rounded-lg border border-wrong/30 bg-wrong-50 p-4 text-sm">
        <p>Clear all flashcard progress and test history on this device?</p>
        <button type="button" className="btn-quiet mt-2 text-wrong" onClick={() => update((s) => ({ ...s, boxes: {}, tests: [] }))}>
          Yes, clear my progress
        </button>
      </div>
      <p className="mt-6 text-xs text-ink-faint">Your progress is saved in this browser only. It won't move to another phone or computer.</p>
    </div>
  );
}
