# Test persona: Almaz

Use Almaz to test the answer checker the way a real Zega learner answers. The civics test checks what
people know, not their grammar: an officer accepts an answer with broken English if the meaning is right.
The checker should do the same.

## Who she is
- Almaz Tesfaye, 47, from Addis Ababa. In Los Angeles for 9 years; green card through family.
- Home health aide. Finished high school in Ethiopia, where English was a school subject.
- Speaks Amharic at home and at church. English is good enough for work and errands, not for long sentences.
- Studies on her phone in the evening, after work. Mostly answers out loud in the mock interview, sometimes types.
- Nervous about the interview. Learned many answers from Amharic explanations, so she often says the idea
  in her own simple words instead of the official wording.

## How her English differs (what the checker must handle)
**Grammar**
- Drops articles: "president is commander", "Constitution".
- Drops verb endings and helper verbs: "congress make law", "he sign bill", "everybody follow law" (no "must").
- Singular and plural mixed: "amendment", "right of people", "senator represent people of state".
- Word order sometimes follows Amharic (verb last): "law the Congress make".
- Prepositions swapped: "free of Britain", "independence of England", "people in state".
- "He" and "she" mixed up.

**Vocabulary**
- Simpler words for official ones: "rules" for laws, "boss" or "head" for chief, "help" for advise,
  "give" for provide, "choose" for elect, "fight" for oppose, "stop" for end, "England" for Britain.
- Says the idea instead of the term: "people rule themselves" (self-government), "nobody higher than law"
  (rule of law), "small state same power" (equal representation).
- Explains with "because": "because many people live there".

**Pronunciation (what speech recognition writes down)**
Speech recognition (set to US English) turns her accent into other real English words:
- v → b: "vote" heard as "boat", "veto" as "beto", "vice" as "bice".
- p → b: "president" sometimes "bresident" (typed) or "precedent".
- th → t or d: "three" as "tree", "Thanksgiving" as "tanksgiving", "the" as "de".
- Final sounds dropped: "Congres", "presiden", "Senat", "rights" as "right".
- Some long words split or changed: "independence" as "independent", "Constitution" as "institution",
  "Supreme Court" as "supreme cord", "taxes" as "taxis", "slaves" as "sleeves", "war" as "were".

**Typing**
- Spells by sound: "goverment", "constitusion", "amendmend", "presdent", "senat", "Jeferson".

## What she should never get credit for
A wrong idea in good English or bad English is still wrong: "vice president" for the president, "1787" for the
Declaration, two answers when three are asked.

## What testing with Almaz changed (Nov 7, 2026)
Of her first 1,347 answers, 130 fair ones were marked wrong and 2 wrong ones were accepted. The fixes, in
`src/lib/match.ts`:
- `ACCENT`: what speech recognition writes for her accent, turned back into the intended word.
- `STOP`: helper verbs and pronouns she leaves out or mixes up no longer count.
- `SAME`: simple words for official ones (rule/govern, England/Britain, choose/appoint, start/found, die/died),
  and these still work when misspelled.
- Typos are compared as typed ("congres", "licens"), before the plural "s" is taken off.
- Naming another country ("join army of Ethiopia") no longer counts as serving or being loyal to the US.

Her answers are in `scripts/phrasings.ts` (the "ESL persona" section) and run with `npm run check:content`.
Kept strict on purpose: "longest economic recess" ("recess" is a different word).

## Second round (Nov 8, 2026)
Six helpers each wrote Almaz answers for all 128 questions from one angle: what the phone writes for her accent,
what she types by sound, her grammar and own words, word-for-word translations of Zega's Amharic help, wrong
answers that look right, and numbers/names/lists. 4,608 answers, each labeled by what a fair officer would decide.

Before the fixes, 480 were graded differently from the officer: 417 fair answers marked wrong, 63 wrong answers
accepted. After: 16 (8 each way), all listed below. What changed, in `src/lib/match.ts`, `src/lib/quiz.ts` and `src/lib/speech.ts`:
- Spellings by sound ("Ruzvelt", "Jorjia", "konstitushon", "Luwiziyana") and split or merged words ("con stitution",
  "supremecourt", "Gettysburg a dress").
- More accent mishearings ("the low", "bear harbor", "so be it union", "new clear war", "Sue" for Sioux, "4:35",
  "20 second amendment") and numbers said the Amharic way ("one thousand nine hundred twenty nine").
- Translations from Amharic: "announce war", "driving permit", "constituency", "examine the law", "deputy president".
- Her own words for the idea ("power come from the people", "war with Mexico", "very tall building").
- "do not / no / without" all mean "not", and "not" is never optional ("powers given to the federal government"
  is the opposite of the answer).
- Self-corrections: "vice president… no, president" counts; "27… no, 26" doesn't.
- The learner's state named ("the people of California"), current officeholders named ("Donald Trump" for
  Commander in Chief), and her own representative's name as speech recognition writes it ("Ted Lou").
- Wrong answers no longer accepted: repeating the question ("Veterans Day" for "What is Veterans Day?"), opposite
  words ("unlimited government", "dependent on politics"), wrong units ("two terms", "six months"), wrong years
  ("stock market crash 2008"), another country ("Ethiopian constitution", "citizen of Ethiopia", "Ethiopian
  Christmas"), state instead of federal ("state legislature", "Superior Court"), swapped sides ("Kuwait out of Iraq",
  "America attacked Japan").
- Spoken answers in pieces: the phone's other guesses now cover the whole answer, so "freedom of speech, religion,
  [pause] a symbol | assembly" keeps all three.

Two earlier labels were changed: "planes crashed into the World Trade Center" (9/11) and "a big economic recession"
(Great Depression) are now right.

Still graded differently from a fair officer (left out of the tests on purpose):
- Kept strict: typos in short words ("civil wat", "vetp bills"); "honor soldiers" without "who died" or "who served"
  (that's what tells Memorial Day from Veterans Day); a saved name's last name alone spelled by sound ("Padiya");
  "DC" alone; "people freedom" for the Bill of Rights; one garbled sentence.
- Can't be caught by word matching: reversed meanings ("power not given to the state belongs to the federal
  government", "the Senate chooses judges and the president says okay", "senators listen to people more"), and a
  wrong detail next to a right answer ("he invented the light bulb" for Franklin, "protects the rights of the
  president", "Donald Trump Jr.", the hedge "five or six").
