// Builds practice tests that follow the real USCIS rules, and the
// multiple-choice options for "choose" mode.
import { answersFor, placeByCode, poolFor, QUESTIONS, sectionOf, shuffle, TEST_INFO, type MyAnswers, type Question, type TestKind } from "./content";
import { checkAnswer, keyWords, normalize, spellNames, variants } from "./match";

export type Asked = { n: number; said: string; correct: boolean };

/** Questions for one test. State questions without a saved answer are left out. */
export function buildTest(kind: TestKind, place: string | undefined, mine: MyAnswers): { questions: Question[]; skipped: number[] } {
  const pool = poolFor(kind);
  const usable = pool.filter((q) => answersFor(q, place, mine) !== null);
  const skipped = pool.filter((q) => answersFor(q, place, mine) === null).map((q) => q.n);
  return { questions: shuffle(usable).slice(0, TEST_INFO[kind].asked), skipped };
}

export type Verdict = "passed" | "failed" | "continue";

/** The officer stops once you've passed, or once you can no longer pass. */
export function verdict(kind: TestKind, asked: Asked[]): Verdict {
  const info = TEST_INFO[kind];
  const right = asked.filter((a) => a.correct).length;
  const wrong = asked.length - right;
  if (right >= info.toPass) return "passed";
  if (wrong >= info.toFail) return "failed";
  if (asked.length >= info.asked) return right >= info.toPass ? "passed" : "failed";
  return "continue";
}

// Words from the question itself. Repeating them doesn't answer it: "Veterans Day is a holiday"
// doesn't say what Veterans Day is, though "a day for veterans" does.
export const ECHO: Record<number, string[]> = {
  6: ["bill of rights"],
  76: ["win independence"],
  92: ["war between the north and the south", "north and the south"],
  112: ["civil rights movement"],
  125: ["independence day"],
  128: ["veterans day"],
};

// A learner who corrects herself ("vice president… no, president") is also graded on what she said last.
const CORRECTION = /\b(?:no|sorry|i mean|i meant|wait|actually)\b/i;
// A different answer after "no," "sorry" or "I mean" replaces the first one: "27… no, 26" is 26.
const REPLACED = /\bno\s*[,.;!?…]+|\bno no\b|\bsorry\b|\bi meant?\b/gi;
// Words that say nothing about the answer: "the president, sorry, my English is not good".
const ASIDE = new Set([
  "sorry", "nervous", "english", "good", "bad", "know", "sure", "think", "mean", "again", "repeat", "please", "ok", "okay", "yes",
  "right", "correct", "wrong", "excuse", "minute", "moment", "let", "try", "remember", "forgot", "forget", "hard", "difficult",
  "question", "answer", "say", "said", "speak", "understand", "not", "maybe", "guess", "little", "bit", "very", "oh", "ah", "hmm",
  "thank", "sir", "madam", "officer", "word", "slow", "am", "this",
]);
const meaningful = (s: string) => keyWords(s).filter((w) => !ASIDE.has(w));

/** Grades an answer. Spoken answers arrive as "best | alternative | ..." and any one may count. */
export function grade(q: Question, said: string, place: string | undefined, mine: MyAnswers) {
  const accepted = answersFor(q, place, mine) ?? [];
  const check = (t: string) => checkAnswer(t, accepted, q.count ?? 1, ECHO[q.n]);
  const state = placeByCode(place);
  const tries: string[] = [];
  for (const t of said.split(" | ").map((s) => s.trim()).filter(Boolean)) {
    const marks = Array.from(t.matchAll(REPLACED));
    const mark = marks[marks.length - 1];
    if (mark && (q.count ?? 1) === 1) {
      const before = t.slice(0, mark.index), after = t.slice(mark.index! + mark[0].length);
      const first = meaningful(before), second = meaningful(after);
      // A right answer replaced by a new one is graded on the new one.
      if (first.length && second.length && !second.some((w) => first.includes(w)) && check(before).correct && !check(after).correct) continue;
    }
    tries.push(t);
    const last = t.split(CORRECTION).pop()!.trim();
    if (last && last !== t) tries.push(last);
  }
  // "The people of California" = "the people of their state".
  if (state?.type === "state") {
    const name = new RegExp(`\\b${state.name}\\b`, "i");
    for (const t of [...tries]) if (name.test(t)) tries.push(t.replace(name, "their state"));
  }
  // Officeholders' names as they sound: "Ted Lou" for Ted Lieu.
  if (q.kind) for (const t of [...tries]) tries.push(spellNames(t, accepted));
  let best = check(tries[0] ?? "");
  for (const t of tries.slice(1)) {
    if (best.correct) break;
    const r = check(t);
    if (r.correct || r.matched.length > best.matched.length) best = r;
  }
  return best;
}

/**
 * Options for choose mode: the right answer(s) plus wrong answers taken from
 * other questions in the same part of the test, never ones that would also be right.
 */
// Answers from other questions that are true here too, though not official answers
// for this question, so they must never be shown as a wrong option.
export const ALSO_TRUE: Record<number, string[]> = {
  20: ["Print paper money", "Mint coins", "Create an army", "Make treaties", "Set foreign policy"], // Congress's powers in Article I
  41: ["Make treaties", "Set foreign policy", "Makes the federal budget"],
  58: ["Appoints federal judges", "Chief diplomat", "Makes the federal budget", "Signs bills into law", "Vetoes bills"],
  85: ["Writer of the Declaration of Independence", "Member of the Continental Congress"],
  86: ["Member of the Continental Congress", "Helped establish the First Bank of the United States"],
  87: ["Member of the Continental Congress", "U.S. diplomat", "Inventor"],
  88: ["Member of the Continental Congress"],
  94: ["Lincoln was assassinated."],
};

export function choicesFor(q: Question): { options: string[]; correct: string[] } {
  const need = q.count ?? 1;
  const correct = shuffle(q.a).slice(0, need);
  const allRight = new Set(q.a.flatMap(variants));
  const rightWords = q.a.map((a) => new Set(keyWords(a)));
  const isAlsoRight = (text: string) => {
    if (ALSO_TRUE[q.n]?.includes(text)) return true;
    if (variants(text).some((v) => allRight.has(v)) || checkAnswer(text, q.a, 1).correct) return true;
    // A shorter piece of a right answer ("Citizens" when "Citizens from their state" is right) is a trick, not a wrong answer.
    const words = keyWords(text);
    return words.length > 0 && rightWords.some((r) => words.every((w) => r.has(w)));
  };

  const section = sectionOf(q.n);
  const near = QUESTIONS.filter((o) => o.n !== q.n && !o.kind && sectionOf(o.n).group === section.group);
  const far = QUESTIONS.filter((o) => o.n !== q.n && !o.kind && sectionOf(o.n).group !== section.group);
  const seen = new Set<string>();
  const wrong: string[] = [];
  for (const source of [shuffle(near), shuffle(far)]) {
    for (const o of source) {
      const candidate = o.a[Math.floor(Math.random() * o.a.length)];
      const key = normalize(candidate);
      if (seen.has(key) || isAlsoRight(candidate)) continue;
      seen.add(key);
      wrong.push(candidate);
      if (wrong.length >= need + 2) break;
    }
    if (wrong.length >= need + 2) break;
  }
  return { options: shuffle([...correct, ...wrong]), correct };
}

/** Questions that can be answered by choosing (not state or current-officeholder ones). */
export const canChoose = (q: Question) => !q.kind;
