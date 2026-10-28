"use client";
// Study progress lives in the learner's own browser (no account needed).
// Every read and write is wrapped so a private window or blocked storage
// never breaks the app; it just won't remember between visits.

import { useCallback, useEffect, useState } from "react";
import type { MyAnswers, TestKind } from "./content";

export type Settings = {
  test: TestKind;
  place?: string; // state or territory code, e.g. "VA"
  mine: MyAnswers; // their own senator / representative / governor
  amharic: boolean; // show Amharic help
  speechRate: number; // 0.7 – 1.1 for the read-aloud voice
};

export type TestRecord = {
  at: string;
  test: TestKind;
  mode: "practice" | "interview";
  correct: number;
  wrong: number;
  passed: boolean;
};

export type Store = {
  settings: Settings;
  boxes: Record<string, number>; // flashcard box per question number, 1 (new) to 5 (solid)
  tests: TestRecord[];
  unlock?: { code: string; checkedAt: string };
  freeTestsUsed: number;
  onboarded: boolean;
};

const KEY = "zega.v1";
const DEFAULT: Store = {
  settings: { test: "standard", mine: {}, amharic: true, speechRate: 0.9 },
  boxes: {},
  tests: [],
  freeTestsUsed: 0,
  onboarded: false,
};

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT, ...parsed, settings: { ...DEFAULT.settings, ...parsed.settings } };
  } catch {
    return DEFAULT;
  }
}

function write(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage blocked: keep going in memory */
  }
}

const listeners = new Set<(s: Store) => void>();
let memory: Store | null = null;

export function getStore(): Store {
  if (!memory) memory = typeof window === "undefined" ? DEFAULT : read();
  return memory;
}

export function updateStore(fn: (s: Store) => Store) {
  memory = fn(getStore());
  write(memory);
  listeners.forEach((l) => l(memory!));
}

/** React hook: the store plus a ready flag (false during the first server render). */
export function useStore(): [Store, (fn: (s: Store) => Store) => void, boolean] {
  const [state, setState] = useState<Store>(DEFAULT);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setState(getStore());
    setReady(true);
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);
  const update = useCallback((fn: (s: Store) => Store) => updateStore(fn), []);
  return [state, update, ready];
}

export const isUnlocked = (s: Store) => Boolean(s.unlock?.code);
export const FREE_TESTS = 1;
