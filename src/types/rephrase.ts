export type WritingStyle =
  | "Professional"
  | "Casual"
  | "Academic"
  | "Creative"
  | "Friendly";

export type ToneOption =
  | "Neutral"
  | "Confident"
  | "Diplomatic"
  | "Empathetic"
  | "Persuasive";

export type LengthOption = "Shorter" | "Balanced" | "Expanded";

export type ClarityOption = "Standard" | "Clear & Direct" | "Simplified";

export interface RephraseRequest {
  text: string;
  style: WritingStyle;
  tone: ToneOption;
  length: LengthOption;
  clarity: ClarityOption;
  fixGrammar: boolean;
  preserveMeaning: boolean;
  variationSeed?: number;
}

export interface GrammarFix {
  original: string;
  corrected: string;
  issueType: string;
  explanation: string;
}

export interface WordingSuggestion {
  targetPhrase: string;
  suggestedAlternative: string;
  reason: string;
}

export interface RephraseResult {
  rewrittenText: string;
  meaningPreservationNote: string;
  toneSummary: string;
  grammarFixes: GrammarFix[];
  wordingSuggestions: WordingSuggestion[];
  isDemoMode?: boolean;
}

export interface RevisionEntry {
  id: string;
  timestamp: string;
  originalText: string;
  rewrittenText: string;
  style: WritingStyle;
  tone: ToneOption;
  length: LengthOption;
  clarity: ClarityOption;
  result: RephraseResult;
}
