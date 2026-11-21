import { useCallback, useEffect, useState } from "react";
import { ComparisonWorkspace } from "./components/ComparisonWorkspace.tsx";
import { ControlToolbar } from "./components/ControlToolbar.tsx";
import { Header } from "./components/Header.tsx";
import { HistorySection } from "./components/HistorySection.tsx";
import { InsightsSection } from "./components/InsightsSection.tsx";
import { SAMPLE_PRESETS, type SamplePreset } from "./data/samples.ts";
import type {
  ClarityOption,
  LengthOption,
  RephraseResult,
  RevisionEntry,
  ToneOption,
  WordingSuggestion,
  WritingStyle,
} from "./types/rephrase.ts";

const HISTORY_STORAGE_KEY = "rephrasepro_history_v1";

function loadSavedHistory(): RevisionEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [originalText, setOriginalText] = useState<string>(SAMPLE_PRESETS[0].text);
  const [style, setStyle] = useState<WritingStyle>("Professional");
  const [tone, setTone] = useState<ToneOption>("Confident");
  const [length, setLength] = useState<LengthOption>("Balanced");
  const [clarity, setClarity] = useState<ClarityOption>("Clear & Direct");
  const [fixGrammar, setFixGrammar] = useState<boolean>(true);
  const [preserveMeaning, setPreserveMeaning] = useState<boolean>(true);

  const [result, setResult] = useState<RephraseResult | null>(null);
  const [rewrittenText, setRewrittenText] = useState<string>("");
  const [appliedConfig, setAppliedConfig] = useState<{
    style: WritingStyle;
    tone: ToneOption;
    length: LengthOption;
    clarity: ClarityOption;
  }>({
    style: "Professional",
    tone: "Confident",
    length: "Balanced",
    clarity: "Clear & Direct",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<RevisionEntry[]>(loadSavedHistory);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage quota issues
    }
  }, [history]);

  const executeRephrase = useCallback(
    async (variationSeed?: number) => {
      const trimmed = originalText.trim();
      if (!trimmed) {
        setErrorMessage("Please enter or paste some text before rewriting.");
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch("/api/rephrase", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            text: originalText,
            style,
            tone,
            length,
            clarity,
            fixGrammar,
            preserveMeaning,
            variationSeed,
          }),
        });

        const rawBody = await response.text();
        let payload: Partial<RephraseResult> & { error?: unknown } = {};
        if (rawBody) {
          try {
            payload = JSON.parse(rawBody) as Partial<RephraseResult> & {
              error?: unknown;
            };
          } catch {
            if (!response.ok) {
              throw new Error(
                `Server returned HTTP ${response.status} instead of JSON. Please check your API configuration or try again.`
              );
            }
            throw new Error(
              "Received an unexpected non-JSON response from the rewrite service."
            );
          }
        }

        if (!response.ok) {
          throw new Error(
            typeof payload?.error === "string"
              ? payload.error
              : `Failed to rewrite text (HTTP ${response.status}). Please try again.`
          );
        }

        if (typeof payload.rewrittenText !== "string" || !payload.rewrittenText.trim()) {
          throw new Error("The rewrite service returned an empty result. Please try again.");
        }

        const data: RephraseResult = {
          rewrittenText: payload.rewrittenText,
          meaningPreservationNote:
            typeof payload.meaningPreservationNote === "string"
              ? payload.meaningPreservationNote
              : "",
          toneSummary:
            typeof payload.toneSummary === "string" ? payload.toneSummary : "",
          grammarFixes: Array.isArray(payload.grammarFixes)
            ? payload.grammarFixes
            : [],
          wordingSuggestions: Array.isArray(payload.wordingSuggestions)
            ? payload.wordingSuggestions
            : [],
          isDemoMode: Boolean(payload.isDemoMode),
        };
        setResult(data);
        setRewrittenText(data.rewrittenText);
        setAppliedConfig({ style, tone, length, clarity });

        const entry: RevisionEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toISOString(),
          originalText,
          rewrittenText: data.rewrittenText,
          style,
          tone,
          length,
          clarity,
          result: data,
        };

        setHistory((prev) => [entry, ...prev].slice(0, 12));
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while rewriting your text."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [originalText, style, tone, length, clarity, fixGrammar, preserveMeaning]
  );

  function handleLoadSample(preset: SamplePreset) {
    setOriginalText(preset.text);
    setStyle(preset.recommendedStyle);
    setTone(preset.recommendedTone);
    setErrorMessage(null);
  }

  function handleUseAsOriginal() {
    if (!rewrittenText) return;
    setOriginalText(rewrittenText);
    setRewrittenText("");
    setResult(null);
    setErrorMessage(null);
  }

  function handleApplyWording(suggestion: WordingSuggestion) {
    setRewrittenText((current) => {
      if (!current.includes(suggestion.targetPhrase)) return current;
      return current.replace(
        suggestion.targetPhrase,
        suggestion.suggestedAlternative
      );
    });
  }

  function handleRestoreRevision(entry: RevisionEntry) {
    setOriginalText(entry.originalText);
    setRewrittenText(entry.rewrittenText);
    setResult(entry.result);
    setStyle(entry.style);
    setTone(entry.tone);
    setLength(entry.length);
    setClarity(entry.clarity);
    setAppliedConfig({
      style: entry.style,
      tone: entry.tone,
      length: entry.length,
      clarity: entry.clarity,
    });
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDeleteRevision(id: string) {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.09),transparent_55%),radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.06),transparent_50%)] text-[#1E1B4B]">
      <Header
        onRephrase={() => executeRephrase()}
        isLoading={isLoading}
        hasText={originalText.trim().length > 0}
      />

      <main id="studio" className="mx-auto flex max-w-[1360px] flex-col gap-6 px-6 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#1E1B4B] sm:text-3xl [text-wrap:balance]">
            Rewrite with precision while keeping your meaning intact
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            Transform drafts across Professional, Casual, Academic, Creative, and
            Friendly styles. Adjust tone, length, and clarity, fix grammar, and
            compare every change side by side.
          </p>
        </div>

        <ControlToolbar
          style={style}
          onStyleChange={setStyle}
          tone={tone}
          onToneChange={setTone}
          length={length}
          onLengthChange={setLength}
          clarity={clarity}
          onClarityChange={setClarity}
          fixGrammar={fixGrammar}
          onFixGrammarChange={setFixGrammar}
          preserveMeaning={preserveMeaning}
          onPreserveMeaningChange={setPreserveMeaning}
          onRephrase={() => executeRephrase()}
          onTryVariation={() =>
            executeRephrase(Math.floor(Math.random() * 100_000) + 1)
          }
          isLoading={isLoading}
          hasText={originalText.trim().length > 0}
          hasOutput={rewrittenText.length > 0}
        />

        <ComparisonWorkspace
          originalText={originalText}
          onOriginalTextChange={setOriginalText}
          rewrittenText={rewrittenText}
          isLoading={isLoading}
          errorMessage={errorMessage}
          appliedStyle={appliedConfig.style}
          appliedTone={appliedConfig.tone}
          appliedLength={appliedConfig.length}
          appliedClarity={appliedConfig.clarity}
          isDemoMode={Boolean(result?.isDemoMode)}
          onLoadSample={handleLoadSample}
          onUseAsOriginal={handleUseAsOriginal}
          onRephrase={() => executeRephrase()}
        />

        <InsightsSection
          result={result}
          rewrittenText={rewrittenText}
          onApplyWording={handleApplyWording}
        />

        <HistorySection
          history={history}
          onRestore={handleRestoreRevision}
          onDelete={handleDeleteRevision}
          onClearAll={() => setHistory([])}
        />
      </main>

      <footer className="border-t border-violet-200/70 bg-white/90">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-4 px-6 py-5 text-xs text-slate-500">
          <span className="font-medium text-[#1E1B4B]">RephrasePro AI — Writing &amp; Style Workbench</span>
          <span>Side-by-side comparison · Grammar &amp; wording refinement</span>
        </div>
      </footer>
    </div>
  );
}
