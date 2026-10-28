"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T } from "@/components/Amharic";
import { PRICE_LABEL } from "@/lib/config";
import { isUnlocked, useStore } from "@/lib/store";

const INCLUDED = [
  "Amharic translation and explanation for all 128 questions",
  "Unlimited practice tests that follow the real USCIS rules",
  "Spoken mock interview: the officer reads, you answer out loud",
  "Readiness score and progress by section",
  "Works on your phone, tablet and computer",
];

export default function Unlock() {
  const router = useRouter();
  const [store, update, ready] = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeMsg, setCodeMsg] = useState<string | null>(null);

  async function buy() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/unlock/checkout", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Checkout didn't start.");
      if (body.url.startsWith("/")) router.push(body.url);
      else window.location.href = body.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout didn't start.");
      setBusy(false);
    }
  }

  async function redeem(e: React.FormEvent) {
    e.preventDefault();
    setCodeMsg(null);
    const res = await fetch("/api/unlock/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.ok) {
      update((s) => ({ ...s, unlock: { code: body.code, checkedAt: new Date().toISOString() } }));
      setCodeMsg("Unlocked on this device.");
    } else {
      setCodeMsg(body.error || "That code didn't work.");
    }
  }

  if (ready && isUnlocked(store)) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold">You're unlocked</h1>
        <p className="mt-2 text-ink-soft">Your code: <span className="select-all font-mono font-semibold">{store.unlock!.code}</span></p>
        <p className="mt-1 text-sm text-ink-faint">Use this code to unlock Zega on another phone or computer.</p>
        <Link href="/study" className="btn-primary mt-6">Keep studying</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <T k="unlock.title" as="h1" className="block font-display text-3xl font-semibold" amClass="text-lg" />
      <T k="unlock.body" as="p" className="mt-2 block text-ink-soft" amClass="text-sm" />

      <div className="card mt-6 p-6">
        <p className="font-display text-5xl font-semibold tabular-nums text-navy">{PRICE_LABEL}</p>
        <p className="text-sm text-ink-soft">one time · no subscription · nothing renews</p>
        <ul className="mt-5 space-y-2">
          {INCLUDED.map((x) => (
            <li key={x} className="flex gap-2 text-[15px]">
              <span aria-hidden className="text-good">✓</span>
              {x}
            </li>
          ))}
        </ul>
        <button type="button" className="btn-primary mt-6 w-full" onClick={buy} disabled={busy}>
          {busy ? "Starting checkout…" : `Unlock for ${PRICE_LABEL}`}
        </button>
        {error && <p role="alert" className="mt-3 text-sm text-wrong">{error}</p>}
        <p className="mt-3 text-center text-xs text-ink-faint">Secure payment by Stripe. You'll get an unlock code to use on any device.</p>
      </div>

      <form onSubmit={redeem} className="mt-8">
        <label htmlFor="code" className="label">Already paid? Enter your unlock code</label>
        <div className="flex gap-2">
          <input id="code" className="field min-w-0 flex-1 font-mono uppercase" placeholder="ZEGA-AB12-CD34" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
          <button type="submit" className="btn-quiet" disabled={!code.trim()}>Unlock</button>
        </div>
        {codeMsg && <p className="mt-2 text-sm text-ink-soft" role="status">{codeMsg}</p>}
        <p className="mt-2 text-xs text-ink-faint">Your code is on the payment receipt Stripe emailed you.</p>
      </form>
    </div>
  );
}
