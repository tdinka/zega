// Plain-language privacy notice. Reviewed Oct 28, 2026 (not by a lawyer). Keep it true: update it if analytics or accounts are ever added.
import { APP_NAME, LEGAL_UPDATED, SUPPORT_EMAIL } from "@/lib/config";

export const metadata = { title: `Privacy | ${APP_NAME}` };

export default function Privacy() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_p]:mt-3 [&_p]:text-ink-soft">
      <h1 className="font-display text-3xl font-semibold">Privacy</h1>
      <p className="text-sm">Last updated {LEGAL_UPDATED}.</p>

      <h2>No account needed</h2>
      <p>{APP_NAME} doesn't ask for your name, your immigration details or your case number. Your study progress, your settings and the names you type for your senator, representative and governor stay in your own browser. We never see them. Clearing your browser's data deletes them.</p>

      <h2>Your voice</h2>
      <p>When you answer out loud, your browser turns your speech into text. Depending on your browser, that may be done by Apple, Google or Microsoft under their own privacy policies. {APP_NAME} never receives your recording. It only uses the text, and only on your device.</p>

      <h2>Payments</h2>
      <p>Stripe handles payment. We never see your card number. We keep your unlock code, the payment reference and the email address you gave Stripe, so we can confirm your code, send help and handle refunds. We keep these records for as long as the law requires for tax and accounting.</p>

      <h2>Our servers</h2>
      <p>Like most websites, our hosting provider records basic technical information (such as your IP address and the pages requested) to keep the site running and secure. We don't use advertising trackers or analytics cookies.</p>

      <h2>What we don't do</h2>
      <p>We don't sell or share your personal information, and we don't use it for advertising. {APP_NAME} is meant for adults preparing for their naturalization interview and is not directed at children under 13.</p>

      <h2>Your choices</h2>
      <p>Email us to ask what we hold about you or to delete it. We'll answer within 30 days.</p>

      <h2>Contact</h2>
      <p><span className="select-all">{SUPPORT_EMAIL}</span></p>
    </article>
  );
}
