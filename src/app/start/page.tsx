"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/components/Amharic";
import { PLACES, TEST_INFO, type TestKind } from "@/lib/content";
import { useStore, type Settings } from "@/lib/store";

const LOOKUPS = [
  ["senator", "start.senator", "https://www.senate.gov/senators/senators-contact.htm", "Find your senators on senate.gov"],
  ["representative", "start.rep", "https://www.house.gov/representatives/find-your-representative", "Find your representative on house.gov"],
  ["governor", "start.governor", "https://www.usa.gov/state-governor", "Find your governor on usa.gov"],
] as const;

export default function Start() {
  const router = useRouter();
  const [store, update, ready] = useStore();
  const [s, setS] = useState<Settings>(store.settings);
  useEffect(() => {
    if (ready) setS(store.settings);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const place = PLACES.find((p) => p.code === s.place);
  const needsLookup = (field: string) => {
    if (!place || place.type === "state") return true;
    if (field === "governor") return place.type !== "dc";
    if (field === "senator") return false;
    return true; // territories have a delegate or resident commissioner
  };

  function save(e: React.FormEvent) {
    e.preventDefault();
    update((st) => ({ ...st, settings: s, onboarded: true }));
    router.push("/study");
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <T k="start.title" as="h1" className="block font-display text-3xl font-semibold" amClass="text-xl" />

      <fieldset className="mt-8">
        <legend className="label"><T k="start.test" /></legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["standard", "sixtyFiveTwenty"] as TestKind[]).map((kind) => (
            <label
              key={kind}
              className={`card cursor-pointer p-4 transition ${s.test === kind ? "border-navy ring-2 ring-navy/15" : "hover:border-ink-faint"}`}
            >
              <input
                type="radio"
                name="test"
                id={`test-${kind}`}
                className="sr-only"
                checked={s.test === kind}
                onChange={() => setS({ ...s, test: kind })}
              />
              <T k={kind === "standard" ? "start.standard" : "start.6520"} className="block font-semibold" amClass="text-sm" />
              <T k={kind === "standard" ? "start.standardNote" : "start.6520Note"} className="mt-1 block text-sm text-ink-soft" />
              <span className="mt-2 block text-xs text-ink-faint">
                {TEST_INFO[kind].pool} questions to study · {TEST_INFO[kind].toPass} of {TEST_INFO[kind].asked} to pass
              </span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          Filed your N-400 before October 20, 2025? You'll take the older 2008 test, which Zega doesn't cover yet.
        </p>
      </fieldset>

      <div className="mt-8">
        <label htmlFor="place" className="label"><T k="start.place" /></label>
        <select id="place" className="field" value={s.place ?? ""} onChange={(e) => setS({ ...s, place: e.target.value || undefined })}>
          <option value="">Choose your state or territory</option>
          {PLACES.map((p) => (
            <option key={p.code} value={p.code}>{p.name}</option>
          ))}
        </select>
      </div>

      <fieldset className="mt-8">
        <legend className="label"><T k="start.mine" /></legend>
        <T k="start.mineNote" as="p" className="-mt-1 mb-4 block text-sm text-ink-soft" />
        <div className="space-y-4">
          {LOOKUPS.filter(([field]) => needsLookup(field)).map(([field, k, href, linkText]) => (
            <div key={field}>
              <label htmlFor={`mine-${field}`} className="block text-sm font-medium"><T k={k} amClass="text-xs" /></label>
              <input
                id={`mine-${field}`}
                className="field mt-1.5"
                autoComplete="off"
                value={s.mine[field] ?? ""}
                onChange={(e) => setS({ ...s, mine: { ...s.mine, [field]: e.target.value } })}
                placeholder={field === "governor" ? "e.g. the governor's full name" : "Full name"}
              />
              <a href={href} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-navy underline">{linkText}</a>
            </div>
          ))}
          {place && place.type !== "state" && (
            <p className="text-sm text-ink-soft">
              {place.type === "dc"
                ? "D.C. has no U.S. senators and no governor. Zega uses those answers for you."
                : `${place.name} has no U.S. senators. Zega uses that answer for you.`}
            </p>
          )}
        </div>
      </fieldset>

      <label className="mt-8 flex cursor-pointer items-center gap-3">
        <input
          id="amharic"
          type="checkbox"
          className="h-5 w-5 accent-navy"
          checked={s.amharic}
          onChange={(e) => setS({ ...s, amharic: e.target.checked })}
        />
        <T k="start.amharic" className="font-medium" amClass="text-sm" />
      </label>

      <div className="mt-6">
        <label htmlFor="rate" className="label">Read-aloud speed</label>
        <input
          id="rate"
          type="range"
          min={0.7}
          max={1.1}
          step={0.1}
          value={s.speechRate}
          onChange={(e) => setS({ ...s, speechRate: Number(e.target.value) })}
          className="w-full accent-navy"
        />
        <div className="flex justify-between text-xs text-ink-faint"><span>Slower</span><span>Normal</span></div>
      </div>

      <button type="submit" className="btn-primary mt-10 w-full sm:w-auto">
        <T k="start.save" amClass="hidden" />
      </button>
    </form>
  );
}
