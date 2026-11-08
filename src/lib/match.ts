// Checks a spoken or typed answer against the official answers, the way a
// reasonable USCIS officer would: words in parentheses are optional, small
// spelling mistakes are fine, filler like "I think it's" is ignored.
import civics from "../../content/civics-2025.json";

const STOP = new Set([
  "the", "a", "an", "of", "to", "in", "into", "on", "for", "and", "or", "is", "are", "was", "it", "its", "that", "they", "their",
  "be", "by", "with", "from", "at", "as", "there", "because", "so", "during", "should", "jr", "says",
  // Helper verbs and pronouns that learners of English often leave out or mix up
  // ("everybody follow law", "she sign bill"); they never decide whether an answer is right.
  "must", "can", "will", "would", "do", "does", "did", "have", "has", "had",
  "he", "she", "his", "her", "him", "them", "we", "you", "my", "me", "who", "which", "about", "de",
]);

// How US-English speech recognition writes common words said with an Amharic (or
// similar) accent, plus spellings by sound. Only words that never appear in a right
// answer as themselves, so nothing correct is changed. See docs/esl-persona.md.
// A third part means: not when the answer also has these words.
const ACCENT: [RegExp, string, RegExp?][] = [
  [/\bwere\b/g, "war"], // "civil were", "declare were"
  // "boat" is "vote", except in "Germany sank American boats".
  [/\bboats?\b/g, "vote", /\b(?:germany?|german|sank|sink|sunk|attack\w*|ships?|lusitania)\b/],
  [/\bbice\b/g, "vice"],
  [/\bbeto(e?s)?\b/g, "veto"],
  [/\b(?:cord|cort|courd|caught|kort|kourt|coutr)(s?)\b/g, "court$1"],
  [/\bsupreme (?:quote|cot|code|cart)\b/g, "supreme court"],
  [/\b(?:suprim|supream|supreem|suprem)\b/g, "supreme"],
  [/\btaxis\b/g, "taxes"],
  [/\bpole tax\b/g, "poll tax"],
  [/\bfor live\b/g, "for life"],
  [/\bhi\b/g, "high"], // "hi taxis"
  [/\bsleeves\b/g, "slaves"],
  [/\bsheep\b/g, "ships"],
  [/\bcommunion\b/g, "communism"],
  [/\b(?:many won|money one)\b/g, "many one"],
  [/\blow\b/g, "law"], // "above the low"
  [/\b(?:right|rite)s? (laws?)\b/g, "write $1"],
  [/\b(?:rites|raits|rayts)\b/g, "rights"],
  [/\b(?:firs|ferst)\b/g, "first"],
  [/\btrumb\b/g, "trump"],
  [/\bthe sides?\b/g, "decides"], // "it the side who become president"
  [/\bnew clear\b/g, "nuclear"],
  [/\bso be it union\b/g, "soviet union"],
  [/\b(?:bear|pear|bearl|perl) harbou?r\b/g, "pearl harbor"],
  [/\bmayflower combat\b/g, "mayflower compact"],
  [/\bbanker\b/g, "bunker"],
  [/\bbunker (?:heel|hil)\b/g, "bunker hill"],
  [/\bsojourner true\b/g, "sojourner truth"],
  [/\bjohn j\b/g, "john jay"],
  [/\bstar (?:bangle|spangle|spangel)d?\b/g, "star spangled"],
  [/\bt(irty|irteen|ird|ree|anksgiving)\b/g, "th$1"],
  [/\btanks? giving\b/g, "thanksgiving"],
  // Numbers spelled by sound, run together, or heard as other words.
  [/\b(four|fif|six|seven|eigh|nine)teent\b/g, "$1teenth"],
  [/\bninteen(th)?\b/g, "nineteen$1"],
  [/\bforteen(th)?\b/g, "fourteen$1"],
  [/\bforth\b/g, "fourth"],
  [/\b(?:handred|hundered|hunderd|hundret|hundrad)\b/g, "hundred"],
  [/\bfor hundred\b/g, "four hundred"],
  [/\bfourty\b/g, "forty"],
  [/\bfivety\b/g, "fifty"],
  [/\b(?:tweny|twenti|twinty|tuenty)\b/g, "twenty"],
  [/\b(?:sevin|seben|sevan)\b/g, "seven"],
  [/\b(?:nain|nien|nein)\b/g, "nine"],
  [/\b(?:fiv|fiev|faiv|fife)\b/g, "five"],
  [/\bsixe\b/g, "six"],
  [/\b(?:yers|yeres|yeers)\b/g, "years"],
  [/\bsex (years?)\b/g, "six $1"],
  [/\b(?:to|too|tow|twoo|tu) (years?|senators?)\b/g, "two $1"],
  [/^(?:to|too|tow|twoo|tu)$/g, "two"],
  [/^(?:for|fore|foor)$/g, "four"],
  [/\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(one|two|three|four|five|six|seven|eight|nine|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth)\b/g, "$1 $2"],
  [/\b(one|two|three|four|five|six|seven|eight|nine)(hundred|thousand)\b/g, "$1 $2"],
  [/\b(?:rasha|rusha|rashia)\b/g, "russia"],
  [/\brose ?belt\b/g, "roosevelt"],
  [/\b(?:this evil|sybil|sibyl) war\b/g, "civil war"],
  [/\bsibil\b/g, "civil"],
  [/\bwor\b/g, "war"],
  [/\bwold war\b/g, "world war"],
  [/\b(?:quait|kuwet|kuweit)\b/g, "kuwait"],
  [/\birak\b/g, "iraq"],
  [/\b(?:newyork|nyc)\b/g, "new york"],
  [/\bny\b/g, "new york"],
  [/\b(?:nu|niu|niw|nyu|neu) (york|jersey|jersy|hampshire|hampshir|hamshire|hampsher)\b/g, "new $1"],
  [/\b(?:road|rode|rod|roud) (?:island|iland|ayland|ailand)\b/g, "rhode island"],
  [/\b[ck]onn?e(?:c?t|kt|k)i[ck][ua]t\b/g, "connecticut"],
  [/\bunited? states?\b/g, "united states"],
  [/\bdelawer\b/g, "delaware"],
  [/\b(?:senet|sennet|senat)\b/g, "senate"],
  [/\bcongres\b/g, "congress"],
  [/\b(?:lisence|lisense|licens)\b/g, "license"],
  [/\bjul(?:ly|ay|ai|i)\b/g, "july"],
  [/\bpost master\b/g, "postmaster"],
  [/\b(?:teroris|terorist|terorists|tearist|tearists)\b/g, "terrorists"],
  [/\bapachi\b/g, "apache"],
  [/\b(?:sue|soo|su|siux)\b/g, "sioux"],
  [/\bhoppy\b/g, "hopi"],
  [/\bsha?y[ae]nn?e?\b/g, "cheyenne"],
  [/\bbare arms\b/g, "bear arms"],
  [/\bthemself\b/g, "themselves"],
  [/\bgolf war\b/g, "gulf war"],
  [/\b(?:vans|bans|bance|vence)\b/g, "vance"],
  [/\b(?:deputy president|vp)\b/g, "vice president"],
  [/\b(?:kab[ie]ne?t?|cabine)\b/g, "cabinet"],
  [/\b(?:disi|dici|di si|dee see|dee cee|d see)\b/g, "dc"],
  [/\blin(?:k|c|kc)[oue]l?n\b/g, "lincoln"], // "Linkon"
  [/\bki?rism[ae]s+\b/g, "christmas"],
  [/\bjuneteen\b/g, "juneteenth"],
  [/\blite\b/g, "light"],
  [/\bforj\b/g, "forge"],
  [/\b(?:foren|forin)\b/g, "foreign"],
  [/\blaw of piece\b/g, "law of peace"],
  [/\bobay(s|ed)?\b/g, "obey$1"],
  [/\bchef\b/g, "chief"], // "comander and chef"
  [/\bdr\b/g, "doctor"], // "Dr. King Day"
  // "konstitushon", "naturalizashon", "taxashon" → "-tion".
  [/\b(\w{3,})(?:shon|shun|shin|shen)\b/g, "$1tion"],
  // "dont", "cant" typed without the apostrophe → same as "don't", "can't".
  [/\b(don|doesn|didn|isn|aren|wasn|can|won|hasn|haven)t\b/g, "$1 t"],
];

const FILLER = [
  /^(um+|uh+|er+|okay|ok|well|so)\b/g,
  /\b(i think|i believe|i guess|maybe|the answer is|answer is|it is|it's|its)\b/g,
];

// Spoken numbers → digits: "thirteen colonies", "twenty seventh", "seventeen seventy six".
const UNITS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const UNIT_ORD = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth"];
const TEENS = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TEEN_ORD = ["tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const NUMBER_WORDS: Record<string, string> = {
  "four hundred thirty five": "435", "four hundred and thirty five": "435", "four thirty five": "435",
  // "h100" until "two hundred" becomes 200; typed "2, 100" stays two numbers.
  "one hundred": "100", "a hundred": "100", hundred: "h100",
};
for (let t = 2; t < 10; t++) {
  NUMBER_WORDS[TENS[t]] = String(t * 10);
  NUMBER_WORDS[TENS[t].replace(/y$/, "ieth")] = String(t * 10);
  for (let u = 1; u < 10; u++) {
    NUMBER_WORDS[`${TENS[t]} ${UNITS[u]}`] = String(t * 10 + u);
    NUMBER_WORDS[`${TENS[t]} ${UNIT_ORD[u]}`] = String(t * 10 + u);
  }
}
TEENS.forEach((w, i) => { NUMBER_WORDS[w] = String(10 + i); NUMBER_WORDS[TEEN_ORD[i]] = String(10 + i); });
for (let u = 1; u < 10; u++) { NUMBER_WORDS[UNITS[u]] = String(u); NUMBER_WORDS[UNIT_ORD[u]] = String(u); }
// Longest phrases first, so "twenty seven" wins over "seven".
const NUMBER_RES = Object.entries(NUMBER_WORDS)
  .sort((a, b) => b[0].length - a[0].length)
  .map(([w, d]) => [new RegExp(`\\b${w}\\b`, "g"), d] as const);

export function normalize(s: string): string {
  let t = (s || "")
    .toLowerCase()
    // Accents off, so "Hagatna" = "Hagåtña" and "Lujan" = "Luján".
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/u\.s\.s\.r\.?/g, "ussr")
    .replace(/u\.s\./g, "us")
    .replace(/d\.c\./g, "dc")
    .replace(/'s\b/g, "s")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  for (const [re, to, unless] of ACCENT) if (!unless?.test(t)) t = t.replace(re, to);
  t = t
    // Official answers say "World War II"; speech gives "World War 2" or "two".
    .replace(/\bworld war ii\b/g, "world war 2")
    .replace(/\bworld war i\b/g, "world war 1")
    // Everyday words for the official ones: "nobody is above the law", "everybody has to follow the law".
    .replace(/\bnobody\b/g, "no one")
    .replace(/\beverybody\b/g, "everyone")
    .replace(/\b(has|have) to\b/g, "must")
    // "do not", "don't", "no", "never", "without" are the same "not": "you do not have to pay to vote",
    // "you no pay for vote", "taxation without representation" = "tax but no representation".
    .replace(/\b(?:do|does|did) not\b|\b(?:don|doesn|didn) t\b|\bno\b|\bnever\b|\bwithout\b/g, "not")
    .replace(/\bcannot\b|\bcan t\b/g, "can not")
    // Typed sound-alikes: "fore years", "vise president".
    .replace(/\b(fore|for) years\b/g, "4 years")
    .replace(/\bvise\b/g, "vice")
    // Speech sound-alikes and split words: "road island", "mary land", "thanks giving", "vito".
    .replace(/\b(road|rode) island\b/g, "rhode island")
    .replace(/\bmary land\b/g, "maryland")
    .replace(/\bthanks giving\b/g, "thanksgiving")
    .replace(/\bvito(e?s)?\b/g, "veto")
    .replace(/\bmlk\b/g, "martin luther king")
    .replace(/\bst\b/g, "saint") // "St. Paul"
    // "U S", "USA", "D C" (letters spoken or typed apart), and "United States" = "US",
    // so "Secretary of State" keeps "state" as a key word.
    .replace(/\bu s s r\b/g, "ussr")
    .replace(/\bu s( a)?\b/g, "us")
    .replace(/\busa\b/g, "us")
    .replace(/\bd c\b/g, "dc")
    .replace(/\bunited states( of america)?\b/g, "us");
  for (const [re, digit] of NUMBER_RES) t = t.replace(re, digit);
  // Years said the long way: "one thousand seven hundred seventy six", "eighteen hundred seventy".
  t = t
    .replace(/\b([1-9]) thousand(?: and)?(?: ([1-9]) h100)?(?: and)?(?: ([1-9]\d?))?\b/g, (_, a, b, c) => String(+a * 1000 + (+b || 0) * 100 + (+c || 0)))
    .replace(/\b(1\d) h100(?: and)?(?: ([1-9]\d?))?\b/g, (_, h, n) => String(+h * 100 + (+n || 0)));
  // "nine hundred" is 900, not "9"; "two hundred and five" is 205.
  t = t.replace(/\b([1-9]) h100(?: and)? ([1-9]\d?)\b/g, (_, h, n) => String(+h * 100 + +n)).replace(/\b([1-9]) h100\b/g, (_, h) => String(+h * 100));
  t = t.replace(/\bh100\b/g, "100");
  // Speech writes "twenty-seven" as "20 7", "twenty-second" as "20 second", "four thirty-five" as "4:35".
  t = t.replace(/\b([2-9])0 ([1-9])\b/g, "$1$2").replace(/\b4 35\b/g, "435");
  t = t.replace(/\b0+(\d)/g, "$1"); // "07/04/1776"
  // Years said as two numbers: "seventeen seventy six" → 1776, "nineteen twenty" → 1920.
  t = t.replace(/\b(1[7-9]) (\d\d)\b/g, "$1$2");
  // "WW2", "WWII", "WW 1".
  t = t.replace(/\bww ?(ii|2)\b/g, "world war 2").replace(/\bww ?(i|1)\b/g, "world war 1");
  // "14th" and "14" are the same answer ("Amendment 14" for "14th Amendment").
  t = t.replace(/\b(\d+)(st|nd|rd|th)\b/g, "$1");
  t = t.replace(/\bjune 19\b/g, "juneteenth");
  return t.replace(/\s+/g, " ").trim();
}

function stripFiller(s: string): string {
  let t = s;
  for (const re of FILLER) t = t.replace(re, " ");
  return t.replace(/\s+/g, " ").trim();
}

/** All the ways an official answer can be said: with and without each "(...)" part. */
const variantCache = new Map<string, string[]>();
export function variants(answer: string): string[] {
  let v = variantCache.get(answer);
  if (!v) variantCache.set(answer, (v = variantsUncached(answer)));
  return v;
}

function variantsUncached(answer: string): string[] {
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
  // "Be born in the United States, under the conditions set by the 14th Amendment"
  // → "born in the United States" is enough; the "under …" part explains it.
  const [main, under] = answer.split(/,\s*under\b/);
  if (under !== undefined) variants(main).forEach((v) => out.add(v));
  // "Twenty-seven (27)" → also accept "27" alone, but not "18" alone for "Citizens eighteen (18) and older".
  const short = answer.replace(/\([^)]*\)/g, " ").trim().split(/\s+/).length <= 3;
  for (const m of answer.matchAll(/\(([^)]*\d[^)]*)\)/g)) if (short || !/^\d+$/.test(m[1])) out.add(normalize(m[1]));
  for (const extra of ALSO[answer] ?? []) out.add(normalize(extra));
  return Array.from(out).filter(Boolean);
}

// Other ways of saying an official answer that an officer would accept. The
// official text is never changed; these are only extra phrasings the checker
// also takes. Keyed by the official answer exactly as in civics-2025.json.
// Found by two sweeps of all 128 questions (Nov 7, 2026); add to it when a learner's
// fair answer is marked wrong, with a line in scripts/phrasings.ts.
export const ALSO: Record<string, string[]> = {
  "Forms the government": ["creates the government", "sets up the government", "makes the government"],
  "Protects the rights of the people": ["protects our rights", "protects people's rights", "protects rights", "protects people's freedom"],
  "It says all people are created equal.": ["all men are created equal", "all people are equal"],
  "It says America is free from British control.": ["free from Britain", "free from British control", "not under British control"],
  "Free market economy": ["free market", "market economy"],
  "Everyone must follow the law.": ["all people must follow the law", "people must follow the law", "the law is the boss of everyone", "the law is above everyone"],
  "Leaders must obey the law.": ["the president must obey the law", "the president is not above the law", "leaders are not above the law"],
  "So one part does not become too powerful": ["too powerful", "too much power", "not all the power"],
  "Separation of powers": ["separate the powers"],
  "Writes laws": ["makes laws", "passes laws", "issues laws"],
  "Makes the federal budget": ["makes the budget", "decide how to spend the money"],
  "To more closely follow public opinion": [
    "follow public opinion", "what the people think", "what the people want", "people's opinion", "listen to the people", "public opinion",
    "what the public thinks",
  ],
  "Citizens from their state": ["people of their state", "voters of their state"],
  "Citizens from their (congressional) district": ["people in their district", "voters in their district"],
  "(Because of) the state's population": ["population"],
  "The Great Compromise (Connecticut Compromise)": ["Connecticut Compromise"],
  "To keep the president from becoming too powerful": ["too powerful", "too much power", "become like a king", "not become a king", "not become a dictator"],
  "Federal departments and agencies": ["federal departments", "federal agencies", "agencies", "departments", "USCIS", "FBI", "IRS", "CIA"],
  "Secretary of War (Defense)": ["Secretary of Defense"],
  "It decides who is elected president.": ["elects the president", "decides who becomes president", "chooses the president", "decides who is president", "decides who wins", "makes the president"],
  "It provides a compromise between the popular election of the president and congressional selection.": ["compromise between the popular vote and Congress", "people and Congress compromise"],
  "Resolves disputes (disagreements) about the law": ["resolves disagreements about the law", "solves problems about the law"],
  "(Until) retirement": ["until they retire", "until they stop working"],
  "To limit outside (political) influence": [
    "limit political influence", "not influenced by politics", "no political influence", "politics not influence", "no politics influence",
    "not influenced", "not worry about elections",
  ],
  "Print paper money": ["print money", "make money"],
  "Provide schooling and education": ["schooling", "education", "schools"],
  "Provide protection (police)": ["police"],
  "Provide safety (fire departments)": ["fire departments", "fire department"],
  "Give a driver's license": ["driver's license", "driver license"],
  "Approve zoning and land use": ["zoning", "land use", "where people can build"],
  "Any citizen can vote. (Women and men can vote.)": ["women can vote"],
  "Support or oppose an issue or policy": ["support or oppose a policy", "support or oppose an issue", "oppose a policy", "support a policy"],
  "Writer of the Declaration of Independence": ["wrote the Declaration of Independence"],
  "Serve in the military": ["join the military"],
  "Work for local, state, or federal government": ["work for the government"],
  "All people pay to fund the federal government": [
    "fund the government", "give money to the government", "government needs money", "everyone pays for the government", "pay for the government",
    "support the government", "pay for roads", "pay for schools", "pay for the military",
  ],
  "Required by law": ["it's the law"],
  "Makes the draft fair, if needed": ["draft fair"],
  "July 4, 1776": ["7/4/1776"],
  "Washington Crossing the Delaware (Battle of Trenton)": ["Battle of Trenton", "crossing the Delaware", "Trenton"],
  "They helped people understand the (U.S.) Constitution.": ["explained the Constitution", "people understand the Constitution"],
  "They supported passing the (U.S.) Constitution.": ["supported the Constitution", "helped pass the Constitution", "people say yes to the Constitution"],
  "Founded the first free public libraries": ["first free public library", "first free library"],
  "General of the Continental Army": [
    "led the Continental Army", "commander of the Continental Army", "general of the army", "general in the Revolutionary War",
    "led the army against Britain", "led the army in the Revolutionary War",
  ],
  "Helped establish the First Bank of the United States": ["First Bank of the United States"],
  "Doubled the size of the United States (Louisiana Purchase)": ["Louisiana Purchase", "bought Louisiana", "two times bigger", "doubled the country"],
  "One of the writers of the Federalist Papers": ["wrote the Federalist Papers"],
  "Civil War": ["war between the states", "war between the North and the South", "war of the North and the South"],
  "The Civil War": ["war between the states", "war between the North and the South", "war of the North and the South"],
  "(Battle of) Antietam/Sharpsburg": ["Antietam", "Sharpsburg"],
  "Freed the slaves (Emancipation Proclamation)": ["Emancipation Proclamation", "ended slavery"],
  "Saved (or preserved) the Union": ["preserved the Union", "kept the country together"],
  "Delivered the Gettysburg Address": ["Gettysburg Address"],
  "Freed slaves in the Confederate states": ["ended slavery in the Confederate states"],
  "14th Amendment": ["14th"],
  "Korean War": ["Korea"],
  "Vietnam War": ["Vietnam"],
  "To support the Allied Powers (England, France, Italy, and Russia)": ["support the Allies", "support England and France"],
  "To oppose the Central Powers (Germany, Austria-Hungary, the Ottoman Empire, and Bulgaria)": ["oppose Germany"],
  "Longest economic recession in modern history": [
    "longest economic recession", "longest recession", "long economic recession", "very bad economy", "economic crisis", "economy was bad for a long time",
    "economic recession",
  ],
  "(Franklin) Roosevelt": ["FDR"],
  "To support the Allied Powers (England, France, and Russia)": ["support the Allies", "support England, France, and Russia"],
  "To oppose the Axis Powers (Germany, Italy, and Japan)": ["oppose Germany, Italy, and Japan", "fight Hitler", "stop Hitler", "fight Germany"],
  "President at the end of (during) the Korean War": ["President during the Korean War"],
  "Signed the Federal-Aid Highway Act of 1956 (Created the Interstate System)": ["Created the Interstate System", "interstate highways", "highways", "freeways"],
  "Soviet Union": ["the Soviets"],
  "To stop the spread of communism": ["communism"],
  "Fought to end racial discrimination": [
    "fought racial discrimination", "against racial discrimination", "end discrimination", "against discrimination",
    "against racism", "end racism", "fight for civil rights", "equal rights", "no discrimination",
  ],
  "To force the Iraqi military from Kuwait": [
    "Iraq out of Kuwait", "remove Iraq from Kuwait", "free Kuwait", "liberate Kuwait", "Iraq invaded Kuwait", "Iraqi military leave Kuwait",
    "make Iraq leave Kuwait", "Iraq took Kuwait",
  ],
  "Terrorists attacked the United States": [
    "terrorists crashed planes", "terrorists crashed a plane", "Twin Towers were attacked", "attacked the Twin Towers",
    "planes crashed into buildings", "planes crashed into the World Trade Center", "attacked New York", "America was attacked",
    "attacked America", "attack on America", "attacked the Pentagon", "plane crashed in Pennsylvania",
  ],
  "War in Afghanistan": ["Afghanistan"],
  "War in Iraq": ["Iraq"],
  "Light bulb": ["lightbulb", "bulb"],
  "Automobile (cars, internal combustion engine)": ["cars", "car", "internal combustion engine"],
  "(Because there were) 13 original colonies": ["13 colonies", "13 original states"],
  "(Because there is) one star for each state": ["one for each state", "one star for one state"],
  "We all become one": ["become one", "we are all one"],
  "Independence Day": ["Fourth of July", "July 4th"],
  "Presidents Day (Washington's Birthday)": ["Washington's Birthday"],
  "A holiday to honor soldiers who died in military service": [
    "soldiers who died", "fallen soldiers", "died serving", "soldiers who lost their lives", "soldiers who lost their life",
  ],
  "A holiday to honor people in the (U.S.) military": ["honor veterans", "veterans"],
  "Commander in Chief (of the military)": ["commander of the military", "boss of the military", "head of the military", "leader of the military"],
  "Appoints federal judges": ["appoints judges", "nominates judges", "chooses judges"],
  "Advises the President (of the United States)": ["helps the president", "give ideas to the president", "give advice to the president"],
  "Federal Courts": ["courts"],
  "Reviews laws": ["interprets laws"],
  "Decides if a law goes against the (U.S.) Constitution": [
    "interprets the Constitution", "decides if laws are constitutional", "decides if a law is unconstitutional", "law is against the Constitution",
  ],
  "Lifetime appointment": ["lifetime"],
  "(For) life": ["until they die", "until death"],
  "Mint coins": ["coin money", "make coins"],
  "Make treaties": ["sign treaties", "make agreements with other countries"],
  "Set foreign policy": ["foreign policy"],
  "Create an army": ["make an army", "army"],
  "Secretary of Health and Human Services": ["HHS secretary", "Secretary of Health", "Health secretary"],
  "Secretary of Homeland Security": ["Secretary of Homeland", "Homeland Security"],
  "Secretary of Housing and Urban Development": ["HUD secretary"],
  "Secretary of Veterans Affairs": ["VA secretary"],
  "Administrator of the Environmental Protection Agency": ["EPA administrator", "head of the EPA"],
  "Administrator of the Small Business Administration": ["SBA administrator"],
  "Director of the Central Intelligence Agency": ["CIA director", "director of the CIA"],
  "Director of the Office of Management and Budget": ["OMB director"],
  "Director of National Intelligence": ["DNI"],
  "The right to bear arms": ["right to own guns", "right to have guns", "gun rights", "carry guns", "carry a gun", "own guns", "have guns", "bear arms"],
  "Give up loyalty to other countries": [
    "renounce loyalty to other countries", "renounce other countries", "leave loyalty to my old country", "not loyal to other countries",
    "leave loyalty to other countries",
  ],
  "Inventor": ["invented"],
  "First Postmaster General of the United States": ["Postmaster General", "first postmaster", "postmaster"],
  "Lincoln was assassinated.": ["Lincoln was killed", "Lincoln was shot"],
  "(Persian) Gulf War": ["Desert Storm"],
  "Because Germany attacked U.S. (civilian) ships": ["Germany sank American ships", "Lusitania"],
  "The Great Crash (1929)": ["Black Tuesday"],
  "Nuclear war": ["nuclear weapons", "nuclear bombs", "atomic war"],
  "Fought for civil rights": ["I have a dream", "rights for black people", "black people's rights"],
  "Airplane": ["plane"],
  "Integrated circuit (IC)": ["microchip", "computer chip"],
  "New York (Harbor)": ["NYC"],
  "Out of many, one": ["from many, one"],
  // Officers get the full list of federally recognized tribes; these are common ones not printed on the test.
  Apache: [
    "Iroquois", "Comanche", "Ojibwe", "Ojibwa", "Blackfoot", "Shoshone", "Pawnee", "Arapaho", "Nez Perce", "Kiowa", "Osage", "Ute", "Zuni",
    "Paiute", "Yakama", "Chickasaw", "Muscogee", "Potawatomi", "Menominee", "Ho-Chunk", "Lumbee", "Tlingit", "Yupik", "Hualapai",
    "Havasupai", "Wampanoag", "Narragansett", "Pequot", "Lenape", "Miami", "Ottawa", "Kickapoo", "Haudenosaunee", "Dakota", "Nakota",
    "Mandan", "Hidatsa", "Arikara", "Assiniboine", "Gros Ventre", "Salish", "Kootenai", "Tohono O'odham", "Pima", "Yaqui", "Hoopa", "Yurok", "Karuk",
    "Mohican",
  ],
  "Defines powers of government": ["powers of government"],
  "Defines the parts of government": ["parts of government"],
  "It identifies individual freedoms.": ["gives individual freedom", "individual freedoms", "gives freedom to every person"],
  "Equal representation (for small states)": [
    "small states same power", "same power for small states", "small and big states the same", "equal power for each state", "every state is equal",
  ],
  "(Because) they have more people": ["more people live there"],
  "Enforces laws": ["makes sure everyone follows the law", "makes sure people follow the law"],
  "To be independent (of politics)": ["free from politics"],
  "You don't have to pay (a poll tax) to vote.": ["no need to pay to vote", "no poll tax", "don't need to pay to vote"],
  "Freedom of assembly": ["meet together", "free to meet", "freedom to gather"],
  "Freedom to petition the government": ["petition", "ask the government"],
  "Serve in the military (if needed)": ["fight in the military", "fight for America", "join the military"],
  "Contact elected officials": ["call my senator", "call my representative", "contact my senator", "contact my representative", "write to my senator"],
  "High taxes": ["too much tax", "taxes too high", "taxes"],
  "President of the Constitutional Convention": ["president of the Constitution Convention", "president of the meeting for the Constitution"],
  "Aide to General George Washington": ["helper to George Washington", "helped George Washington", "assistant to George Washington", "aide to George Washington"],
  "Elizabeth Cady Stanton": ["Elizabeth Stanton", "Stanton"],
  "Stock market crash of 1929": ["stock market crash", "Wall Street crash"],
  "Worked to ensure that people would \"not be judged by the color of their skin, but by the content of their character\"": ["not be judged by the color of their skin"],
  "Landing on the moon": ["go to the moon", "went to the moon", "going to the moon"],
  "Washington, D.C.": ["District of Columbia"],
  "A holiday to celebrate U.S. independence (from Britain)": [
    "holiday for independence", "independence from Britain", "America's independence", "celebrate America free from Britain",
    "America became free from Britain", "celebrate America's freedom",
  ],
  "A holiday to honor people who have served (in the U.S. military)": [
    "for people who served in the military", "honor soldiers who served", "honor former soldiers", "honor old soldiers",
    "thank people who served in the military", "thank everyone who served in the military",
  ],
  "(The basic) rights of Americans": ["our rights", "rights of the people"],
  "American Indians": ["Indians"],
  "American Revolution": ["the Revolution", "Revolution War"],
  "Senate and House (of Representatives)": ["senators and representatives", "Senate and representatives"],
  // Second Almaz round (Nov 8, 2026): her own words for the idea, and names she shortens.
  "Popular sovereignty": ["power comes from the people", "people have the power", "people are the boss of the government", "power belongs to the people"],
  "Consent of the governed": ["power because the people agree", "people agree to the government"],
  "Self-government": ["govern themselves", "people choose the leaders"],
  "It identifies inherent rights.": ["inherent rights", "rights from God", "rights that cannot be taken"],
  "Natural rights": ["rights from birth", "born with rights", "pursuit of happiness"],
  "No one is above the law.": ["equal under the law"],
  "Checks and balances": ["check each other", "balance of power"],
  "(U.S.) Congress": ["Senate and House"],
  "Declares war": ["start a war"],
  "Declare war": ["start a war"],
  "Signs bills into law": ["signs bills", "signs laws"],
  "Vetoes bills": ["veto", "reject bills", "say no to bills"],
  "(It states that the) powers not given to the federal government belong to the states or to the people.": [
    "the states and the people keep the other powers", "other powers belong to the states", "states have the power federal does not have",
    "not federal is for the states",
  ],
  "A male citizen of any race (can vote).": ["any race can vote", "black men can vote", "African Americans can vote"],
  "Freedom of religion": ["freedom to pray", "freedom to worship"],
  "Serve (help, do important work for) the nation (if needed)": ["help the nation", "do important work for the nation"],
  Naturalize: ["test and oath"],
  "Derive citizenship (under conditions set by Congress)": ["from parents", "citizen parents", "parents are citizens"],
  "Be born in the United States, under the conditions set by the 14th Amendment": ["by birth", "born here"],
  "Join a political party": ["join a party"],
  Vote: ["choose the leaders", "elect leaders"],
  "Civic duty": ["duty"],
  "Economic opportunity": ["better life", "jobs", "work", "money"],
  "Escape persecution": ["run away from bad treatment", "run away from persecution"],
  "They did not have self-government": ["not govern themselves"],
  "U.S. diplomat": ["diplomat", "ambassador", "went to France", "go to France"],
  "First Secretary of the Treasury": ["Secretary of the Treasury"],
  "First Secretary of State": ["Secretary of State"],
  "Mexican-American War": ["war with Mexico", "Mexican War"],
  "Spanish-American War": ["war with Spain"],
  "Led the United States during the Civil War": ["president during the Civil War"],
  "After the Civil War": ["after the war between the North and the South"],
  "Worked for equality for all Americans": ["fight for equality", "work for equality"],
  Skyscrapers: ["tall buildings"],
  "(Because) each star represents a state": ["each star is a state"],
  "Congress, president, and the courts": ["Congress, the White House, and the courts"],
  "Martin Luther King, Jr. Day": ["Doctor King Day", "King Day", "Martin Luther Day"],
  "Susan B. Anthony": ["Anthony", "Susan Anthony"],
  "Harriet Tubman": ["Tubman"],
  "Sojourner Truth": ["Sojourner"],
  "Lucretia Mott": ["Mott"],
  "Articles of Confederation": ["Articles of Confederacy"],
  "Federalist Papers": ["Federal Papers"],
  "Iroquois Great Law of Peace": ["Great Law of Peace"],
  "Boston Tea Party (Tea Act)": ["tea party"],
  "Stamp Act": ["stamp tax"],
  "Japanese attacked Pearl Harbor": ["Japan attacked Hawaii", "Japan attacked America"],
  "People from Africa": ["Africa"],
  Africans: ["black people"],
  "Freed the slaves": ["freed black people"],
  "Declaration of Independence": ["the Declaration"],
  "Native Americans": ["native people", "natives"],
  "Citizens eighteen (18) and older (can vote).": ["18 and older", "18 can vote", "18 and up", "18 and above", "over 18"],
  "(Because of) the 22nd Amendment": ["22nd"],
  "(With the) 19th Amendment": ["19th"],
  "(With the) 15th Amendment": ["15th"],
  "North Carolina": ["Carolina"],
  "War of 1812": ["1812"],
  "Columbus Day": ["Indigenous Peoples Day"],
  '"Father of Our Country"': ["father of the country", "father of his country"],
};

// Words people naturally leave out: "executive" for "Executive branch",
// "civil rights" for "Fought for civil rights",
// "to fight communism" for "To stop the spread of communism".
// Also "speech, religion and assembly" for three freedoms, "equality for all Americans",
// "independence day"/"christmas" for holidays, "celebrate independence" for Independence Day.
// ("bill" is not one of them: "sign" alone doesn't say what the president signs.)
const SOFT = new Set(["branch", "fought", "spread", "freedom", "worked", "day", "holiday"]);

// Everyday words that mean the same as the official word (compared by root()):
// "fight communism" = "stop communism", "abolished slavery" = "freed the slaves".
const SAME = [
  ["stop", "fight", "prevent", "end"],
  ["fre", "abolish"],
  ["slav", "slavery"],
  // "loyal to America", "serve the country", "America's birthday".
  ["us", "america", "country", "nation"],
  ["follow", "obey", "respect"],
  ["military", "army"],
  ["support", "help"],
  ["oppos", "fight", "against", "protest"],
  ["iraq", "iraqi"],
  ["each", "every"],
  // "declaration of independent", "judiciary", "self governing", "equal rights", "to be free".
  ["independenc", "independent"],
  ["judicial", "judiciary"],
  ["govern", "government"],
  ["equal", "equality"],
  ["fre", "freedom"],
  // Simple words learners of English use for the official ones (see docs/esl-persona.md):
  // "people rule themself", "free from England", "nobody higher than law", "he choose judge".
  ["govern", "rul", "administer"],
  ["law", "rul"],
  ["britain", "british", "england", "english"],
  ["abov", "higher", "over"],
  ["mor", "many"],
  ["choos", "chos", "pick", "select"],
  ["found", "start", "establish", "form"],
  ["stay", "liv"],
  ["led", "lead", "leader"],
  ["die", "died", "dead", "death"],
  ["speech", "speak", "talk"],
  ["loyal", "loyalty"],
  ["korea", "korean"],
  ["liberty", "freedom", "fre"],
  ["buy", "bought"],
  ["fight", "fought"],
  // Second Almaz round (Nov 8, 2026): her simple words, and word-for-word translations
  // from Amharic ("announce war", "driving permit", "constituency", "examine the law").
  ["born", "birth"],
  ["equal", "sam"],
  ["all", "everyone"],
  ["mak", "creat", "prepar"],
  ["declar", "announc"],
  ["separ", "separat", "divid", "split"],
  ["protect", "keep", "kept", "guard", "defend", "sav", "preserv"],
  ["review", "check", "examin"],
  ["resolv", "decid", "solv", "settl"],
  ["disagre", "disagreement", "disput"],
  ["influenc", "control", "pressur", "push"],
  ["district", "constituency", "area"],
  ["licens", "permit"],
  ["driver", "driv"],
  ["religion", "religious"],
  ["represent", "representativ"],
  ["convention", "meet"],
  ["amend", "amendment"],
  ["legislativ", "legislatur", "congress"],
  ["economy", "economic"],
  ["recession", "declin", "fall", "downturn"],
  ["long", "longest"],
  ["rac", "racial"],
  ["powerful", "strong"],
  ["high", "heavy"],
  ["original", "1"], // "first colonies" ("first" is 1 by now)
  ["terror", "terrorist", "terrorism"],
  ["attack", "kill", "hit", "bomb"],
  ["ship", "boat"],
  ["sank", "sink", "sunk"],
  ["shot", "shoot"],
  ["tak", "took", "taken"],
  ["plan", "airplan"],
  ["ally", "alli"],
  ["address", "speech"],
  ["los", "lost"],
  ["man", "men", "mal"],
];

// Answers about the US don't count when the learner names another country and not the
// US: "my country Ethiopia", "join army of Ethiopia", "Ethiopian constitution", "citizen of Ethiopia".
const FOR_US_ONLY = new Set([
  "The United States", "The flag", "Be loyal to the United States", "Defend the (U.S.) Constitution",
  "Serve in the military", "Serve in the military (if needed)", "Serve (help, do important work for) the nation (if needed)",
  "Obey the laws of the United States", "Vote", "Pay taxes", "Obey the law", "Run for office", "Work for local, state, or federal government",
  "(U.S.) Constitution", "The President (of the United States)", "President (of the United States)", "Supreme Court",
  "Citizens", "Citizens of the United States", "U.S. citizens",
]);
const OTHER_COUNTRY = /\b(ethiopian?|eritrean?|somalia|kenya|sudan|egypt|nigeria|ghana|mexico|guatemala|salvador|honduras|cuba|haiti|china|india|pakistan|philippines|iran|syria|russia|ukraine|canada|england|britain)\b/;
const OTHER_COUNTRIES = new RegExp(OTHER_COUNTRY.source, "g");

// Other names that contain an official answer but mean someone or somewhere else.
// They're taken out of what the learner said before checking that answer:
// "Theodore Roosevelt" is not FDR, "West Virginia" was not one of the 13 colonies.
const IGNORE: Record<string, string[]> = {
  "(Franklin) Roosevelt": ["theodore roosevelt", "teddy roosevelt", "theodore", "teddy"],
  "(Thomas) Jefferson": ["jefferson davis"],
  "(James) Madison": ["dolley madison", "dolly madison"],
  Virginia: ["west virginia"],
  // "give up loyalty to other countries" is a different promise from "be loyal to the United States".
  "Be loyal to the United States": ["other countries", "other country", "my old country", "old country"],
  // From the second Almaz round (Nov 8, 2026).
  "Senate and House (of Representatives)": ["white house"],
  "New Year's Day": ["ethiopian new year", "chinese new year", "lunar new year"],
  "Christmas Day": ["ethiopian christmas"],
  "American Indians": ["indians from india"],
  "American Revolution": ["french revolution", "russian revolution", "ethiopian revolution"],
  "Out of many, one": ["out of one many"],
  "To be independent (of politics)": ["independent from england", "independent from britain"],
  // State, not federal: "state legislature", "state court", "Superior Court".
  "(U.S.) Congress": ["state legislature", "state legislative", "state congress"],
  "(U.S. or national) legislature": ["state legislature", "state legislative"],
  "Legislative branch": ["state legislature", "state legislative"],
  "Appoints federal judges": ["state judge", "state judges"],
  "Federal Courts": ["state court", "state courts", "superior court", "county court"],
  "Federal departments and agencies": ["fire department", "fire departments", "police department", "police departments"],
  // Current officeholders by last name: other people with the same last name.
  Johnson: ["lyndon johnson", "andrew johnson"],
  Trump: ["melania trump", "ivanka trump"],
};
// Answers that are wrong when the learner also says one of these words (unless she says "not …"):
// Veterans Day isn't for soldiers who died, green card holders can't vote, Japan didn't attack on 9/11.
const DIED = /\b(?:died|dead|death|killed|fallen|lost)\b/;
const NOT_CITIZENS = /\b(?:residents?|green card|immigrants?)\b/;
const NOT_WITH: Record<string, RegExp> = {
  "A holiday to honor people in the (U.S.) military": DIED,
  "A holiday to honor people who have served (in the U.S. military)": DIED,
  Citizens: NOT_CITIZENS,
  "Citizens of the United States": NOT_CITIZENS,
  "U.S. citizens": NOT_CITIZENS,
  "Terrorists attacked the United States": /\b(?:japan\w*|german\w*|pearl|iraq|iran)\b/,
  // The two sides swapped: "Kuwait out of Iraq", "America attacked Japan", "to spread communism".
  "To force the Iraqi military from Kuwait": /\bkuwait (?:military|army|out|took|take|takes|invaded|attacked)\b|\bforce kuwait\b/,
  "(Bombing of) Pearl Harbor": /\b(?:german\w*|america\w*|us) (?:attack\w*|bomb\w*)\b/,
  "Japanese attacked Pearl Harbor": /\b(?:german\w*|america\w*|us) (?:attack\w*|bomb\w*)\b/,
  "To stop the spread of communism": /\b(?:to|for|help) spread(?:ing)? communism\b/,
  "Freed the slaves": /\bnorth\w*\b/,
  Republic: /\b(?:parliament\w*|communist|socialist)\b/,
  // "The Declaration" is enough, but a made-up name isn't: "Declaration of Freedom".
  "Declaration of Independence": /^(?!.*\bindepend).*(?:\bdeclaration of (?:the )?(?!in|en)\w+|\b(?:freedom|liberty|rights?) declaration\b|\bdeclare[sd]?\b)/,
  // "Power belongs to the people" isn't said by the 10th Amendment's "…belong to the states or to the people".
  "Popular sovereignty": /\bfederal\b/,
  // The state's own supreme court isn't the highest court in the United States.
  "Supreme Court": /\bstate supreme court\b|\bsupreme court of (?!the us\b|us\b|america\b)\w+/,
};

// "First president of the United States" → "the first president" is enough.
// ("United States" is already "us" after normalize.)
const COUNTRY = new Set(["us", "america", "american"]);

// Plural "s" off, but not from "Publius", "congress" or "status".
const stem = (w: string) => (w.length > 4 && /[^siu]s$/.test(w) ? w.slice(0, -1) : w);
function words(s: string): string[] {
  // Single letters are initials ("Susan B. Anthony"), not key words.
  return s.split(" ").filter((w) => w && !STOP.has(w) && !/^[a-z]$/.test(w));
}
function tokens(s: string): string[] {
  return words(s).map(stem);
}
// The learner's words both with and without the plural "s" taken off, so a typo like
// "congres" or "licens" is compared as typed and not cut to "congre" or "licen".
function userTokensOf(s: string): string[] {
  const w = words(s);
  return Array.from(new Set([...w.map(stem), ...w]));
}

/** The key words of an official answer, without its optional "(...)" parts. */
export function keyWords(answer: string): string[] {
  return tokens(normalize(answer.replace(/\([^)]*\)/g, " ")));
}

/** Typos between two words. Two swapped letters ("gerogia") count as one typo. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const d = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** Rough word root, so "voting"/"vote", "vetoes"/"veto", "running"/"run" and "naturalization"/"naturalize" match. */
function root(w: string): string {
  let r = w;
  if (r.length >= 8 && r.endsWith("ation")) r = r.slice(0, -5); // "taxation" → "tax"
  // "running" → "run", but "crossing" → "cross", "calling" → "call".
  else if (r.length > 5 && r.endsWith("ing")) r = r.slice(0, -3).replace(/([bcdghjkmnpqrtv])\1$/, "$1");
  else if (r.length > 4 && r.endsWith("ies")) r = r.slice(0, -3) + "y";
  else if (r.length > 4 && r.endsWith("oes")) r = r.slice(0, -2);
  else if (r.length > 4 && r.endsWith("ed")) r = r.slice(0, -2);
  else if (r.length > 3 && /[^siu]s$/.test(r)) r = r.slice(0, -1); // "laws", but not "less", "this", "bus"
  else if (r.length > 4 && r.endsWith("ie")) r = r.slice(0, -2) + "y"; // "countries" after the plural "s" is gone
  return r.length > 3 ? r.replace(/e$/, "") : r;
}

// Words are compared many times per answer; remember the results so checking stays instant on a phone.
const closeCache = new Map<string, boolean>();
function closeWord(a: string, b: string): boolean {
  const key = `${a}|${b}`;
  let r = closeCache.get(key);
  if (r === undefined) closeCache.set(key, (r = closeWordUncached(a, b)));
  return r;
}

/**
 * Roughly how a word sounds: consonants only, with letters that sound alike merged, so
 * spellings by sound match: "Ruzvelt" = "Roosevelt", "Jorjia" = "Georgia", "Nusom" = "Newsom".
 */
function soundKey(w: string): string {
  return w
    .replace(/(.)\1+/g, "$1")
    .replace(/ph/g, "f")
    .replace(/gh(?=t|$)/g, "") // "right", "high"
    .replace(/chr/g, "kr")
    .replace(/[tc]i(?=[aou])|si(?=on)|sh/g, "S") // "-tion", "-sion", "-cial" and "sh"
    .replace(/ch/g, "C")
    .replace(/ck|q/g, "k")
    .replace(/c(?=[eiy])/g, "s")
    .replace(/c/g, "k")
    .replace(/x/g, "ks")
    .replace(/z/g, "s")
    .replace(/g(?=[eiy])|dg/g, "j")
    .replace(/v/g, "b") // "Gabin" (but p stays p: "Pence" isn't "Vance")
    .replace(/th/g, "t")
    .replace(/(?!^)[hw]/g, "")
    .replace(/y$/, "Y") // "policy" isn't "police"
    .replace(/(?!^)[aeiouy]/g, "")
    .replace(/^[aeiou]/, "a")
    .replace(/(.)\1+/g, "$1");
}

// Words that are in some right answer. One of them is never a misspelling of another word that
// sounds alike: "support" isn't "separate", "print" isn't "parent", "create" isn't "courts".
let known: Set<string> | undefined;
function isKnown(w: string): boolean {
  if (!known) {
    const answers = (civics.questions as { a: string[] }[]).flatMap((q) => q.a).concat(Object.values(ALSO).flat());
    known = new Set(answers.flatMap((a) => a.toLowerCase().split(/[^a-z]+/)).flatMap((x) => [x, stem(x)]));
  }
  return known.has(w);
}

function closeWordUncached(a: string, b: string): boolean {
  const ra = root(a), rb = root(b);
  if (a === b || ra === rb) return true;
  const [s, l] = a.length <= b.length ? [a, b] : [b, a];
  // A word with "un", "in" or "dis" in front means the opposite: "unlimited", "dependent".
  if (s.length >= 3 && l.endsWith(s) && /^(?:un|in|im|il|ir|dis|non)$/.test(l.slice(0, l.length - s.length))) return false;
  // Same meaning, also when one of them is misspelled ("goverment" for "government" ≈ "govern").
  const near = (x: string, y: string) =>
    x === y || (x.length >= 5 && y.length >= 5 && Math.abs(x.length - y.length) <= 1 && x[0] === y[0] && levenshtein(x, y) <= 1);
  if (SAME.some((g) => g.some((x) => near(ra, x)) && g.some((y) => near(rb, y)))) return true;
  // The last consonant left out: "donal", "trum", "presiden", "firs".
  if (s.length >= 4 && l.length === s.length + 1 && l.startsWith(s) && !/[aeiouy]$/.test(l)) return true;
  // A double letter written once: "Mot" for Mott (letters only: "100" isn't "1000").
  if (a.replace(/([a-z])\1+/g, "$1") === b.replace(/([a-z])\1+/g, "$1")) return true;
  if (s.length < 5) return false; // short words must be exact (e.g. "war" vs "law")
  // Spelled the way it sounds ("Pensilvenia", "konstitution"), maybe without the last sound ("protek", "diploma").
  if (l.length - s.length <= 2 && !(isKnown(a) && isKnown(b))) {
    const ka = soundKey(a), kb = soundKey(b);
    if (ka.length >= 3 && ka === kb) return true;
    const [ks, kl] = ka.length <= kb.length ? [ka, kb] : [kb, ka];
    if (ks.length >= 4 && kl.length === ks.length + 1 && kl.startsWith(ks) && l.length - s.length <= 1) return true;
  }
  // Typos, counted in the words or in their roots ("attak" ≈ "attacked").
  const d = Math.min(levenshtein(a, b), ra.length >= 5 && rb.length >= 5 ? levenshtein(ra, rb) : 9);
  // Two letters swapped at the end ("coutr") is still a typo, not a different word.
  const swapped = a.length === b.length && a.slice(0, -2) === b.slice(0, -2) && a[a.length - 1] === b[b.length - 2] && a[a.length - 2] === b[b.length - 1];
  // In short words a different last letter is a different word: "policy" isn't "police", "civil" isn't "civic".
  if (d <= 1) return Math.max(a.length, b.length) > 6 || a[a.length - 1] === b[b.length - 1] || swapped;
  // Two typos only in long words, and not in the last letter: "community" is not "communism".
  return d === 2 && Math.max(a.length, b.length) > 8 && a[a.length - 1] === b[b.length - 1];
}

/**
 * How many key words the learner said, each of the learner's words standing for one key word only:
 * "civil rights" mustn't pass "fight for civil rights" because "rights" looks like a typo of "fight".
 */
function pairUp(need: string[], said: string[][]): number {
  const owner = new Array<number>(said.length).fill(-1);
  const assign = (i: number, seen: boolean[]): boolean => {
    for (let j = 0; j < said.length; j++) {
      if (seen[j] || !said[j].some((u) => closeWord(u, need[i]))) continue;
      seen[j] = true;
      if (owner[j] < 0 || assign(owner[j], seen)) return (owner[j] = i), true;
    }
    return false;
  };
  return need.filter((_, i) => assign(i, new Array<boolean>(said.length).fill(false))).length;
}

/** Spaces in other places: "con stitution", "sacra mento" (split), "supremecourt", "billofrights" (run together). */
function saysJoined(userNorm: string, v: string): boolean {
  // Each word without its plural "s", final "e" or double letters: "skyscraper(s)", "a dress" = "address".
  const plain = (w: string) => stem(w).replace(/e$/, "").replace(/(.)\1+/g, "$1");
  const forms = [words(v), v.split(" ")].map((ws) => ws.map(plain));
  const longest = forms[1].join("").length;
  if (forms[0].join("").length < 6 || longest > 30 || /\d/.test(v)) return false;
  // At most one typo, never in the last letter ("secretary" isn't "VA secretary") and never in
  // a short word ("Iran out of Kuwait" isn't "Iraq out of Kuwait").
  const same = (w: string) =>
    forms.some((ws) => {
      const t = ws.join("");
      if (w === t) return true;
      if (Math.abs(w.length - t.length) > 1 || w[0] !== t[0] || w[w.length - 1] !== t[t.length - 1] || levenshtein(w, t) > 1) return false;
      let at = 0;
      while (w[at] === t[at]) at++;
      for (const p of ws) {
        if (at < p.length) return p.length >= 5;
        at -= p.length;
      }
      return false;
    });
  const u = userNorm.split(" ").map(plain);
  for (let i = 0; i < u.length; i++) {
    if (forms[0].length > 1 && same(u[i])) return true;
    let s = u[i];
    for (let j = i + 1; j < u.length && j < i + 4 && s.length < longest + 2; j++) {
      s += u[j];
      if (same(s)) return true;
    }
  }
  return false;
}

const NOT_VOTE = new RegExp(`\\bnot(?: (?:${Array.from(STOP).join("|")}))* vote\\b`);
// Years: "the stock market crash of 2008" isn't the crash of 1929.
const YEAR = /\b(?:1[6-9]|20)\d\d\b/g;

// A phrase's key words in order, with or without small words between them, so "war between the
// north and the south" also takes out "war between north and south".
const phraseCache = new Map<string, RegExp>();
function phraseRe(p: string): RegExp {
  let re = phraseCache.get(p);
  if (!re) {
    const gap = `(?: (?:${Array.from(STOP).join("|")}))* `;
    phraseCache.set(p, (re = new RegExp(`\\b${words(normalize(p)).join(gap)}\\b`, "g")));
  }
  return re;
}

/** Does what the learner said contain this one official answer? */
function saysVariant(userNorm: string, userTokens: string[], v: string): boolean {
  if (!v) return false;
  const vw = v.split(" ");
  // "Vice president" is never the answer "president".
  if (userTokens.includes("vice") && !vw.includes("vice") && vw.includes("president")) return false;
  // "not" is never optional: "powers given to the federal government…" says the opposite.
  if (vw.includes("not") && !userTokens.includes("not")) return false;
  // "Women can not vote" isn't "women can vote".
  if (vw.includes("vote") && !vw.includes("not") && NOT_VOTE.test(userNorm)) return false;
  if (` ${userNorm} `.includes(` ${v} `)) return true;
  if (saysJoined(userNorm, v)) return true;
  // Each key word counts once: "can vote … can vote" mustn't let "only men can vote" pass.
  let need = Array.from(new Set(tokens(v)));
  if (!need.length) return userNorm === v;
  // "First president of the United States" → "the first president" is enough. But the
  // US stays required when only one key word would be left: "be loyal to the United States"
  // isn't said by "give up loyalty to other countries".
  const soft = need.filter((t) => !SOFT.has(t));
  if (soft.length && soft.length < need.length) need = soft;
  const core = need.filter((t) => !COUNTRY.has(t));
  if (core.length >= 2 && core.length < need.length) need = core;
  const found = pairUp(need, words(userNorm).map((w) => [stem(w), w]));
  // Long answers (like the 9/11 sentences) can be paraphrased; short ones need every key word.
  const required = need.length >= 6 ? Math.ceil(need.length * 0.6) : need.length;
  return found >= required;
}

/**
 * For the questions about officeholders: names said or spelled the way they sound, which speech
 * recognition often does for a learner's own representative ("Ted Lou" for Ted Lieu, "Alex Padiya").
 * Returns what was said with those words replaced by the name's spelling. A short name ("Lieu")
 * only counts with the first name, so "law" never becomes "Lieu".
 */
export function spellNames(said: string, names: string[]): string {
  const key = (w: string) => soundKey(w.replace(/ll(?=[aeiou])/g, "y")); // "Padilla" sounds like "Padiya"
  const full = names.map((n) => normalize(n).split(" "));
  const saidWords = normalize(said).split(" ");
  return saidWords
    .map((w) => {
      for (const parts of full)
        for (const x of parts) {
          if (x === w || x[0] !== w[0] || key(x) !== key(w)) continue;
          if (key(x).length >= 3 || parts.some((y) => y !== x && saidWords.includes(y))) return x;
        }
      return w;
    })
    .join(" ");
}

export type MatchResult = { correct: boolean; matched: string[]; needed: number };

/**
 * accepted: the official answers (or the learner's own, for state questions).
 * needed: how many different answers are required ("Name three" = 3).
 * echo: words from the question itself, which don't answer it ("Veterans Day" for "What is Veterans Day?").
 */
export function checkAnswer(said: string, accepted: string[], needed = 1, echo: string[] = []): MatchResult {
  let userNorm = stripFiller(normalize(said));
  for (const p of echo) userNorm = userNorm.replace(phraseRe(p), " ").replace(/\s+/g, " ").trim();
  const userTokens = userTokensOf(userNorm);
  if (!userNorm) return { correct: false, matched: [], needed };
  const namesOtherCountry = OTHER_COUNTRY.test(userNorm) && !userTokens.some((t) => COUNTRY.has(t));
  const saidYears = userNorm.match(YEAR) ?? [];
  // "two months", "four terms" aren't "Two (2) years" or "Four (4) years".
  const otherUnit = /\b(?:months?|weeks?|days?|terms?)\b/.test(userNorm) && !/\byears?\b/.test(userNorm);

  const matched: string[] = [];
  for (const answer of accepted) {
    if (namesOtherCountry && FOR_US_ONLY.has(answer)) continue;
    if (otherUnit && /\byears\b/.test(answer)) continue;
    const years = answer.match(YEAR);
    if (years && saidYears.length && !saidYears.some((y) => years.includes(y))) continue;
    if (NOT_WITH[answer]?.test(userNorm.replace(/\bnot (?:\w+ )?\w+/g, " "))) continue;
    let norm = userNorm;
    // "Give up loyalty to Ethiopia" gives up loyalty to another country.
    if (answer === "Give up loyalty to other countries") norm = norm.replace(OTHER_COUNTRIES, "other country");
    for (const p of IGNORE[answer] ?? []) norm = norm.replace(phraseRe(p), " ");
    const toks = norm === userNorm ? userTokens : userTokensOf(norm);
    if (variants(answer).some((v) => saysVariant(norm, toks, v))) matched.push(answer);
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
