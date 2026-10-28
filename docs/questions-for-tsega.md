# Questions for Tsega

Open items from the first build (Oct 28, 2026). Move each to "Answered" once you decide.

## Open

1. ~~**Amharic review.**~~ Done, see Answered. All 128 question translations and 63 screen texts are Claude's drafts. Please review at `/review`. Things I was least sure about:
   - Which word for U.S. "state": I used ክፍለ ግዛት. Would your learners say ስቴት?
   - "Governor": ክፍለ ግዛት አስተዳዳሪ, with (governor) in English next to it.
   - "Colonists": ቅኝ ሰፋሪዎች (Q73).
   - "Bill of Rights": የመብቶች ሰነድ (Q6). Is there a better-known term?
   - Gregorian dates use ጁላይ / ሴፕቴምበር (Q79, Q115, Q116), not Ethiopian months. Is that right?
   - Q48 "Secretary of State" is explained as "(የውጭ ጉዳይ)". Check that it reads naturally.
2. **The name.** "Zega / ዜጋ" is a working name. Do you like it? Is the domain free?
3. **Officials list.** `content/officials.json` uses the April 13, 2026 USCIS update (via a library's copy, since uscis.gov was blocked for me). Please confirm on uscis.gov/citizenship/testupdates.
4. **Refund promise.** The Terms page offers a 30-day refund on request. Keep it, change it or remove it?
5. **Free tier.** Free users get Amharic for Q1–15 and one practice test. Is that the right teaser?
6. **Amharic audio.** Want to record Amharic explanations later, like the studio in your Amharic app?

## Answered

- **Amharic review (Oct 28, 2026):** all 191 lines approved. Tsega approved 30 herself, including Q16, Q66, Q68 and the officer wording (ኦፊሰር). The other 161 passed two independent AI reviews (24 fixed along the way) plus her spot check. Each item records `approvedBy`.

## Notes on sources

- Question text: USCIS Form M-1778 (09/25), read from a public copy of the official PDF. All 128 questions and the section ranges come from it. The 20 starred questions were cross-checked against a second site. A third site (citizennow.com) had a wrong starred list (it included Q57 and was missing Q94 and Q113), so I ignored it.

## Open (Oct 28, 2026)
- Who runs Zega in the Terms: your legal name, or an LLC? (`OPERATOR_NAME` in src/lib/config.ts)
- Governing state for the Terms: set to New York for now. Confirm.
- Support email address (`SUPPORT_EMAIL`).
- Name: keep Zega (low legal risk; note ZegaHabesha, a 17+ dating app, shares the prefix in the App Store) or switch to Zegenet (ዜግነት, "citizenship")? Then buy the domain.
