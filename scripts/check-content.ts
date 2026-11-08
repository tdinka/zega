// npm run check:content — checks the question data and the answer checker.
// Run it after any change to /content or src/lib/match.ts.
import civics from "../content/civics-2025.json";
import amharic from "../content/amharic-questions.json";
import ui from "../content/ui.json";
import { PLACES, QUESTIONS, SECTIONS, answersFor } from "../src/lib/content";
import { ALSO, checkAnswer } from "../src/lib/match";
import { ALSO_TRUE, choicesFor, canChoose, grade } from "../src/lib/quiz";
import { joinPieces } from "../src/lib/speech";
import { PHRASINGS } from "./phrasings";

let failures = 0;
const fail = (msg: string) => { failures++; console.log("  ✕", msg); };
const ok = (msg: string) => console.log("  ✓", msg);

console.log("Official content");
const ns = QUESTIONS.map((q) => q.n);
ns.length === 128 && ns.every((n, i) => n === i + 1) ? ok("128 questions, numbered 1 to 128") : fail(`question numbering is off (${ns.length})`);
const stars = QUESTIONS.filter((q) => q.star).map((q) => q.n);
const expectedStars = [2, 7, 12, 20, 30, 36, 38, 39, 44, 52, 61, 66, 74, 78, 86, 94, 113, 115, 121, 126];
JSON.stringify(stars) === JSON.stringify(expectedStars) ? ok("20 starred (65/20) questions match the cross-checked list") : fail(`starred questions differ: ${stars}`);
const covered = new Set<number>();
SECTIONS.forEach((s) => { for (let n = s.from; n <= s.to; n++) covered.add(n); });
covered.size === 128 ? ok("every question belongs to a section") : fail("sections don't cover all questions");
QUESTIONS.forEach((q) => { if (!q.a.length) fail(`Q${q.n} has no answers`); });
console.log(`  · rules: ${JSON.stringify(civics.meta.rules)}`);

console.log("Amharic coverage");
const am = amharic.items as Record<string, { q: string; help: string; reviewed: boolean }>;
const missing = ns.filter((n) => !am[String(n)]?.q || !am[String(n)]?.help);
missing.length ? fail(`questions without Amharic: ${missing}`) : ok("every question has an Amharic draft");
const reviewedQ = Object.values(am).filter((i) => i.reviewed).length;
const uiItems = Object.values(ui.items as Record<string, { reviewed: boolean }>);
console.log(`  · reviewed by Tsega: ${reviewedQ}/128 questions, ${uiItems.filter((i) => i.reviewed).length}/${uiItems.length} screen texts`);

console.log("Answer checker");
type Case = [number, string, boolean];
const cases: Case[] = [
  [2, "the constitution", true],
  [2, "u.s. constitution", true],
  [2, "the declaration", false],
  [7, "27", true],
  [7, "twenty seven", true],
  [7, "twenty six", false],
  [21, "100", true],
  [24, "435", true],
  [16, "legislative executive and judicial", true],
  [16, "congress and the president", false],
  [10, "equality and liberty", true],
  [10, "equality", false],
  [65, "freedom of speech, freedom of religion and freedom of assembly", true],
  [65, "freedom of speech and religion", false],
  [81, "new york new jersey virginia georgia and maryland", true],
  [81, "new york and new jersey", false],
  [126, "christmas, thanksgiving and independence day", true],
  [78, "jefferson", true],
  [78, "thomas jeferson", true],
  [78, "washington", false],
  [86, "he was the first president", true],
  [44, "the president", true],
  [44, "congress", false],
  [42, "vice president", false],
  [40, "the vice president", true],
  [17, "executive", true],
  [17, "legislative", false],
  [19, "senate", false],
  [115, "terrorists attacked the united states", true],
  [115, "terrorists crashed planes into the world trade center in new york", true],
  [108, "the soviet union", true],
  [120, "liberty island", true],
  [123, "the star spangled banner", true],
  [124, "out of many one", true],
  [104, "the stock market crash of 1929", true],
  [36, "four years", true],
  [36, "two years", false],
  [12, "capitalism", true],
  [12, "communism", false],
  [92, "civil war", true],
  [38, "trump", true],
  [57, "john roberts", true],
  // From Tsega's iPhone mock interview (Nov 2, 2026): everyday phrasings an officer would accept.
  [41, "he can veto bills", true],
  [41, "pastor", false],
  [69, "voting and running for office", true],
  [69, "voting", false],
  [97, "amendment 14", true],
  [97, "the fourteenth amendment", true],
  [97, "15th amendment", false],
  [113, "civil rights", true],
  [113, "civil disobedience", false],
  [88, "he was the fourth president", true],
  [88, "he was president", false],
  // Second iPhone run (Nov 2, 2026).
  [68, "born in the united states", true],
  [68, "naturalization", true],
  [68, "they can get naturalized", true],
  [68, "by taking a test", false],
  // Chrome run (Nov 2, 2026).
  [41, "to veto", true],
  [41, "he signs laws", true],
  [41, "makes laws", false],
  // Third run (Nov 2, 2026): speech says "World War 2", answers say "World War II".
  [107, "he was a general in world war two", true],
  [107, "general in world war 2", true],
  [107, "general in the second world war", true],
  [107, "general in world war 1", false],
  [101, "because germany attacked us ships", true],
  // Fourth run (Nov 7, 2026).
  [111, "to fight communism", true],
  [111, "to stop the spread of communism", true],
  [111, "because of communism", true],
  [111, "to stop the war", false],
  [94, "abolishing slavery", true],
  [94, "he abolished slavery", true],
  [94, "slavery", false],
  [81, "maryland, virginia, north carolina, south carolina, gerogia", true],
  [81, "maryland, virginia, north carolina, south carolina, florida", false],
  [10, "right to bear arms, right to assemble", false],
];
for (const [n, said, expected] of cases) {
  const q = QUESTIONS.find((x) => x.n === n)!;
  const accepted = answersFor(q, "VA", { senator: "Mark Warner" })!;
  const r = checkAnswer(said, accepted, q.count ?? 1);
  r.correct === expected ? ok(`Q${n} "${said}" → ${expected ? "right" : "wrong"}`) : fail(`Q${n} "${said}" should be ${expected ? "right" : "wrong"} (matched ${JSON.stringify(r.matched)})`);
}
const official = new Set(QUESTIONS.flatMap((q) => q.a));
const strayKeys = Object.keys(ALSO).filter((k) => !official.has(k));
const strayTrue = Object.values(ALSO_TRUE).flat().filter((a) => !official.has(a));
strayTrue.length ? fail(`choose-mode exceptions that aren't official answers: ${JSON.stringify(strayTrue)}`) : ok("choose-mode exceptions all name real answers");
strayKeys.length ? fail(`extra phrasings for answers that don't exist: ${JSON.stringify(strayKeys)}`) : ok(`extra phrasings are attached to ${Object.keys(ALSO).length} real official answers`);
let off = 0;
for (const [n, said, expected] of PHRASINGS) {
  const r = grade(QUESTIONS.find((x) => x.n === n)!, said, "CA", {});
  if (r.correct !== expected) { off++; fail(`Q${n} "${said}" should be ${expected ? "right" : "wrong"} (matched ${JSON.stringify(r.matched)})`); }
}
if (!off) ok(`${PHRASINGS.length} everyday phrasings across all questions (scripts/phrasings.ts)`);
const sen = QUESTIONS.find((q) => q.n === 23)!;
checkAnswer("warner", answersFor(sen, "VA", { senator: "Mark Warner" })!, 1).correct ? ok("Q23 accepts the learner's own senator by last name") : fail("Q23 own senator");
answersFor(sen, "VA", {}) === null ? ok("Q23 is skipped until the learner adds their senator") : fail("Q23 without a saved answer");
checkAnswer("dc has no senators", answersFor(sen, "DC", {})!, 1).correct ? ok("Q23 handles D.C.") : fail("Q23 D.C.");
const cap = QUESTIONS.find((q) => q.n === 62)!;
checkAnswer("richmond", answersFor(cap, "VA", {})!, 1).correct ? ok("Q62 Virginia capital") : fail("Q62 capital");
// Every capital, and every other place's capital must be wrong. Plus the ones people shorten or type without accents.
let capOff = 0;
for (const p of PLACES.filter((x) => x.capital)) {
  if (!checkAnswer(`the capital is ${p.capital!.toLowerCase()}`, answersFor(cap, p.code, {})!, 1).correct) { capOff++; fail(`Q62 ${p.code} "${p.capital}"`); }
  const other = PLACES.find((x) => x.capital && x.capital !== p.capital)!;
  if (checkAnswer(other.capital!, answersFor(cap, p.code, {})!, 1).correct) { capOff++; fail(`Q62 ${p.code} accepts "${other.capital}"`); }
}
const places: [string, string, boolean, Partial<Record<"senator" | "representative" | "governor", string>>, number][] = [
  ["MN", "st. paul", true, {}, 62], ["UT", "salt lake", true, {}, 62], ["NV", "carson", true, {}, 62], ["MO", "jefferson", true, {}, 62],
  ["OK", "oklahoma", false, {}, 62], ["GU", "hagatna", true, {}, 62], ["DC", "washington", false, {}, 62],
  ["PA", "casey", true, { senator: "Bob Casey Jr." }, 23], ["NM", "lujan", true, { senator: "Ben Ray Luján" }, 23],
  ["NJ", "smith", true, { representative: "Chris Smith III" }, 29], ["CA", "governor newsom", true, { governor: "Gavin Newsom" }, 61],
  ["CA", "brown", false, { governor: "Gavin Newsom" }, 61], ["VA", "kaine", false, { senator: "Mark Warner" }, 23],
];
for (const [code, said, expected, mine, n] of places) {
  const r = checkAnswer(said, answersFor(QUESTIONS.find((q) => q.n === n)!, code, mine)!, 1).correct;
  if (r !== expected) { capOff++; fail(`Q${n} ${code} "${said}" should be ${expected ? "right" : "wrong"}`); }
}
if (!capOff) ok(`all ${PLACES.filter((x) => x.capital).length} capitals, shortened capitals, accents and typed names with Jr./III`);

// Repeating the question is never an answer ("Veterans Day is…" for "What is Veterans Day?").
let echoes = 0;
for (const q of QUESTIONS) {
  for (const part of [q.q, ...q.q.split(/[.?]/)].map((s) => s.trim()).filter(Boolean)) {
    if (grade(q, part, "CA", {}).correct) { echoes++; fail(`Q${q.n} counts the question itself as an answer: "${part}"`); }
  }
}
if (!echoes) ok("repeating any of the 128 questions is never counted as an answer");

// Officeholders' names as they sound (speech recognition often misspells a learner's own representative),
// and the current officeholder named instead of the office.
const mineCA = { senator: "Alex Padilla", representative: "Ted Lieu", governor: "Gavin Newsom" };
const people: [number, string, boolean][] = [
  [29, "ted lou", true], [29, "ted lew", true], [23, "alex padiya", true], [61, "gabin nusom", true], [61, "gavin new some", true],
  [29, "law", false], [29, "lou", false], [23, "padiya", false],
  [40, "jd vance", true], [42, "donald trump", true], [44, "trump", true], [42, "jd vance", false], [40, "trump", false], [39, "mike pence", false],
];
let peopleOff = 0;
for (const [n, said, expected] of people) {
  if (grade(QUESTIONS.find((q) => q.n === n)!, said, "CA", mineCA).correct !== expected) { peopleOff++; fail(`Q${n} "${said}" should be ${expected ? "right" : "wrong"}`); }
}
if (!peopleOff) ok("names said the way they sound, and current officeholders named instead of the office");

// Spoken answers come in pieces; each alternative is the whole answer with one piece heard another way.
const spoken = joinPieces([{ best: "freedom of speech religion", others: [] }, { best: "a symbol", others: ["assembly"] }]);
spoken === "freedom of speech religion a symbol | freedom of speech religion assembly" && grade(QUESTIONS.find((q) => q.n === 65)!, spoken, "CA", {}).correct
  ? ok("a spoken \"Name three\" answer keeps its first parts when the last one was misheard")
  : fail(`spoken pieces joined wrong: "${spoken}"`);

console.log("Choose mode never offers a second right answer");
let bad = 0;
for (let round = 0; round < 30; round++) {
  for (const q of QUESTIONS.filter(canChoose)) {
    const { options, correct } = choicesFor(q);
    const wrong = options.filter((o) => !correct.includes(o));
    for (const w of wrong) if (checkAnswer(w, q.a, 1).correct) { bad++; if (bad < 5) fail(`Q${q.n} distractor "${w}" is also right`); }
    if (options.length < (q.count ?? 1) + 2) { bad++; fail(`Q${q.n} has too few options`); }
  }
}
bad === 0 ? ok("3,500+ generated option sets checked") : fail(`${bad} bad option sets`);

console.log(failures ? `\n${failures} problem(s) found.` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);
