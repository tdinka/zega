// POST /api/webhooks/stripe — Stripe confirms payments and refunds here.
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { markPaid, prisma, stripe } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, req.headers.get("stripe-signature") || "", secret);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.payment_status === "paid") {
      const pi = typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id ?? null;
      await markPaid(s.id, pi, s.customer_details?.email ?? null);
    }
  }
  if (event.type === "charge.refunded") {
    const c = event.data.object as Stripe.Charge;
    const pi = typeof c.payment_intent === "string" ? c.payment_intent : c.payment_intent?.id;
    if (pi) await prisma.purchase.updateMany({ where: { paymentIntent: pi }, data: { status: "refunded" } });
  }
  return NextResponse.json({ received: true });
}
