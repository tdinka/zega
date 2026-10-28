# Zega (ዜጋ)

U.S. citizenship test prep with Amharic help. Learners study all 128 questions of the 2025 civics test, take practice tests that follow the real USCIS rules, and do a spoken mock interview. Every question is translated and explained in Amharic.

Zega is a working name (ዜጋ means "citizen"). Change it in `src/lib/config.ts`.

## What's built

- **Setup:** choose the 2025 test or the 65/20 test, pick a state, and type your own senator, representative and governor (with links to look them up).
- **Flashcards:** questions you miss come back sooner. Every question can be read aloud.
- **All questions:** the full official list with search and a 65/20 filter.
- **Practice test:** answer by choosing from options or by typing or speaking. It stops the way the real test does: 20 questions at most, pass at 12 right, fail at 9 wrong. The 65/20 test is 10 questions, pass at 6.
- **Mock interview:** the "officer" reads each question aloud and the learner answers out loud. Results come at the end, like the real thing.
- **Progress:** a readiness score and progress by section.
- **Unlock:** $19.99 one time. Stripe Checkout gives the buyer an unlock code, which also appears on their Stripe receipt so they can use it on another device.
- **Amharic review screen** at `/review`, where you approve or fix every Amharic line.

### Free vs. unlocked
Free: every question and answer, flashcards, Amharic help for questions 1 to 15, one practice test.
Unlocked: Amharic for everything, unlimited practice tests, the mock interview, the readiness score.

## Run it on your computer

1. Open Terminal in this folder and install the packages: `npm install`
2. Copy the settings file: `cp .env.example .env`, then fill in `DATABASE_URL` (a new Railway Postgres, like Recipe Box). Leave the Stripe lines empty for now.
3. Create the database table: `npm run db:push`
4. Start the app: `npm run dev`, then open http://localhost:3000

On your computer, draft Amharic shows with a yellow **DRAFT** label, and a banner links to the review screen. Unlocking is simulated, so you'll get a test code without paying.

## Reviewing the Amharic (most important job)

**Easiest way:** open the online review page ("Zega Amharic Review" in your Claude artifacts). It needs no setup and works on your phone. When you've approved a batch, ask Claude to "sync the review" into this folder.

**Or on your computer:**

Every Amharic line was drafted by Claude and is marked `reviewed: false`. **Learners never see a line until you approve it.**

1. Run `npm run dev` and open http://localhost:3000/review
2. Fix anything that reads wrong, then click **Approve** (or **Save and approve**)
3. Your changes are written straight into `content/amharic-questions.json` and `content/ui.json`. A backup of each file is kept once a day (`.bak` files).
4. Commit the changed content files in GitHub Desktop.

There are 128 questions and 63 screen texts. The review screen shows drafts only by default, so you can work through it in sittings.

## Checking the content

`npm run check:content` checks that:
- all 128 official questions are present
- the 20 starred (65/20) questions are right
- every question has Amharic
- the answer checker accepts the right answers and rejects wrong ones (50+ test cases)
- multiple choice never offers a second correct answer

Run it after any change to `content/` or `src/lib/match.ts`.

## Going live

1. **Stripe:** the same account as Plainfax works. Add `STRIPE_SECRET_KEY`, then a webhook to `https://YOUR-DOMAIN/api/webhooks/stripe` for `checkout.session.completed` and `charge.refunded`, and put its secret in `STRIPE_WEBHOOK_SECRET`. In Stripe settings, turn on **email receipts for successful payments**, since that's where buyers find their unlock code.
2. **Railway:** same steps as Recipe Box. Don't set `SHOW_AMHARIC_DRAFTS` on the live site.
3. Without Stripe keys, the live site refuses to unlock (so nobody gets it free by accident).

## Before launch checklist

- [ ] Approve the Amharic (at least the screen text and the 20 starred questions)
- [ ] Confirm the current officials in `content/officials.json` against uscis.gov/citizenship/testupdates
- [ ] Replace `SUPPORT_EMAIL` in `src/lib/config.ts`
- [ ] Have the Terms and Privacy pages reviewed (they promise a 30-day refund; change that if you prefer)
- [ ] Check the name and domain are free to use
- [ ] Try the mock interview on an iPhone (Safari) and an Android phone (Chrome)

## Keeping it current

- **When officials change** (new Speaker, President, and so on): update `content/officials.json` and its `asOf` date.
- **If USCIS revises the test:** update `content/civics-2025.json`, then run `npm run check:content`.

## Known limits

- Progress is saved in each browser, so it doesn't move between devices. The unlock code does.
- Speech recognition depends on the browser: Chrome, Edge and Safari support it; Firefox doesn't, and typing always works. The answer checker is forgiving but not perfect, so learners see what they said next to the official answers.
- The unlock check runs in the browser, so someone technical could get around it. That's normal for a $19.99 study app and not worth more complexity yet.
- The older 2008 test (for people who filed before October 20, 2025) and the reading and writing tests aren't covered yet.
- Amharic audio isn't recorded yet. Questions are read aloud in English only, which matches the real interview.
