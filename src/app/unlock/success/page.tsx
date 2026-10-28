"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";

// Reads the query string directly (see CLAUDE.md: useSearchParams + Suspense trap).
export default function UnlockSuccess() {
  const [, update] = useStore();
  const [code, setCode] = useState<string | null>(null);
  const [simulated, setSimulated] = useState(false);
  const [message, setMessage] = useState("Confirming your payment…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const direct = params.get("code");
    setSimulated(params.get("simulated") === "1");
    const body = sessionId ? { sessionId } : { code: direct };
    let tries = 0;

    async function check() {
      tries++;
      const res = await fetch("/api/unlock/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setCode(data.code);
        update((s) => ({ ...s, unlock: { code: data.code, checkedAt: new Date().toISOString() } }));
      } else if (res.status === 202 && tries < 6) {
        setTimeout(check, 2000);
      } else {
        setMessage(data.error || "We couldn't confirm the payment. If you were charged, your code is on your Stripe receipt.");
      }
    }
    void check();
  }, [update]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code ?? "");
    } catch {
      /* the code is selectable on the page */
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      {code ? (
        <div className="card p-6 text-center">
          <p className="text-4xl" aria-hidden>★</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">You're unlocked</h1>
          {simulated && <p className="mt-2 rounded bg-marigold-50 px-2 py-1 text-xs">Test mode: no real payment was taken.</p>}
          <p className="mt-4 text-ink-soft">Save your unlock code. Use it to unlock Zega on another phone or computer.</p>
          <p className="mt-3 select-all rounded-lg bg-paper px-4 py-3 font-mono text-2xl font-semibold tracking-wider">{code}</p>
          <button type="button" className="btn-quiet mt-3" onClick={copy}>Copy code</button>
          <Link href="/study" className="btn-primary mt-6 w-full">Start studying</Link>
        </div>
      ) : (
        <p className="text-center text-ink-soft" role="status">{message}</p>
      )}
    </div>
  );
}
