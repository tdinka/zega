// One place for the name and price, so renaming or repricing is a one-line change.

export const APP_NAME = "Zega"; // ዜጋ = "citizen" in Amharic. Name confirmed by Tsega, Oct 28, 2026.
export const APP_NAME_AM = "ዜጋ";
export const PRICE_CENTS = 1999;
export const PRICE_LABEL = "$19.99";
export const SUPPORT_EMAIL = "zega.support@gmail.com";
/** Who runs Zega, shown in the Terms. Same setup as Plainfax: Tsega as an individual. */
export const OPERATOR_NAME = "Tsega Dinka";
export const OPERATOR_LOCATION = "Los Angeles, California";
/** U.S. state whose law governs the Terms. */
export const GOVERNING_STATE = "California";
export const REFUND_DAYS = 30;
export const LEGAL_UPDATED = "October 28, 2026";

/** Free learners can see Amharic help for questions 1 to this number. */
export const FREE_AMHARIC_UP_TO = 15;

export function appUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Show Amharic Tsega hasn't approved yet? Only on her own computer
 * (npm run dev) or when SHOW_AMHARIC_DRAFTS=1. Never on the live site.
 */
export function showDrafts(): boolean {
  return process.env.NODE_ENV === "development" || process.env.SHOW_AMHARIC_DRAFTS === "1";
}
