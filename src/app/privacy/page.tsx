// TODO before launch: have this reviewed alongside the terms.
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/config";

export const metadata = { title: `Privacy | ${APP_NAME}` };

export default function Privacy() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_p]:mt-3 [&_p]:text-ink-soft">
      <h1 className="font-display text-3xl font-semibold">Privacy</h1>
      <h2>No account needed</h2>
      <p>{APP_NAME} doesn't ask for your name, your immigration details or your case number. Your study progress, your settings and the names you type for your senator, representative and governor stay in your own browser.</p>
      <h2>Your voice</h2>
      <p>When you answer out loud, your browser turns your speech into text. Depending on your browser, that may be done by Apple, Google or Microsoft. {APP_NAME} only receives the text, and only keeps it on your device.</p>
      <h2>Payments</h2>
      <p>Stripe handles payment. We store your unlock code, the payment reference and the email Stripe gives us, so we can confirm your code and help with refunds. We never see your card number.</p>
      <h2>Contact</h2>
      <p><span className="select-all">{SUPPORT_EMAIL}</span></p>
    </article>
  );
}
