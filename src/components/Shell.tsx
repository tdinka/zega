"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DraftsContext, T } from "./Amharic";
import { APP_NAME, APP_NAME_AM, SUPPORT_EMAIL } from "@/lib/config";
import { isUnlocked, useStore } from "@/lib/store";

const NAV = [
  ["/study", "nav.study"],
  ["/practice", "nav.practice"],
  ["/interview", "nav.interview"],
  ["/questions", "nav.questions"],
  ["/progress", "nav.progress"],
] as const;

function Wordmark() {
  return (
    <Link href="/" className="flex items-baseline gap-2 font-display text-xl font-semibold tracking-tight text-navy">
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 self-center fill-marigold">
        <path d="M12 2l3 6.2 6.8 1-4.9 4.8 1.2 6.8L12 17.6l-6.1 3.2 1.2-6.8L2.2 9.2l6.8-1z" />
      </svg>
      {APP_NAME}
      <span lang="am" className="font-ethi text-base font-normal text-ink-soft">
        {APP_NAME_AM}
      </span>
    </Link>
  );
}

export default function Shell({ drafts, children }: { drafts: boolean; children: React.ReactNode }) {
  const path = usePathname();
  const [store, , ready] = useStore();
  const unlocked = ready && isUnlocked(store);
  const isActive = (href: string) => path === href || path.startsWith(`${href}/`);

  return (
    <DraftsContext.Provider value={drafts}>
      {drafts && (
        <div className="bg-marigold-50 px-4 py-1.5 text-center text-xs text-ink">
          Review mode: Amharic you haven't approved yet is shown with a <b>DRAFT</b> label. The live site hides it.{" "}
          <Link href="/review" className="font-semibold underline">Review Amharic</Link>
        </div>
      )}
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-20 border-b border-line bg-paper-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Wordmark />
          <nav className="hidden items-center gap-5 text-sm md:flex">
            {NAV.map(([href, k]) => (
              <Link key={href} href={href} className={isActive(href) ? "font-semibold text-navy" : "text-ink-soft hover:text-ink"}>
                <T k={k} amClass="hidden" />
              </Link>
            ))}
            <Link href="/start" aria-label="Settings" className={isActive("/start") ? "text-navy" : "text-ink-soft hover:text-ink"}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
              </svg>
            </Link>
          </nav>
          {!unlocked && (
            <Link href="/unlock" className="hidden rounded-full bg-marigold-50 px-3 py-1 text-xs font-semibold text-marigold-dark hover:bg-marigold/20 sm:inline-block md:hidden lg:inline-block">
              Unlock all
            </Link>
          )}
        </div>
      </header>

      <main className="pb-24 md:pb-0">{children}</main>

      <footer className="mt-16 border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-ink-soft sm:px-6">
          <T k="common.disclaimer" as="p" />
          <p>
            Questions and answers come from the official USCIS 2025 civics test (Form M-1778).{" "}
            <Link href="/terms" className="underline">Terms</Link> · <Link href="/privacy" className="underline">Privacy</Link> · Help:{" "}
            <span className="select-all">{SUPPORT_EMAIL}</span>
          </p>
        </div>
      </footer>

      {/* Phone tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {NAV.map(([href, k]) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center px-1 py-2.5 text-center text-[11px] leading-tight ${isActive(href) ? "font-semibold text-navy" : "text-ink-soft"}`}
            >
              <T k={k} amClass="text-[10px]" approvedOnly />
            </Link>
          ))}
        </div>
      </nav>
    </DraftsContext.Provider>
  );
}
