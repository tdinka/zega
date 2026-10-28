// Builds practice tests that follow the real USCIS rules, and the
// multiple-choice options for "choose" mode.
import { answersFor, poolFor, QUESTIONS, sectionOf, shuffle, TEST_INFO, type MyAnswers, type Question, type TestKind } from "./content";
import { checkAnswer, normalize, variants } from "./match";

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

/** Grades an answer. Spoken answers arrive as "best | alternative | ..." and any one may count. */
export function grade(q: Question, said: string, place: string | undefined, mine: MyAnswers) {
  const accepted = answersFor(q, place, mine) ?? [];
  const tries = said.split(" | ").map((s) => s.trim()).filter(Boolean);
  let best = checkAnswer(tries[0] ?? "", accepted, q.count ?? 1);
  for (const t of tries.slice(1)) {
    if (best.correct) break;
    const r = checkAnswer(t, accepted, q.count ?? 1);
    if (r.correct || r.matched.length > best.matched.length) best = r;
  }
  return best;
}

/**
 * Options for choose mode: the right answer(s) plus wrong answers taken from
 * other questions in the same part of the test, never ones that would also be right.
 */
export function choicesFor(q: Question): { options: string[]; correct: string[] } {
  const need = q.count ?? 1;
  const correct = shuffle(q.a).slice(0, need);
  const allRight = new Set(q.a.flatMap(variants));
  const isAlsoRight = (text: string) => variants(text).some((v) => allRight.has(v)) || checkAnswer(text, q.a, 1).correct;

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
