# Zega — notes for Claude Code

U.S. citizenship (2025 civics test) prep for Amharic speakers. Study, practice tests with the real stop rules, spoken mock interview, Amharic help. Built from the "Copyable app ideas" research (idea #2, citizenship-test prep in underserved languages).

## Decisions already made
- Web first (mobile-friendly, installable). No native app yet.
- 2025 test only (N-400 filed on or after Oct 20, 2025), plus the 65/20 version. The 2008 test and reading/writing tests are not built.
- $19.99 one-time unlock via Stripe Checkout; unlock code shown after payment and printed on the Stripe receipt. No accounts. Progress lives in localStorage.
- Free: all questions, flashcards, Amharic for Q1–15, one practice test.
- **The official question and answer text in `content/civics-2025.json` is never reworded.** It matches USCIS Form M-1778 (09/25). Only update it to match a newer USCIS version, then run `npm run check:content`.
- Current officeholders live only in `content/officials.json` (with an `asOf` date). Senators, representative and governor are never stored by us; learners type their own.
- Working name "Zega" (ዜጋ), set in `src/lib/config.ts`.

## Amharic rules (important)
- **Tsega is the Amharic reviewer.** Every Amharic item has `"reviewed": false` until she approves it at `/review` (dev only).
- Unreviewed Amharic is never shown on the live site (`showDrafts()` is false in production). In dev it shows with a DRAFT label.
- Tsega can also review online (no setup) at https://claude.ai/artifact/CWhK3XwH4xMkPTuqdkJjyw. Its database (collection "items", ids "q-<n>" and "ui-<key>") holds her edits and approvals; when she says "sync the review", copy q/help/am text and reviewed flags from there into content/amharic-questions.json and content/ui.json, then run npm run check:content.
- Never mark Amharic as reviewed yourself. When unsure about Amharic, add the question to `docs/questions-for-tsega.md` instead of guessing.
- Dates in Amharic use Gregorian month names (ጁላይ, ሴፕቴምበር), not Ethiopian months, because the dates are Gregorian.
- The test is in English: Amharic explains; the learner always practices the English answer.

## Stack (same as Recipe Box and Plainfax)
- Next.js 14 (App Router, TypeScript) + Tailwind. Fonts are self-hosted @fontsource packages (Source Serif 4, Public Sans, Noto Sans Ethiopic).
- Postgres + Prisma 5, only for the `Purchase` table. Use `prisma db push`, never `prisma migrate dev`.
- Tailwind color for right answers is `good` (not `right`: `text-right` is the alignment utility).

## Where things are
- `src/lib/match.ts`: forgiving answer checker (optional parentheses, number words, small typos, "vice president" is never "president"). Add a test case in `scripts/check-content.ts` for every fix.
- `src/lib/quiz.ts`: builds tests, applies stop rules (`verdict`), makes multiple-choice options without second correct answers.
- `src/lib/store.ts`: localStorage store (settings, flashcard boxes, test history, unlock).
- `src/components/TestRunner.tsx`: practice test and mock interview.
- `src/app/review` + `src/app/api/review`: Amharic review screen; writes to /content only when NODE_ENV=development.

## Working with Tsega
- She is early in her technical journey: explain every terminal command before running it, one step at a time, in plain words.
- Git: she commits and pushes through GitHub Desktop. Don't run `git commit`/`git push` unless she asks; tell her what to look for in the diff.
- Mention open items in `docs/questions-for-tsega.md` at the start of a session, and move items to "Answered" when she decides.
- Back up `.env` before any file reorganizing.
- Next.js 14.2 trap: `useSearchParams` + `Suspense` + `force-dynamic` in a Server Component can stack-overflow; read `window.location.search` instead (as `/unlock/success` does).
- `export const dynamic = "force-dynamic"` does nothing in Client Components.

## Hosting (Railway, set up Oct 28, 2026)
- Railway project "zega": service `zega` (auto-deploys from GitHub tdinka/zega on every push) + `Postgres`.
- Test site: https://zega-production.up.railway.app (port 8080).
- Custom start command (set in Railway, not in the repo): `npx prisma db push --skip-generate && npm start`, so the Purchase table is created/updated on each deploy.
- Variables: DATABASE_URL=${{Postgres.DATABASE_URL}}, APP_URL, ALLOW_SIMULATED_PAYMENTS=1 (test mode: free unlocks). **Remove ALLOW_SIMULATED_PAYMENTS and add the Stripe keys before real launch.**
