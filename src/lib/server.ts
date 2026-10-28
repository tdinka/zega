// Server-only helpers: database, Stripe and unlock codes.
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { randomInt } from "crypto";

const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;

let client: Stripe | null = null;
export function stripe(): Stripe {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  return client;
}

// No 0/O or 1/I/L, so codes are easy to read aloud and type.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export function newCode(): string {
  const part = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `ZEGA-${part()}-${part()}`;
}

export function cleanCode(input: string): string {
  const raw = (input || "").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^ZEGA/, "");
  return raw.length === 8 ? `ZEGA-${raw.slice(0, 4)}-${raw.slice(4)}` : "";
}

export async function markPaid(sessionId: string, paymentIntent: string | null, email: string | null) {
  await prisma.purchase.updateMany({
    where: { stripeSessionId: sessionId, status: "pending" },
    data: { status: "paid", paidAt: new Date(), paymentIntent, email },
  });
}
