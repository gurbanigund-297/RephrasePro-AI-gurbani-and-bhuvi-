import { GoogleGenAI, Type, type Schema } from "@google/genai";
import { generateDemoRephrase } from "./demoRephrase.ts";
import type {
  ClarityOption,
  LengthOption,
  RephraseResult,
  ToneOption,
  WritingStyle,
} from "./src/types/rephrase.ts";

const PRIMARY_MODEL = "gemini-4-hydrogen";
const FALLBACK_MODEL = "gemini-3.1-flash-lite";

export interface RephraseBody {
  text?: unknown;
  style?: unknown;
  tone?: unknown;
  length?: unknown;
  clarity?: unknown;
  fixGrammar?: unknown;
  preserveMeaning?: unknown;
  variationSeed?: unknown;
}

const VALID_STYLES = new Set<WritingStyle>([
  "Professional",
  "Casual",
  "Academic",
  "Creative",
  "Friendly",
]);

const VALID_TONES = new Set<ToneOption>([
  "Neutral",
  "Confident",
  "Diplomatic",
  "Empathetic",
  "Persuasive",
]);

const VALID_LENGTHS = new Set<LengthOption>(["Shorter", "Balanced", "Expanded"]);
const VALID_CLARITIES = new Set<ClarityOption>([
  "Standard",
  "Clear & Direct",
  "Simplified",
]);

const REPHRASE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    rewrittenText: {
      type: Type.STRING,
      description:
        "The complete rewritten version of the user's text adhering to the requested style, tone, length, clarity, and grammar settings while preserving the core meaning.",
    },
    meaningPreservationNote: {
      type: Type.STRING,
      description:
        "A concise 1-2 sentence explanation confirming how the original intent, facts, and core message were preserved.",
    },
    toneSummary: {
      type: Type.STRING,
      description:
        "A crisp 1-sentence summary of the stylistic, structural, and clarity shifts applied.",
    },
    grammarFixes: {
      type: Type.ARRAY,
      description:
        "Specific grammar, punctuation, agreement, or mechanical errors corrected from the original text. Return an empty array if the original text has no grammatical issues.",
      items: {
        type: Type.OBJECT,
        properties: {
          original: {
            type: Type.STRING,
            description: "The exact phrase or clause from the original text.",
          },
          corrected: {
            type: Type.STRING,
            description: "The grammatically corrected form.",
          },
          issueType: {
            type: Type.STRING,
            description:
              "Short category label such as Grammar, Punctuation, Agreement, Syntax, or Conciseness.",
          },
          explanation: {
            type: Type.STRING,
            description: "Brief explanation of why the correction improves the writing.",
          },
        },
        required: ["original", "corrected", "issueType", "explanation"],
      },
    },
    wordingSuggestions: {
      type: Type.ARRAY,
      description:
        "3 to 5 high-impact vocabulary or phrasing upgrades. Each targetPhrase MUST be an exact substring present in rewrittenText so the user can swap it directly if desired.",
      items: {
        type: Type.OBJECT,
        properties: {
          targetPhrase: {
            type: Type.STRING,
            description: "An exact phrase that appears verbatim inside rewrittenText.",
          },
          suggestedAlternative: {
            type: Type.STRING,
            description:
              "An alternative stronger, sharper, or more nuanced phrasing that seamlessly replaces targetPhrase.",
          },
          reason: {
            type: Type.STRING,
            description: "Brief rationale explaining the nuance or benefit of this alternative.",
          },
        },
        required: ["targetPhrase", "suggestedAlternative", "reason"],
      },
    },
  },
  required: [
    "rewrittenText",
    "meaningPreservationNote",
    "toneSummary",
    "grammarFixes",
    "wordingSuggestions",
  ],
};

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add GEMINI_API_KEY to your environment variables."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function isTransientError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return (
    message.includes("429") ||
    message.includes("503") ||
    message.includes("500") ||
    message.includes("UNAVAILABLE") ||
    message.includes("RESOURCE_EXHAUSTED")
  );
}

function isModelNotFoundError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("NOT_FOUND") || message.includes("404");
}

async function generateWithRetry(
  ai: GoogleGenAI,
  model: string,
  systemInstruction: string,
  userPrompt: string,
  seed?: number
): Promise<string> {
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: REPHRASE_SCHEMA,
          ...(typeof seed === "number" ? { seed } : {}),
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Model returned an empty response.");
      }
      return text;
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts && isTransientError(err)) {
        const delayMs = 400 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      break;
    }
  }

  throw lastError;
}

export function mapGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : "Unexpected server error";

  if (raw.includes("GEMINI_API_KEY is not configured")) {
    return { status: 500, message: raw };
  }
  if (raw.includes("free tier is not available") || raw.includes("set up billing")) {
    return {
      status: 500,
      message:
        "The Gemini API free tier is not available for this project. Please enable billing or select a paid API key in Settings > Secrets.",
    };
  }
  if (
    raw.includes("API_KEY_INVALID") ||
    raw.includes("PERMISSION_DENIED") ||
    raw.includes("403")
  ) {
    return {
      status: 500,
      message:
        "Gemini API access was denied. Please verify your GEMINI_API_KEY environment variable.",
    };
  }
  if (raw.includes("RESOURCE_EXHAUSTED") || raw.includes("429")) {
    return {
      status: 429,
      message:
        "Rate limit reached on the AI service. Please wait a few seconds and try again.",
    };
  }
  if (raw.includes("NOT_FOUND") || raw.includes("404")) {
    return {
      status: 500,
      message: "Configured Gemini model was unavailable for this API key.",
    };
  }
  return {
    status: 500,
    message: raw || "Failed to rewrite text. Please try again.",
  };
}

export async function handleRephraseRequest(
  body: RephraseBody
): Promise<{ status: number; payload: RephraseResult | { error: string } }> {
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!text) {
    return { status: 400, payload: { error: "Please enter some text to rewrite." } };
  }

  if (text.length > 12000) {
    return {
      status: 400,
      payload: {
        error: "Input text exceeds the 12,000 character limit. Please shorten your draft.",
      },
    };
  }

  const style: WritingStyle =
    typeof body.style === "string" && VALID_STYLES.has(body.style as WritingStyle)
      ? (body.style as WritingStyle)
      : "Professional";
  const tone: ToneOption =
    typeof body.tone === "string" && VALID_TONES.has(body.tone as ToneOption)
      ? (body.tone as ToneOption)
      : "Neutral";
  const length: LengthOption =
    typeof body.length === "string" && VALID_LENGTHS.has(body.length as LengthOption)
      ? (body.length as LengthOption)
      : "Balanced";
  const clarity: ClarityOption =
    typeof body.clarity === "string" &&
    VALID_CLARITIES.has(body.clarity as ClarityOption)
      ? (body.clarity as ClarityOption)
      : "Clear & Direct";
  const fixGrammar = body.fixGrammar !== false;
  const preserveMeaning = body.preserveMeaning !== false;
  const variationSeed =
    typeof body.variationSeed === "number" && Number.isFinite(body.variationSeed)
      ? Math.floor(body.variationSeed)
      : undefined;

  const lengthGuidance =
    length === "Shorter"
      ? "Tighten and condense the text by roughly 20-35% while retaining every essential fact."
      : length === "Expanded"
        ? "Elaborate modestly (roughly 20-35% longer) with smoother transitions and fuller articulation without inventing unsupported facts."
        : "Maintain a similar overall length to the original draft.";

  const clarityGuidance =
    clarity === "Simplified"
      ? "Use plain, accessible vocabulary, short crisp sentences, and remove jargon."
      : clarity === "Clear & Direct"
        ? "Favor active voice, concrete verbs, and direct sentence structure for effortless readability."
        : "Refine flow naturally while respecting the complexity of the original phrasing.";

  const systemInstruction = [
    "You are RephrasePro AI, an expert editorial rewriter and prose stylist.",
    "Rewrite the user's text to match the requested Style, Tone, Length, and Clarity.",
    preserveMeaning
      ? "CRITICAL: Preserve 100% of the original meaning, facts, names, dates, numbers, commitments, and intent. Never fabricate facts or omit key details."
      : "Keep the core message intact while allowing expressive stylistic reinterpretation.",
    fixGrammar
      ? "Correct all grammar, spelling, punctuation, subject-verb agreement, and awkward syntax issues, and document the key fixes in grammarFixes."
      : "Focus primarily on style and tone transformation while keeping mechanical edits minimal.",
    "Provide 3 to 5 high-value wordingSuggestions where each targetPhrase appears verbatim inside your rewrittenText so the user can click to swap in the suggestedAlternative cleanly.",
    "Preserve paragraph breaks when the original text has multiple paragraphs.",
    "Return strictly valid JSON matching the requested schema.",
  ].join(" ");

  const userPrompt = [
    `Target Style: ${style}`,
    `Target Tone: ${tone}`,
    `Target Length: ${length} (${lengthGuidance})`,
    `Clarity Level: ${clarity} (${clarityGuidance})`,
    `Fix Grammar & Mechanics: ${fixGrammar ? "Yes" : "Minimal"}`,
    `Strict Meaning Preservation: ${preserveMeaning ? "Yes" : "Moderate"}`,
    variationSeed !== undefined
      ? `Variation Request: Produce a fresh, distinct phrasing variation (seed ${variationSeed}).`
      : "",
    "",
    "Original Text:",
    `"""`,
    text,
    `"""`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const ai = getGeminiClient();
    let rawJson: string;
    try {
      rawJson = await generateWithRetry(
        ai,
        PRIMARY_MODEL,
        systemInstruction,
        userPrompt,
        variationSeed
      );
    } catch (primaryErr) {
      if (isModelNotFoundError(primaryErr)) {
        rawJson = await generateWithRetry(
          ai,
          FALLBACK_MODEL,
          systemInstruction,
          userPrompt,
          variationSeed
        );
      } else {
        throw primaryErr;
      }
    }

    const cleanedJson = rawJson
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "");

    const parsed = JSON.parse(cleanedJson) as Record<string, unknown>;
    const rewrittenText =
      typeof parsed.rewrittenText === "string" ? parsed.rewrittenText.trim() : "";
    if (!rewrittenText) {
      throw new Error("The AI model returned an empty rewrite.");
    }

    return {
      status: 200,
      payload: {
        rewrittenText,
        meaningPreservationNote:
          typeof parsed.meaningPreservationNote === "string"
            ? parsed.meaningPreservationNote
            : "",
        toneSummary: typeof parsed.toneSummary === "string" ? parsed.toneSummary : "",
        grammarFixes: Array.isArray(parsed.grammarFixes) ? parsed.grammarFixes : [],
        wordingSuggestions: Array.isArray(parsed.wordingSuggestions)
          ? parsed.wordingSuggestions
          : [],
        isDemoMode: false,
      },
    };
  } catch (aiErr) {
    const mapped = mapGeminiError(aiErr);
    console.warn(`Falling back to Demo Mode: ${mapped.message}`);
    const demoResult = generateDemoRephrase({
      text,
      style,
      tone,
      length,
      clarity,
      fixGrammar,
      preserveMeaning,
      variationSeed,
    });
    return { status: 200, payload: demoResult };
  }
}
