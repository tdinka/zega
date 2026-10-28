// Plain-language terms. Reviewed Oct 28, 2026 (not by a lawyer).
import { APP_NAME, GOVERNING_STATE, LEGAL_UPDATED, OPERATOR_LOCATION, OPERATOR_NAME, PRICE_LABEL, REFUND_DAYS, SUPPORT_EMAIL } from "@/lib/config";

export const metadata = { title: `Terms | ${APP_NAME}` };

export default function Terms() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_p]:mt-3 [&_p]:text-ink-soft">
      <h1 className="font-display text-3xl font-semibold">Terms of use</h1>
      <p className="text-sm">Last updated {LEGAL_UPDATED}. {APP_NAME} is run by {OPERATOR_NAME}, an individual based in {OPERATOR_LOCATION}. By using {APP_NAME}, you agree to these terms.</p>

      <h2>Not legal advice, not the government</h2>
      <p>{APP_NAME} is a study tool. It is not affiliated with or endorsed by U.S. Citizenship and Immigration Services (USCIS) or any government agency, and it does not give legal or immigration advice. For questions about your case, talk to USCIS or a qualified immigration attorney or accredited representative.</p>

      <h2>The questions and the Amharic</h2>
      <p>The civics questions and answers come from the official USCIS list for the 2025 civics test. Some answers change with elections. Always check uscis.gov/citizenship/testupdates before your interview.</p>
      <p>The Amharic translations and explanations are there to help you understand. The civics test is given in English, and the official English questions and answers are the ones that count.</p>

      <h2>No guarantee</h2>
      <p>Studying with {APP_NAME} can help you prepare, but we can't guarantee you will pass. The officer decides at your interview. We work hard to keep {APP_NAME} accurate and available, but it is provided "as is", and it may sometimes have mistakes or be unavailable.</p>

      <h2>Payment and refunds</h2>
      <p>The unlocked version costs {PRICE_LABEL}, paid once. There is no subscription. If you're unhappy for any reason within {REFUND_DAYS} days of paying, email us and we'll refund you in full. After a refund, your unlock code stops working.</p>
      <p>Your unlock code is for you and your own devices. Please don't share or sell it.</p>

      <h2>Limits on our responsibility</h2>
      <p>To the extent the law allows, {OPERATOR_NAME} is not responsible for indirect or consequential losses from using {APP_NAME}, including the outcome of your interview, and our total responsibility to you is limited to what you paid us.</p>

      <h2>Changes</h2>
      <p>We may update these terms. If we make a big change, we'll show the new date at the top of this page. These terms are governed by the laws of the State of {GOVERNING_STATE}.</p>

      <h2>Contact</h2>
      <p><span className="select-all">{SUPPORT_EMAIL}</span></p>
    </article>
  );
}
