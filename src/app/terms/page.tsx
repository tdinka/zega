// TODO before launch: have these terms reviewed (a lawyer or a reputable template service).
import { APP_NAME, PRICE_LABEL, SUPPORT_EMAIL } from "@/lib/config";

export const metadata = { title: `Terms | ${APP_NAME}` };

export default function Terms() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_p]:mt-3 [&_p]:text-ink-soft">
      <h1 className="font-display text-3xl font-semibold">Terms of use</h1>
      <h2>Not legal advice, not the government</h2>
      <p>{APP_NAME} is a study tool. It is not affiliated with U.S. Citizenship and Immigration Services (USCIS) or any government agency, and it does not give legal or immigration advice. For questions about your case, talk to USCIS or a qualified immigration attorney.</p>
      <h2>The questions</h2>
      <p>The civics questions and answers come from the official USCIS list for the 2025 civics test. Some answers change with elections. Always check uscis.gov/citizenship/testupdates before your interview.</p>
      <h2>No guarantee</h2>
      <p>Studying with {APP_NAME} can help you prepare, but we can't guarantee you will pass. The officer decides at your interview.</p>
      <h2>Payment</h2>
      <p>The unlocked version costs {PRICE_LABEL}, paid once. There is no subscription. If you're unhappy within 30 days, email us for a refund.</p>
      <h2>Contact</h2>
      <p><span className="select-all">{SUPPORT_EMAIL}</span></p>
    </article>
  );
}
