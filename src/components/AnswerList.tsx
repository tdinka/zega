"use client";

import Link from "next/link";
import { T } from "./Amharic";
import { displayAnswers, OFFICIALS, type Question } from "@/lib/content";
import { useStore } from "@/lib/store";
import { speak } from "@/lib/speech";

/** The official answers for a question, resolved for where the learner lives. */
export default function AnswerList({ q, compact }: { q: Question; compact?: boolean }) {
  const [store] = useStore();
  const { place, mine, speechRate } = store.settings;
  const answers = displayAnswers(q, place, mine);
  const need = q.count ?? 1;

  return (
    <div>
      {!compact && (
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow"><T k="common.officialAnswers" amClass="hidden" /></p>
          {need > 1 && <p className="text-xs font-semibold text-navy">Give {need} answers</p>}
        </div>
      )}

      {q.kind === "state" && answers.length === 0 && (
        <p className="mt-2 text-sm text-ink-soft">
          This depends on where you live. <Link href="/start" className="font-medium text-navy underline">Add your answer in Settings</Link>.
        </p>
      )}

      {answers.length > 0 && (
        <ul className={`${compact ? "" : "mt-2"} space-y-1.5`}>
          {answers.map((a) => (
            <li key={a} className="flex items-start gap-2 text-[15px] leading-snug">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-navy" />
              <span className="min-w-0 flex-1">{a}</span>
              {!compact && (
                <button
                  type="button"
                  onClick={() => speak(a, speechRate)}
                  className="flex-none text-xs text-ink-faint hover:text-navy"
                  aria-label={`Hear "${a}"`}
                >
                  ▶
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {q.kind === "current" && (
        <p className="mt-2 text-xs text-ink-soft">
          <T k="common.checkCurrent" amClass="text-xs" /> Answer as of {OFFICIALS.asOf}.
        </p>
      )}
      {q.kind === "state" && q.stateField !== "capital" && answers.length > 0 && (
        <p className="mt-2 text-xs text-ink-faint">Your own answer from Settings. Check it again before your interview.</p>
      )}
      {q.note && !compact && <p className="mt-2 text-xs text-ink-soft">{q.note}</p>}
      {!compact && <p className="mt-2 text-xs text-ink-faint">Words in (parentheses) are optional.</p>}
    </div>
  );
}
