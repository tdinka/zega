// Checks a spoken or typed answer against the official answers, the way a
// reasonable USCIS officer would: words in parentheses are optional, small
// spelling mistakes are fine, filler like "I think it's" is ignored.

const STOP = new Set([
  "the", "a", "an", "of", "to", "in", "on", "for", "and", "or", "is", "are", "was", "it", "its", "that", "they", "their",
  "be", "by", "with", "from", "at", "as", "there", "because", "so",
]);

const FILLER = [
  /^(um+|uh+|er+|okay|ok|well|so)\b/g,
  /\b(i think|i believe|i guess|maybe|the answer is|answer is|it is|it's|its)\b/g,
];

const NUMBER_WORDS: Record<string, string> = {
  one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
  eighteen: "18", "twenty seven": "27", "twenty-seven": "27", "one hundred": "100", hundred: "100",
  "four hundred thirty five": "435", "four hundred and thirty five": "435", "four thirty five": "435",
  first: "1st", second: "2nd", third: "3rd", fourth: "4th", tenth: "10th", fourteenth: "14th", fifteenth: "15th",
  sixteenth: "16th", nineteenth: "19th", "twenty second": "22nd", "twenty-second": "22nd", "thirty fourth": "34th",
};

export function normalize(s: string): string {
  let t = (s || "")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/u\.s\./g, "us")
    .replace(/d\.c\./g, "dc")
    .replace(/'s\b/g, "s")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Longest number phrases first, so "twenty seven" wins over "seven".
  for (const [word, digit] of Object.entries(NUMBER_WORDS).sort((a, b) => b[0].length - a[0].length)) {
    t = t.replace(new RegExp(`\\b${word.replace(/-/g, " ")}\\b`, "g"), digit);
  }
  return t.replace(/\s+/g, " ").trim();
}

function stripFiller(s: string): string {
  let t = s;
  for (const re of FILLER) t = t.replace(re, " ");
  return t.replace(/\s+/g, " ").trim();
}

/** All the ways an official answer can be said: with and without each "(...)" part. */
export function variants(answer: string): string[] {
  const parts = answer.split(/(\([^)]*\))/g).filter(Boolean);
  const optional = parts.map((p) => p.startsWith("("));
  const count = optional.filter(Boolean).length;
  const out = new Set<string>();
  for (let mask = 0; mask < 1 << Math.min(count, 4); mask++) {
    let k = 0;
    const text = parts
      .map((p, i) => {
        if (!optional[i]) return p;
        const keep = (mask >> k++) & 1;
        return keep ? p.slice(1, -1) : "";
      })
      .join(" ");
    out.add(normalize(text));
  }
  // "Twenty-seven (27)" → also accept "27" alone.
  for (const m of answer.matchAll(/\(([^)]*\d[^)]*)\)/g)) out.add(normalize(m[1]));
  return Array.from(out).filter(Boolean);
}

// Words people naturally leave out: "executive" for "Executive branch".
const SOFT = new Set(["branch"]);
const COUNTRY = new Set(["united", "state", "states", "us", "america", "american", "nation"]);

const stem = (w: string) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w);
function tokens(s: string): string[] {
  return s.split(" ").filter((w) => w && !STOP.has(w)).map(stem);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

function closeWord(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 5 || b.length < 5) return false; // short words must be exact (e.g. "war" vs "law")
  return levenshtein(a, b) <= (Math.max(a.length, b.length) > 8 ? 2 : 1);
}

/** Does what the learner said contain this one official answer? */
function saysVariant(userNorm: string, userTokens: string[], v: string): boolean {
  if (!v) return false;
  // "Vice president" is never the answer "president".
  if (userTokens.includes("vice") && !v.split(" ").includes("vice") && v.split(" ").includes("president")) return false;
  if (` ${userNorm} `.includes(` ${v} `)) return true;
  let need = tokens(v);
  if (!need.length) return userNorm === v;
  // "First president of the United States" → "the first president" is enough.
  const core = need.filter((t) => !COUNTRY.has(t) && !SOFT.has(t));
  if (core.length && core.length < need.length) need = core;
  const found = need.filter((t) => userTokens.some((u) => closeWord(u, t))).length;
  // Long answers (like the 9/11 sentences) can be paraphrased; short ones need every key word.
  const required = need.length >= 6 ? Math.ceil(need.length * 0.6) : need.length;
  return found >= required;
}

export type MatchResult = { correct: boolean; matched: string[]; needed: number };

/**
 * accepted: the official answers (or the learner's own, for state questions).
 * needed: how many different answers are required ("Name three" = 3).
 */
export function checkAnswer(said: string, accepted: string[], needed = 1): MatchResult {
  const userNorm = stripFiller(normalize(said));
  const userTokens = tokens(userNorm);
  if (!userNorm) return { correct: false, matched: [], needed };

  const matched: string[] = [];
  for (const answer of accepted) {
    if (variants(answer).some((v) => saysVariant(userNorm, userTokens, v))) matched.push(answer);
  }

  // One answer can't count twice: "Freedom of speech" shouldn't also satisfy
  // "Freedom of expression" unless the learner said both.
  let distinct = matched;
  if (needed > 1) {
    const used = new Set<string>();
    distinct = matched.filter((m) => {
      const key = tokens(normalize(m.replace(/\([^)]*\)/g, ""))).filter((t) => !used.has(t));
      if (!key.length) return false;
      key.forEach((t) => used.add(t));
      return true;
    });
  }
  return { correct: distinct.length >= needed, matched: distinct, needed };
}
