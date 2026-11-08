# Phone test: mock interview

Open **learnzega.com/interview** on each phone. Write "OK" or what went wrong next to each step.
If something goes wrong, a screenshot helps.

## Before you start
- Volume up, ringer/silent switch off (iPhone), no headphones for the first run.
- iPhone only: Settings → Siri → "Talk to Siri" or Settings → General → Keyboard → "Enable Dictation" must be ON. Safari's speech recognition uses it.

## Steps (do these on each phone)

| # | What to do | What should happen | iPhone (Safari) | Android (Chrome) |
|---|---|---|---|---|
| 1 | Start the mock interview | The first question is read aloud in English | | |
| 2 | Tap the microphone button | The phone asks to use the microphone. Tap **Allow** | | |
| 3 | Say a right answer clearly (e.g. Q: "What is the supreme law of the land?" → "the Constitution") | Your words appear while you speak, then it's marked right | | |
| 4 | Say a wrong answer | It's marked wrong (not right) | | |
| 5 | Tap the mic and say nothing for ~10 seconds | A message: "We didn't hear anything…" or "We didn't catch that…" | | |
| 6 | Type an answer instead of speaking | Typing works | | |
| 7 | Answer 3–4 more questions by voice | Each new question is still read aloud, and **at normal volume** (iPhone sometimes gets quiet after the mic is used) | | |
| 8 | Lock the phone mid-question, unlock, continue | The interview picks up where you were | | |
| 9 | Finish (or let the stop rule end it) | You see the pass/fail result | | |
| 10 | Turn the phone sideways | The page still fits; nothing cut off | | |

## Extra checks (important for the launch plan)
Most learners will tap a link in Facebook, Telegram or WhatsApp, which opens a built-in browser, not Safari/Chrome.

| # | What to do | What should happen | iPhone | Android |
|---|---|---|---|---|
| 11 | Send yourself learnzega.com/interview in Telegram or WhatsApp, tap it, try the mic | Either the mic works, or the page says it can't listen and offers typing | | |
| 12 | Same in Facebook Messenger | Same as above | | |
| 13 | Deny the microphone (or turn it off in settings) and tap the mic | A clear message that the microphone is blocked; typing still works | | |

## Notes
- iPhone run 1 (Nov 2, 2026): works end to end. Two problems found and fixed: the mic cut off answers at the first pause (now keeps listening until ~4 s of quiet or you tap done), and the checker was too strict ("veto bills", "Amendment 14", "voting and running for office", "civil rights").
- iPhone run 2 (Nov 2, 2026): pauses fine. Fixed Q68 ("born in the United States", "naturalization").
- Desktop Chrome run (Nov 2, 2026), standing in for Android Chrome (same Google speech service): no repeated words or cut-offs. Fixed Q41 ("to veto", "he signs laws"). Mishearings: "Bible verse" (Q68), "estate" (Q31).
- iPhone, link opened inside Slack (Nov 2, 2026): mic and read-aloud work in Slack's built-in browser. Fixed "World War 2/two/second world war" not matching "World War II" (Q107 and other war questions).
- Mock interview (Nov 7, 2026): fixed "to fight communism" (Q111), "abolishing slavery" (Q94) and swapped-letter typos like "gerogia" (Q81). The other wrong marks were fair. Followed by three sweeps of all 128 questions and an ESL persona sweep (2,563 phrasings now in scripts/phrasings.ts).
- Second ESL persona round (Nov 8, 2026): 4,608 more answers from Almaz; 4,588 phrasings now. Spoken answers changed: when you pause, the phone's other guesses now cover the whole answer, not just the last piece. Re-check step 3 with a "Name three" or "Name five" question said in pieces, with pauses.
- Still to do: a real Android phone (ask one of the first testers), Telegram/WhatsApp/Facebook (Slack worked, but those are where learners are), steps 5, 7, 8, 10 on iPhone, and the in-app browser checks (11–13).
