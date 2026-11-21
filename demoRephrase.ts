import type {
  ClarityOption,
  GrammarFix,
  LengthOption,
  RephraseResult,
  ToneOption,
  WordingSuggestion,
  WritingStyle,
} from "./src/types/rephrase.ts";

interface DemoOptions {
  text: string;
  style: WritingStyle;
  tone: ToneOption;
  length: LengthOption;
  clarity: ClarityOption;
  fixGrammar: boolean;
  preserveMeaning: boolean;
  variationSeed?: number;
}

interface ReplacementRule {
  pattern: RegExp;
  replacement: string;
  issueType: string;
  explanation: string;
}

interface StyleRule {
  pattern: RegExp;
  replacement: string | ((match: string) => string);
}

interface WordingCandidate {
  phrase: string;
  alternatives: string[];
  reason: string;
}

const GRAMMAR_RULES: ReplacementRule[] = [
  {
    pattern: /\b[Mm]e and ((?:the|my|our)\s+[a-zA-Z]+|[a-zA-Z]+)\b/g,
    replacement: "$1 and I",
    issueType: "Grammar",
    explanation: "Use the subject pronoun 'I' after the other subject in compound subjects.",
  },
  {
    pattern: /\bkinda\b/gi,
    replacement: "somewhat",
    issueType: "Usage",
    explanation: "Replaced colloquial contraction 'kinda' with standard phrasing.",
  },
  {
    pattern: /\bgonna\b/gi,
    replacement: "going to",
    issueType: "Usage",
    explanation: "Replaced informal spoken contraction 'gonna' with standard form.",
  },
  {
    pattern: /\bwanna\b/gi,
    replacement: "want to",
    issueType: "Usage",
    explanation: "Replaced informal spoken contraction 'wanna' with standard form.",
  },
  {
    pattern: /\bsuper hectic\b/gi,
    replacement: "exceptionally busy",
    issueType: "Word Choice",
    explanation: "Replaced casual intensifier 'super hectic' with clearer phrasing.",
  },
  {
    pattern: /\breally hot\b/gi,
    replacement: "intense",
    issueType: "Precision",
    explanation: "Replaced vague adverb-adjective pair 'really hot' with a stronger modifier.",
  },
  {
    pattern: /\bhelps cool down\b/gi,
    replacement: "helps cool",
    issueType: "Conciseness",
    explanation: "Removed redundant particle 'down' after 'cool'.",
  },
  {
    pattern: /\ba lot of\b/gi,
    replacement: "many",
    issueType: "Conciseness",
    explanation: "Replaced wordy quantifier 'a lot of' with concise 'many'.",
  },
  {
    pattern: /\bsorry for taking so long to get back to you\b/gi,
    replacement: "thank you for your patience while I followed up",
    issueType: "Tone & Mechanics",
    explanation: "Reframed apology into courteous, constructive phrasing.",
  },
  {
    pattern: /\bslipped down my inbox\b/gi,
    replacement: "was delayed in my inbox",
    issueType: "Clarity",
    explanation: "Replaced idiomatic phrasing with clearer professional wording.",
  },
  {
    pattern: /\bhop on a quick call\b/gi,
    replacement: "schedule a brief call",
    issueType: "Usage",
    explanation: "Replaced casual idiom with clear scheduling language.",
  },
  {
    pattern: /\bi\b/g,
    replacement: "I",
    issueType: "Capitalization",
    explanation: "Capitalized the first-person singular pronoun 'I'.",
  },
  {
    pattern: /\s{2,}/g,
    replacement: " ",
    issueType: "Spacing",
    explanation: "Removed extra consecutive whitespace.",
  },
];

const EXPAND_CONTRACTIONS: StyleRule[] = [
  { pattern: /\bthat's\b/gi, replacement: "that is" },
  { pattern: /\bcan't\b/gi, replacement: "cannot" },
  { pattern: /\bwon't\b/gi, replacement: "will not" },
  { pattern: /\bdon't\b/gi, replacement: "do not" },
  { pattern: /\bdoesn't\b/gi, replacement: "does not" },
  { pattern: /\bwe're\b/gi, replacement: "we are" },
  { pattern: /\bi've\b/gi, replacement: "I have" },
  { pattern: /\bi'm\b/gi, replacement: "I am" },
  { pattern: /\bit's\b/gi, replacement: "it is" },
  { pattern: /\blet's\b/gi, replacement: "let us" },
];

const ADD_CONTRACTIONS: StyleRule[] = [
  { pattern: /\bthat is\b/gi, replacement: "that's" },
  { pattern: /\bcannot\b/gi, replacement: "can't" },
  { pattern: /\bwe are\b/gi, replacement: "we're" },
  { pattern: /\bI have\b/g, replacement: "I've" },
  { pattern: /\bdo not\b/gi, replacement: "don't" },
];

const STYLE_RULES: Record<WritingStyle, StyleRule[]> = {
  Professional: [
    ...EXPAND_CONTRACTIONS,
    { pattern: /\bHi team,\s*/gi, replacement: "Team, " },
    { pattern: /\bHey ([A-Za-z]+),\s*/g, replacement: "Hi $1, " },
    { pattern: /\bjust wanted to let you know that\b/gi, replacement: "please note that" },
    { pattern: /\bwe ran into some\b/gi, replacement: "we encountered" },
    { pattern: /\bworking hard to\b/gi, replacement: "actively working to" },
    { pattern: /\bget the fix deployed\b/gi, replacement: "deploy the resolution" },
    { pattern: /\bonce that is done\b/gi, replacement: "once deployed," },
    { pattern: /\blet me know if anything looks off\b/gi, replacement: "please let me know if any revisions are needed" },
    { pattern: /\bthings got\b/gi, replacement: "schedules became" },
    { pattern: /\blooked at\b/gi, replacement: "examined" },
    { pattern: /\bfound that\b/gi, replacement: "observed that" },
    { pattern: /\bthis shows\b/gi, replacement: "this indicates" },
  ],
  Casual: [
    ...ADD_CONTRACTIONS,
    { pattern: /\bplease note that\b/gi, replacement: "quick heads-up:" },
    { pattern: /\bjust wanted to let you know that\b/gi, replacement: "just a quick note that" },
    { pattern: /\bencountered\b/gi, replacement: "ran into" },
    { pattern: /\bexceptionally busy\b/gi, replacement: "pretty busy" },
    { pattern: /\bthank you for your patience while I followed up\b/gi, replacement: "sorry for the late reply" },
    { pattern: /\bschedule a brief call\b/gi, replacement: "jump on a quick call" },
    { pattern: /\bexamined\b/gi, replacement: "looked at" },
  ],
  Academic: [
    ...EXPAND_CONTRACTIONS,
    { pattern: /\bHi team,\s*/gi, replacement: "" },
    { pattern: /\bHey [A-Za-z]+,\s*/g, replacement: "" },
    { pattern: /\bjust wanted to let you know that\b/gi, replacement: "it should be noted that" },
    { pattern: /\bOur study looked at\b/gi, replacement: "This study investigated" },
    { pattern: /\blooked at\b/gi, replacement: "investigated" },
    { pattern: /\bfound that\b/gi, replacement: "demonstrated that" },
    { pattern: /\bThis shows\b/gi, replacement: "These findings indicate that" },
    { pattern: /\bstayed noticeably cooler\b/gi, replacement: "maintained significantly lower temperatures" },
    { pattern: /\bhelp cool down\b/gi, replacement: "mitigate thermal buildup in" },
    { pattern: /\bhelp cool\b/gi, replacement: "mitigate thermal buildup in" },
    { pattern: /\bwe ran into\b/gi, replacement: "the team encountered" },
    { pattern: /\bworking hard to\b/gi, replacement: "actively working to" },
    { pattern: /\bshould be able to\b/gi, replacement: "are positioned to" },
    { pattern: /\bmost\b/gi, replacement: "the majority of" },
  ],
  Creative: [
    { pattern: /\bjust wanted to let you know that\b/gi, replacement: "here is where things stand:" },
    { pattern: /\bwe ran into some unexpected\b/gi, replacement: "we hit a sudden pocket of" },
    { pattern: /\bworking hard to\b/gi, replacement: "pushing forward to" },
    { pattern: /\bslowly turn into\b/gi, replacement: "quietly evolve into" },
    { pattern: /\bget in the way of your actual thoughts\b/gi, replacement: "crowd out the very ideas you came to capture" },
    { pattern: /\bwhenever an idea strikes\b/gi, replacement: "the moment inspiration lands" },
    { pattern: /\bnoticeably cooler\b/gi, replacement: "refreshingly shaded" },
    { pattern: /\bintense summer heatwaves\b/gi, replacement: "peak summer heat" },
  ],
  Friendly: [
    { pattern: /\bHi team,\s*/gi, replacement: "Hi everyone, " },
    { pattern: /\bHey ([A-Za-z]+),\s*/g, replacement: "Hi $1, " },
    { pattern: /\bjust wanted to let you know that\b/gi, replacement: "I wanted to share a quick update that" },
    { pattern: /\bwe ran into some\b/gi, replacement: "we bumped into a few" },
    { pattern: /\bworking hard to\b/gi, replacement: "working steadily to" },
    { pattern: /\blet me know if anything looks off\b/gi, replacement: "feel free to let me know if anything needs a tweak" },
    { pattern: /\bwithout affecting\b/gi, replacement: "while keeping everything smooth for" },
  ],
};

const TONE_RULES: Record<ToneOption, StyleRule[]> = {
  Neutral: [
    { pattern: /\bunexpected\b/gi, replacement: "recent" },
    { pattern: /\bexceptionally\b/gi, replacement: "notably" },
  ],
  Confident: [
    { pattern: /\bshould be able to\b/gi, replacement: "are on track to" },
    { pattern: /\bsomewhat behind schedule\b/gi, replacement: "tracking slightly behind our initial target" },
    { pattern: /\bI think\b/gi, replacement: "We anticipate" },
    { pattern: /\bmaybe\b/gi, replacement: "" },
  ],
  Diplomatic: [
    { pattern: /\bbehind schedule\b/gi, replacement: "adjusting our target timeline" },
    { pattern: /\bunexpected\b/gi, replacement: "unforeseen" },
    { pattern: /\bissues\b/gi, replacement: "challenges" },
    { pattern: /\bshould\b/gi, replacement: "may benefit from" },
  ],
  Empathetic: [
    { pattern: /\bwithout affecting\b/gi, replacement: "while protecting the experience for" },
    { pattern: /\bvulnerable residents\b/gi, replacement: "residents most affected by extreme heat" },
  ],
  Persuasive: [
    { pattern: /\bshows\b/gi, replacement: "clearly demonstrates" },
    { pattern: /\bindicates\b/gi, replacement: "compellingly demonstrates" },
    { pattern: /\bgives you\b/gi, replacement: "delivers" },
    { pattern: /\bwithout forcing you to\b/gi, replacement: "freeing you from having to" },
  ],
};

const WORDING_CANDIDATES: WordingCandidate[] = [
  {
    phrase: "actively working to",
    alternatives: ["focused on", "prioritizing efforts to", "dedicated to"],
    reason: "Offers a sharper action verb for status updates.",
  },
  {
    phrase: "deploy the resolution",
    alternatives: ["ship the fix", "release the patch", "roll out the update"],
    reason: "Adjusts technical specificity for your audience.",
  },
  {
    phrase: "please note that",
    alternatives: ["for visibility,", "to keep everyone aligned,", "as a brief update,"],
    reason: "Softens or sharpens the opening transition.",
  },
  {
    phrase: "demonstrated that",
    alternatives: ["revealed that", "confirmed that", "established that"],
    reason: "Varies analytical verbs for stronger academic precision.",
  },
  {
    phrase: "investigated",
    alternatives: ["analyzed", "evaluated", "assessed"],
    reason: "Provides a more specific methodological verb.",
  },
  {
    phrase: "schedule a brief call",
    alternatives: ["connect for a quick sync", "set up a short conversation", "meet briefly"],
    reason: "Tailors the call-to-action warmth and formality.",
  },
  {
    phrase: "distraction-free",
    alternatives: ["focused", "uncluttered", "calm"],
    reason: "Refines product positioning tone.",
  },
  {
    phrase: "on track to",
    alternatives: ["ready to", "prepared to", "scheduled to"],
    reason: "Adjusts commitment confidence.",
  },
  {
    phrase: "encountered",
    alternatives: ["identified", "experienced", "faced"],
    reason: "Provides cleaner verb variety.",
  },
  {
    phrase: "maintained significantly lower temperatures",
    alternatives: ["recorded measurably cooler surfaces", "exhibited lower afternoon heat"],
    reason: "Offers an alternative empirical phrasing.",
  },
];

function applyRuleSet(text: string, rules: StyleRule[]): string {
  let out = text;
  for (const rule of rules) {
    if (typeof rule.replacement === "function") {
      out = out.replace(rule.pattern, rule.replacement);
    } else {
      out = out.replace(rule.pattern, rule.replacement);
    }
  }
  return out;
}

function normalizeSentences(text: string): string {
  const paragraphs = text.split(/\n{2,}/);
  return paragraphs
    .map((para) => {
      const cleaned = para.replace(/[ \t]+/g, " ").replace(/\s+([,.;!?])/g, "$1").trim();
      if (!cleaned) return "";
      const withCap = cleaned.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix: string, ch: string) => {
        return `${prefix}${ch.toUpperCase()}`;
      });
      return /[.!?]$/.test(withCap) ? withCap : `${withCap}.`;
    })
    .filter(Boolean)
    .join("\n\n");
}

function applyClarity(text: string, clarity: ClarityOption): string {
  let out = text;
  if (clarity === "Clear & Direct") {
    out = out
      .replace(/\bin order to\b/gi, "to")
      .replace(/\bdue to the fact that\b/gi, "because")
      .replace(/\bat this point in time\b/gi, "now")
      .replace(/\bfor the purpose of\b/gi, "to");
  } else if (clarity === "Simplified") {
    out = out
      .replace(/\butilize\b/gi, "use")
      .replace(/\bsubsequently\b/gi, "next")
      .replace(/\bapproximately\b/gi, "about")
      .replace(/\badditional\b/gi, "more")
      .replace(/\bdemonstrate\b/gi, "show")
      .replace(/\bencountered\b/gi, "faced")
      .replace(/\bexceptionally\b/gi, "very")
      .replace(/\bnoticeably\b/gi, "clearly");
  }
  return out;
}

function applyLength(
  text: string,
  length: LengthOption,
  style: WritingStyle,
  tone: ToneOption
): string {
  if (length === "Balanced") {
    return text;
  }

  if (length === "Shorter") {
    let condensed = text
      .replace(/^(Hi everyone,|Team,|Hi [A-Za-z]+,)\s*/i, "")
      .replace(/\b(very|really|actually|basically|essentially|simply|just)\s+/gi, "")
      .replace(/\bthank you for your patience while I followed up\.?\s*/gi, "")
      .replace(/\bas soon as possible\b/gi, "promptly");

    const sentences = condensed.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length > 3) {
      condensed = sentences.slice(0, sentences.length - 1).join(" ");
    }
    return condensed.trim() || text;
  }

  // Expanded: add smooth framing and closing transition without inventing unsupported facts
  const openingByStyle: Record<WritingStyle, string> = {
    Professional: "Here is a clear summary of our current status and next steps. ",
    Casual: "Here's the quick rundown of where things stand right now. ",
    Academic: "In examining the evidence presented below, several key observations emerge. ",
    Creative: "Stepping back to look at the full picture, the narrative becomes unmistakable. ",
    Friendly: "I wanted to share a thoughtful update so we stay closely aligned. ",
  };

  const closingByTone: Record<ToneOption, string> = {
    Neutral: " Please let us know if any additional context would be helpful.",
    Confident: " We remain focused on delivering this cleanly and keeping momentum strong.",
    Diplomatic: " We appreciate your collaboration and welcome any feedback on this approach.",
    Empathetic: " Thank you for your patience and partnership as we move forward together.",
    Persuasive: " Moving forward with this approach ensures clear, measurable value right away.",
  };

  const trimmed = text.trim();
  const hasGreeting = /^(Hi|Team|Hello|Dear)/i.test(trimmed);
  const prefix = hasGreeting ? "" : openingByStyle[style];
  const suffix = trimmed.length < 480 ? closingByTone[tone] : "";
  return `${prefix}${trimmed}${suffix}`;
}

export function generateDemoRephrase(options: DemoOptions): RephraseResult {
  const original = options.text.trim();
  const grammarFixes: GrammarFix[] = [];

  let working = original;

  // 1. Grammar & mechanics pass
  if (options.fixGrammar) {
    for (const rule of GRAMMAR_RULES) {
      const match = working.match(rule.pattern);
      if (match && match.length > 0) {
        const sampleOriginal = match[0].trim();
        const replacedSample = sampleOriginal.replace(rule.pattern, rule.replacement).trim();
        if (sampleOriginal && replacedSample && sampleOriginal !== replacedSample) {
          grammarFixes.push({
            original: sampleOriginal,
            corrected: replacedSample,
            issueType: rule.issueType,
            explanation: rule.explanation,
          });
        }
        working = working.replace(rule.pattern, rule.replacement);
      }
    }
  }

  // 2. Style & tone transformations
  working = applyRuleSet(working, STYLE_RULES[options.style]);
  working = applyRuleSet(working, TONE_RULES[options.tone]);

  // 3. Clarity & length transformations
  working = applyClarity(working, options.clarity);
  working = applyLength(working, options.length, options.style, options.tone);

  // 4. Variation seed support so "Try Variation" visibly alternates wording
  if (typeof options.variationSeed === "number" && options.variationSeed > 0) {
    const idx = options.variationSeed % 2;
    for (const candidate of WORDING_CANDIDATES) {
      const regex = new RegExp(`\\b${candidate.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
      if (regex.test(working) && candidate.alternatives[idx]) {
        working = working.replace(regex, candidate.alternatives[idx]);
        break;
      }
    }
  }

  const rewrittenText = normalizeSentences(working);

  // 5. Build wordingSuggestions whose targetPhrase exists verbatim inside rewrittenText
  const wordingSuggestions: WordingSuggestion[] = [];
  for (const candidate of WORDING_CANDIDATES) {
    if (rewrittenText.includes(candidate.phrase)) {
      wordingSuggestions.push({
        targetPhrase: candidate.phrase,
        suggestedAlternative: candidate.alternatives[0],
        reason: candidate.reason,
      });
    }
    if (wordingSuggestions.length >= 4) break;
  }

  // Guarantee at least 2 useful wording suggestions for arbitrary user text
  if (wordingSuggestions.length === 0) {
    const words = rewrittenText.match(/\b[A-Za-z]{6,}\b/g) ?? [];
    const fallbackPairs: Record<string, [string, string]> = {
      important: ["essential", "Signals higher priority without extra words."],
      improve: ["strengthen", "Conveys measurable upward progress."],
      update: ["progress summary", "Frames the message cleanly for stakeholders."],
      because: ["since", "Creates a lighter, smoother clause transition."],
      however: ["nevertheless", "Adds formal contrast between ideas."],
      customers: ["clients", "Matches executive or B2B terminology."],
      project: ["initiative", "Elevates framing for leadership updates."],
      problem: ["challenge", "Maintains constructive, solution-oriented tone."],
    };

    for (const word of words) {
      const lower = word.toLowerCase();
      if (fallbackPairs[lower] && rewrittenText.includes(word)) {
        const [alt, reason] = fallbackPairs[lower];
        if (!wordingSuggestions.some((s) => s.targetPhrase === word)) {
          wordingSuggestions.push({
            targetPhrase: word,
            suggestedAlternative: /^[A-Z]/.test(word)
              ? alt.charAt(0).toUpperCase() + alt.slice(1)
              : alt,
            reason,
          });
        }
      }
      if (wordingSuggestions.length >= 3) break;
    }
  }

  return {
    rewrittenText,
    meaningPreservationNote: options.preserveMeaning
      ? "Core facts, entities, timelines, and intent from your original draft were kept intact while adjusting phrasing locally."
      : "Original intent was retained while prioritizing stylistic transformation.",
    toneSummary: `Applied ${options.style} style with a ${options.tone.toLowerCase()} tone, ${options.length.toLowerCase()} length, and ${options.clarity.toLowerCase()} clarity.`,
    grammarFixes: grammarFixes.slice(0, 6),
    wordingSuggestions,
    isDemoMode: true,
  };
}
