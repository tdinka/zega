"use client";

import { useMemo, useState } from "react";
import { QuestionAmharic, T } from "@/components/Amharic";
import AnswerList from "@/components/AnswerList";
import { QUESTIONS, SECTIONS, SOURCE } from "@/lib/content";

export default function Questions() {
  const [query, setQuery] = useState("");
  const [starOnly, setStarOnly] = useState(false);
  const q = query.trim().toLowerCase();

  const visible = useMemo(
    () =>
      QUESTIONS.filter(
        (x) => (!starOnly || x.star) && (!q || x.q.toLowerCase().includes(q) || x.a.some((a) => a.toLowerCase().includes(q)) || String(x.n) === q),
      ),
    [q, starOnly],
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <T k="questions.title" as="h1" className="block font-display text-3xl font-semibold" amClass="text-lg" />
      <p className="mt-2 text-sm text-ink-soft">
        From the official USCIS list ({SOURCE.form}). {SOURCE.appliesTo}.
      </p>

      <div className="sticky top-[calc(env(safe-area-inset-top,0px)+57px)] z-10 -mx-4 mt-6 flex flex-wrap items-center gap-3 bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <input
          id="search"
          type="search"
          className="field min-w-0 flex-1"
          placeholder="Search questions or answers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input id="star-only" type="checkbox" className="h-4 w-4 accent-navy" checked={starOnly} onChange={(e) => setStarOnly(e.target.checked)} />
          ★ 65/20 only
        </label>
      </div>

      {SECTIONS.map((section) => {
        const items = visible.filter((x) => x.n >= section.from && x.n <= section.to);
        if (!items.length) return null;
        return (
          <section key={section.id} className="mt-8">
            <p className="eyebrow">{section.group}</p>
            <h2 className="mt-1 font-display text-xl font-semibold">{section.title}</h2>
            <ol className="mt-4 space-y-3">
              {items.map((x) => (
                <li key={x.n} className="card p-4 sm:p-5">
                  <details>
                    <summary className="flex cursor-pointer list-none gap-3 marker:hidden">
                      <span className="qnum w-9 flex-none pt-0.5">{x.n}.{x.star && <span className="text-marigold-dark">★</span>}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium leading-snug">{x.q}</span>
                        <span className="mt-1 block text-sm">
                          <QuestionAmharic n={x.n} show="question" />
                        </span>
                      </span>
                      <span aria-hidden className="text-ink-faint">+</span>
                    </summary>
                    <div className="mt-4 pl-12">
                      <AnswerList q={x} />
                      <div className="mt-3">
                        <QuestionAmharic n={x.n} show="help" />
                      </div>
                    </div>
                  </details>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
      {!visible.length && <p className="mt-10 text-center text-ink-soft">No questions match “{query}”.</p>}
    </div>
  );
}
