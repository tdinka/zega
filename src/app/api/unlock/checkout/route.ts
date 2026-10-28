// POST /api/unlock/checkout — starts a $19.99 one-time purchase.
// With Stripe keys: returns a Stripe Checkout link. Without: simulates payment.
import { NextResponse } from "next/server";
import { APP_NAME, PRICE_CENTS, appUrl, stripeEnabled } from "@/lib/config";
import { newCode, prisma, stripe } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const code = newCode();
  if (!stripeEnabled()) {
    // Simulated payment is for trying the app. Never hand out free codes on the live site by accident.
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_SIMULATED_PAYMENTS !== "1") {
      return NextResponse.json({ error: "Payments aren't set up yet." }, { status: 503 });
    }
    await prisma.purchase.create({ data: { code, status: "paid", amountCents: 0, paidAt: new Date() } });
    return NextResponse.json({ url: `/unlock/success?code=${code}&simulated=1` });
  }
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: PRICE_CENTS,
            product_data: {
              name: `${APP_NAME}: full citizenship test prep`,
              description: "One-time payment. Amharic help for every question, unlimited practice tests and the spoken mock interview.",
            },
          },
        },
      ],
      // The code also appears on the Stripe receipt, so buyers can find it later.
      payment_intent_data: { description: `${APP_NAME} unlock code: ${code}`, metadata: { code } },
      metadata: { code },
      success_url: `${appUrl()}/unlock/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/unlock`,
    });
    await prisma.purchase.create({ data: { code, stripeSessionId: session.id, amountCents: PRICE_CENTS } });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout failed", err);
    return NextResponse.json({ error: "We couldn't start checkout. Please try again." }, { status: 500 });
  }
}
