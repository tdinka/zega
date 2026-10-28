// npm run check:content — checks the question data and the answer checker.
// Run it after any change to /content or src/lib/match.ts.
import civics from "../content/civics-2025.json";
import amharic from "../content/amharic-questions.json";
import ui from "../content/ui.json";
import { QUESTIONS, SECTIONS, answersFor } from "../src/lib/content";
import { checkAnswer } from "../src/lib/match";
import { choicesFor, canChoose } from "../src/lib/quiz";

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
];
for (const [n, said, expected] of cases) {
  const q = QUESTIONS.find((x) => x.n === n)!;
  const accepted = answersFor(q, "VA", { senator: "Mark Warner" })!;
  const r = checkAnswer(said, accepted, q.count ?? 1);
  r.correct === expected ? ok(`Q${n} "${said}" → ${expected ? "right" : "wrong"}`) : fail(`Q${n} "${said}" should be ${expected ? "right" : "wrong"} (matched ${JSON.stringify(r.matched)})`);
}
const sen = QUESTIONS.find((q) => q.n === 23)!;
checkAnswer("warner", answersFor(sen, "VA", { senator: "Mark Warner" })!, 1).correct ? ok("Q23 accepts the learner's own senator by last name") : fail("Q23 own senator");
answersFor(sen, "VA", {}) === null ? ok("Q23 is skipped until the learner adds their senator") : fail("Q23 without a saved answer");
checkAnswer("dc has no senators", answersFor(sen, "DC", {})!, 1).correct ? ok("Q23 handles D.C.") : fail("Q23 D.C.");
const cap = QUESTIONS.find((q) => q.n === 62)!;
checkAnswer("richmond", answersFor(cap, "VA", {})!, 1).correct ? ok("Q62 Virginia capital") : fail("Q62 capital");

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
