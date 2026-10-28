// Everything the app knows about the civics test comes from the files in /content.
// This module only reads them; nothing here changes the official wording.
import civics from "../../content/civics-2025.json";
import officials from "../../content/officials.json";
import places from "../../content/places.json";
import amharic from "../../content/amharic-questions.json";

export type Question = {
  n: number;
  q: string;
  a: string[];
  star?: boolean;
  count?: number; // "Name two/three/five" questions
  kind?: "state" | "current";
  stateField?: "senator" | "representative" | "governor" | "capital";
  official?: "president" | "vicePresident" | "speaker" | "chiefJustice";
  note?: string;
};

export type Section = { id: string; group: string; title: string; from: number; to: number };
export type Place = { code: string; name: string; type: "state" | "dc" | "territory"; capital: string | null };
export type TestKind = "standard" | "sixtyFiveTwenty";
export type AmharicItem = { q: string; help: string; reviewed: boolean };

export const QUESTIONS = civics.questions as Question[];
export const SECTIONS = civics.sections as Section[];
export const RULES = civics.meta.rules;
export const SOURCE = civics.meta;
export const OFFICIALS = officials;
export const PLACES = places.places as Place[];
export const AMHARIC = amharic.items as Record<string, AmharicItem>;

export const TEST_INFO: Record<TestKind, { label: string; pool: number; asked: number; toPass: number; toFail: number }> = {
  standard: {
    label: "2025 civics test (128 questions)",
    pool: QUESTIONS.length,
    asked: RULES.standard.asked,
    toPass: RULES.standard.toPass,
    toFail: RULES.standard.asked - RULES.standard.toPass + 1, // 9 wrong means you can no longer pass
  },
  sixtyFiveTwenty: {
    label: "65/20 test (20 starred questions)",
    pool: QUESTIONS.filter((q) => q.star).length,
    asked: RULES.sixtyFiveTwenty.asked,
    toPass: RULES.sixtyFiveTwenty.toPass,
    toFail: RULES.sixtyFiveTwenty.asked - RULES.sixtyFiveTwenty.toPass + 1, // 5 wrong
  },
};

export function poolFor(kind: TestKind): Question[] {
  return kind === "sixtyFiveTwenty" ? QUESTIONS.filter((q) => q.star) : QUESTIONS;
}

export function sectionOf(n: number): Section {
  return SECTIONS.find((s) => n >= s.from && n <= s.to)!;
}

export function placeByCode(code: string | null | undefined): Place | undefined {
  return PLACES.find((p) => p.code === code);
}

export type MyAnswers = { senator?: string; representative?: string; governor?: string };

/**
 * The answers we accept for a question, given where the learner lives and what
 * they've written down for themselves. Returns null when the learner still has
 * to look up their own answer (their senator, representative or governor).
 */
export function answersFor(q: Question, placeCode: string | undefined, mine: MyAnswers): string[] | null {
  if (q.kind === "current" && q.official) {
    return OFFICIALS.officials[q.official].answers;
  }
  if (q.kind === "state" && q.stateField) {
    const place = placeByCode(placeCode);
    if (!place) return null;
    const field = q.stateField;

    if (field === "capital") {
      if (place.type === "dc") return ["D.C. is not a state and does not have a capital", "not a state", "no capital"];
      return place.capital ? [place.capital] : null;
    }
    if (field === "senator" && place.type !== "state") {
      const who = place.type === "dc" ? "D.C." : place.name;
      return [`${who} has no U.S. senators`, "no senators", "none"];
    }
    if (field === "governor" && place.type === "dc") {
      return ["D.C. does not have a governor", "no governor", "none"];
    }
    const typed = mine[field as keyof MyAnswers]?.trim();
    if (!typed) return null;
    // Accept the full name or the last name alone, like USCIS officers do.
    const parts = typed.split(/\s+/);
    return parts.length > 1 ? [typed, parts[parts.length - 1]] : [typed];
  }
  return q.a;
}

/** Text to show as the answer on screen (keeps the official wording). */
export function displayAnswers(q: Question, placeCode: string | undefined, mine: MyAnswers): string[] {
  if (q.kind === "current" && q.official) {
    return [OFFICIALS.officials[q.official].answers[0]];
  }
  if (q.kind === "state") {
    const resolved = answersFor(q, placeCode, mine);
    return resolved ? [resolved[0]] : [];
  }
  return q.a;
}

export function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
