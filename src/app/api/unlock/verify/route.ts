// POST /api/unlock/verify — checks an unlock code, or confirms a just-finished Stripe checkout.
import { NextResponse } from "next/server";
import { stripeEnabled } from "@/lib/config";
import { cleanCode, markPaid, prisma, stripe } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Coming back from Stripe: confirm the payment now rather than waiting for the webhook.
  if (body.sessionId && stripeEnabled()) {
    try {
      const s = await stripe().checkout.sessions.retrieve(String(body.sessionId));
      if (s.payment_status === "paid") {
        const pi = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id ?? null;
        await markPaid(s.id, pi, s.customer_details?.email ?? null);
      }
      const p = await prisma.purchase.findUnique({ where: { stripeSessionId: s.id } });
      if (p?.status === "paid") return NextResponse.json({ ok: true, code: p.code });
      return NextResponse.json({ ok: false, error: "We're still confirming your payment. Refresh in a moment." }, { status: 202 });
    } catch {
      return NextResponse.json({ ok: false, error: "We couldn't find that checkout." }, { status: 400 });
    }
  }

  const code = cleanCode(String(body.code || ""));
  if (!code) return NextResponse.json({ ok: false, error: "Unlock codes look like ZEGA-AB12-CD34." }, { status: 400 });
  const p = await prisma.purchase.findUnique({ where: { code } });
  if (!p || p.status !== "paid") return NextResponse.json({ ok: false, error: "That code isn't valid. Check it on your receipt." }, { status: 404 });
  return NextResponse.json({ ok: true, code });
}
