"use client";

import Link from "next/link";
import { QuestionAmharic, T } from "@/components/Amharic";
import { QUESTIONS } from "@/lib/content";
import { PRICE_LABEL } from "@/lib/config";
import { useStore } from "@/lib/store";

// A real question from the test, shown the way the app shows every card.
const SAMPLE = QUESTIONS.find((q) => q.n === 121)!;

export default function Home() {
  const [store, , ready] = useStore();
  const startHref = ready && store.onboarded ? "/study" : "/start";

  return (
    <>
      <section className="mx-auto grid max-w-5xl gap-10 px-4 pb-10 pt-10 sm:px-6 lg:grid-cols-[1.1fr,1fr] lg:pt-16">
        <div className="min-w-0">
          <p className="eyebrow">2025 U.S. civics test · 128 questions</p>
          <T
            k="hero.title"
            as="h1"
            className="mt-3 block font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl"
            amClass="mt-3 text-2xl font-normal sm:text-3xl"
          />
          <T k="hero.body" as="p" className="mt-5 block max-w-[58ch] text-lg text-ink-soft" amClass="text-base" />
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={startHref} className="btn-primary">
              <T k="hero.cta" amClass="hidden" />
            </Link>
            <Link href="/questions" className="btn-quiet">
              <T k="hero.secondary" amClass="hidden" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-faint">Free to study. {PRICE_LABEL} once to unlock everything. No subscription.</p>
        </div>

        <div className="min-w-0 self-center">
          <div className="card relative overflow-hidden p-6 shadow-[0_16px_40px_-24px_rgba(19,33,58,0.45)]">
            <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-[repeating-linear-gradient(90deg,#1D3A6B_0_14px,#D9961A_14px_28px)] opacity-80" />
            <div className="flex items-center justify-between">
              <span className="qnum">Question {SAMPLE.n} of 128</span>
              <span className="rounded-full bg-marigold-50 px-2 py-0.5 text-xs font-semibold text-marigold-dark">★ 65/20</span>
            </div>
            <p className="mt-3 font-display text-2xl font-semibold leading-snug">{SAMPLE.q}</p>
            <div className="mt-2">
              <QuestionAmharic n={SAMPLE.n} show="question" ignoreLock />
            </div>
            <div className="mt-5 rounded-lg bg-paper p-4">
              <p className="eyebrow">Official answers</p>
              <ul className="mt-2 space-y-1">
                {SAMPLE.a.map((a) => (
                  <li key={a} className="text-[15px]">{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <T k="home.how" as="h2" className="block font-display text-2xl font-semibold" amClass="text-lg" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(["1", "2", "3", "4"] as const).map((i) => (
            <div key={i} className="card p-5">
              <T k={`home.f${i}`} as="h3" className="block font-display text-lg font-semibold" amClass="text-base" />
              <T k={`home.f${i}b`} as="p" className="mt-2 block text-sm text-ink-soft" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="card grid gap-6 p-6 sm:grid-cols-[1fr,auto] sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold">Free vs. unlocked</h2>
            <div className="mt-4 grid gap-6 text-sm sm:grid-cols-2">
              <ul className="space-y-1.5">
                <li className="font-semibold">Free</li>
                <li>All 128 questions and official answers</li>
                <li>Flashcards, read out loud</li>
                <li>Amharic help for questions 1 to 15</li>
                <li>One practice test</li>
              </ul>
              <ul className="space-y-1.5">
                <li className="font-semibold">Unlocked, {PRICE_LABEL} once</li>
                <li>Amharic help for every question</li>
                <li>Unlimited practice tests</li>
                <li>Spoken mock interview</li>
                <li>Readiness score</li>
              </ul>
            </div>
          </div>
          <Link href="/unlock" className="btn-primary">See unlock options</Link>
        </div>
      </section>
    </>
  );
}
