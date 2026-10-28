"use client";
// Tsega's Amharic review screen (not linked for learners).
// Edits and approvals save straight into /content while running `npm run dev`.

import { useMemo, useState } from "react";
import amharic from "../../../content/amharic-questions.json";
import ui from "../../../content/ui.json";
import { QUESTIONS } from "@/lib/content";

type QItem = { q: string; help: string; reviewed: boolean };
type UItem = { en: string; am: string; reviewed: boolean };

function Row({ kind, id, english, fields, initial }: {
  kind: "question" | "ui";
  id: string;
  english: React.ReactNode;
  fields: { name: string; label: string; value: string }[];
  initial: boolean;
}) {
  const [values, setValues] = useState(Object.fromEntries(fields.map((f) => [f.name, f.value])));
  const [reviewed, setReviewed] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [dirty, setDirty] = useState(false);

  async function save(markReviewed: boolean) {
    setState("saving");
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, key: id, ...values, reviewed: markReviewed }),
    });
    if (res.ok) {
      setReviewed(markReviewed);
      setDirty(false);
      setState("saved");
    } else {
      setState("error");
    }
  }

  return (
    <li className={`card p-4 ${reviewed ? "border-good/40" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 text-sm">{english}</div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${reviewed ? "bg-good-50 text-good" : "bg-marigold-50 text-marigold-dark"}`}>
          {reviewed ? "Approved" : "Draft"}
        </span>
      </div>
      {fields.map((f) => (
        <div key={f.name} className="mt-3">
          <label htmlFor={`${kind}-${id}-${f.name}`} className="text-xs font-semibold text-ink-soft">{f.label}</label>
          <textarea
            id={`${kind}-${id}-${f.name}`}
            lang="am"
            rows={2}
            className="field mt-1 font-ethi text-[17px]"
            value={values[f.name]}
            onChange={(e) => {
              setValues({ ...values, [f.name]: e.target.value });
              setDirty(true);
              setState("idle");
            }}
          />
        </div>
      ))}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className="btn-primary px-4 py-2 text-sm" onClick={() => save(true)}>
          {dirty ? "Save and approve" : "Approve"}
        </button>
        {dirty && <button type="button" className="btn-quiet" onClick={() => save(reviewed)}>Save, keep as {reviewed ? "approved" : "draft"}</button>}
        {reviewed && !dirty && <button type="button" className="btn-quiet" onClick={() => save(false)}>Back to draft</button>}
        <span className="text-xs text-ink-soft" role="status">
          {state === "saving" ? "Saving…" : state === "saved" ? "Saved to content file" : state === "error" ? "Couldn't save. Is npm run dev running?" : ""}
        </span>
      </div>
    </li>
  );
}

export default function Review() {
  const [tab, setTab] = useState<"questions" | "screens">("questions");
  const [onlyDrafts, setOnlyDrafts] = useState(true);
  const qItems = amharic.items as Record<string, QItem>;
  const uItems = ui.items as Record<string, UItem>;
  const qDone = Object.values(qItems).filter((i) => i.reviewed).length;
  const uDone = Object.values(uItems).filter((i) => i.reviewed).length;

  const questions = useMemo(() => QUESTIONS.filter((q) => !onlyDrafts || !qItems[q.n]?.reviewed), [onlyDrafts]); // eslint-disable-line react-hooks/exhaustive-deps
  const screens = useMemo(() => Object.entries(uItems).filter(([, v]) => !onlyDrafts || !v.reviewed), [onlyDrafts]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Review Amharic</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Claude drafted every Amharic line. Learners only see a line after you approve it. Fix anything that reads wrong, then approve.
        Saving only works while the app runs on your computer with <code className="rounded bg-paper-200 px-1">npm run dev</code>.
      </p>
      <p className="mt-3 text-sm">
        <b>{qDone}/128</b> questions approved · <b>{uDone}/{Object.keys(uItems).length}</b> screen texts approved{" "}
        <span className="text-ink-faint">(counts update when you reload)</span>
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="inline-flex rounded-lg border border-line bg-white p-1 text-sm">
          {(["questions", "screens"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-md px-3 py-1.5 ${tab === t ? "bg-navy text-white" : "text-ink-soft"}`}>
              {t === "questions" ? "Civics questions" : "Screen text"}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input id="only-drafts" type="checkbox" className="h-4 w-4 accent-navy" checked={onlyDrafts} onChange={(e) => setOnlyDrafts(e.target.checked)} />
          Show drafts only
        </label>
      </div>

      <ul className="mt-6 space-y-4">
        {tab === "questions"
          ? questions.map((q) => (
              <Row
                key={q.n}
                kind="question"
                id={String(q.n)}
                initial={qItems[q.n].reviewed}
                english={
                  <>
                    <p className="font-semibold"><span className="qnum mr-1">{q.n}.</span>{q.q}</p>
                    <p className="mt-1 text-ink-soft">Answers: {q.a.join(" · ")}</p>
                  </>
                }
                fields={[
                  { name: "q", label: "Question in Amharic", value: qItems[q.n].q },
                  { name: "help", label: "Explanation in Amharic", value: qItems[q.n].help },
                ]}
              />
            ))
          : screens.map(([key, item]) => (
              <Row
                key={key}
                kind="ui"
                id={key}
                initial={item.reviewed}
                english={<p><span className="font-mono text-xs text-ink-faint">{key}</span><br />{item.en}</p>}
                fields={[{ name: "am", label: "Amharic", value: item.am }]}
              />
            ))}
      </ul>
      {((tab === "questions" && !questions.length) || (tab === "screens" && !screens.length)) && (
        <p className="mt-8 text-center text-ink-soft">Everything here is approved. 🎉</p>
      )}
    </div>
  );
}
