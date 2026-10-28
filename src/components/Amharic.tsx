"use client";
// Shows Amharic only when it's allowed: approved by Tsega, or on her own
// computer while she reviews drafts (then it carries a DRAFT label).

import { createContext, useContext } from "react";
import ui from "../../content/ui.json";
import { AMHARIC } from "@/lib/content";
import { FREE_AMHARIC_UP_TO } from "@/lib/config";
import { isUnlocked, useStore } from "@/lib/store";

export const DraftsContext = createContext(false);

type UiItem = { en: string; am: string; reviewed: boolean };
const UI = ui.items as Record<string, UiItem>;

function Draft() {
  return (
    <span className="ml-1.5 inline-block rounded bg-marigold-50 px-1 align-middle font-sans text-[10px] font-semibold uppercase tracking-wide text-marigold-dark">
      draft
    </span>
  );
}

/** English text with its Amharic line underneath (when available). */
export function T({ k, className, amClass, approvedOnly, as: Tag = "span" }: { k: string; className?: string; amClass?: string; approvedOnly?: boolean; as?: "span" | "p" | "h1" | "h2" | "h3" }) {
  const drafts = useContext(DraftsContext);
  const [store, , ready] = useStore();
  const item = UI[k];
  if (!item) return <Tag className={className}>{k}</Tag>;
  const showAm = ready && store.settings.amharic && item.am && (item.reviewed || (drafts && !approvedOnly));
  return (
    <Tag className={className}>
      {item.en}
      {showAm && (
        <span lang="am" className={`mt-0.5 block font-ethi text-[0.85em] font-normal leading-snug text-ink-soft ${amClass ?? ""}`}>
          {item.am}
          {!item.reviewed && <Draft />}
        </span>
      )}
    </Tag>
  );
}

/** Plain English string for places where only text fits (placeholders, labels). */
export function en(k: string): string {
  return UI[k]?.en ?? k;
}

/** The Amharic translation and help for one civics question, if it may be shown. */
export function QuestionAmharic({ n, show, ignoreLock }: { n: number; show: "question" | "help" | "both"; ignoreLock?: boolean }) {
  const drafts = useContext(DraftsContext);
  const [store, , ready] = useStore();
  const item = AMHARIC[String(n)];
  if (!ready || !store.settings.amharic || !item) return null;
  if (!item.reviewed && !drafts) return null;
  if (!ignoreLock && !isUnlocked(store) && n > FREE_AMHARIC_UP_TO) {
    return show === "question" ? null : (
      <p className="mt-2 text-sm text-ink-faint">
        <a href="/unlock" className="underline">Unlock</a> to see the Amharic explanation for every question.
      </p>
    );
  }
  return (
    <div lang="am" className="font-ethi text-ink-soft">
      {(show === "question" || show === "both") && (
        <p className="leading-relaxed">
          {item.q}
          {!item.reviewed && <Draft />}
        </p>
      )}
      {(show === "help" || show === "both") && (
        <p className="mt-1 text-[0.95em] leading-relaxed">
          {item.help}
          {!item.reviewed && show === "help" && <Draft />}
        </p>
      )}
    </div>
  );
}
