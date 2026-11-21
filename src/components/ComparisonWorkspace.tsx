import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  Check,
  ClipboardPaste,
  Copy,
  Eraser,
} from "lucide-react";
import { SAMPLE_PRESETS, type SamplePreset } from "../data/samples.ts";
import type {
  ClarityOption,
  LengthOption,
  ToneOption,
  WritingStyle,
} from "../types/rephrase.ts";
import { computeWordDiff } from "../utils/diff.ts";
import { analyzeTextMetrics } from "../utils/metrics.ts";

interface ComparisonWorkspaceProps {
  originalText: string;
  onOriginalTextChange: (text: string) => void;
  rewrittenText: string;
  isLoading: boolean;
  errorMessage: string | null;
  appliedStyle: WritingStyle;
  appliedTone: ToneOption;
  appliedLength: LengthOption;
  appliedClarity: ClarityOption;
  isDemoMode?: boolean;
  onLoadSample: (preset: SamplePreset) => void;
  onUseAsOriginal: () => void;
  onRephrase: () => void;
}

export function ComparisonWorkspace({
  originalText,
  onOriginalTextChange,
  rewrittenText,
  isLoading,
  errorMessage,
  appliedStyle,
  appliedTone,
  appliedLength,
  appliedClarity,
  isDemoMode = false,
  onLoadSample,
  onUseAsOriginal,
  onRephrase,
}: ComparisonWorkspaceProps) {
  const [viewMode, setViewMode] = useState<"clean" | "diff">("clean");
  const [copied, setCopied] = useState(false);

  const originalMetrics = useMemo(
    () => analyzeTextMetrics(originalText),
    [originalText]
  );
  const rewrittenMetrics = useMemo(
    () => analyzeTextMetrics(rewrittenText),
    [rewrittenText]
  );

  const wordDelta = rewrittenMetrics.words - originalMetrics.words;
  const wordDeltaLabel =
    wordDelta === 0 ? "0 words" : `${wordDelta > 0 ? "+" : ""}${wordDelta} words`;

  const diffSegments = useMemo(() => {
    if (!originalText.trim() || !rewrittenText.trim()) return [];
    return computeWordDiff(originalText, rewrittenText);
  }, [originalText, rewrittenText]);

  async function handleCopy() {
    if (!rewrittenText) return;
    try {
      await navigator.clipboard.writeText(rewrittenText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback ignored if clipboard permissions are restricted
    }
  }

  async function handlePaste() {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        onOriginalTextChange(clip);
      }
    } catch {
      // Clipboard API may require explicit user permission in some browsers
    }
  }

  return (
    <section aria-label="Side-by-side text comparison" className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">
      {/* Left Pane: Original Text */}
      <div className="flex flex-col rounded-2xl border border-violet-200/60 bg-white shadow-[0_6px_24px_-6px_rgba(108,99,255,0.09)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-100/80 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-sm font-semibold text-[#1E1B4B]">
              Original Text
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onLoadSample(preset)}
                className="min-h-[32px] rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-violet-50 hover:text-[#4C1D95] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
              >
                {preset.label}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-violet-100" aria-hidden="true" />
            <button
              type="button"
              onClick={handlePaste}
              title="Paste from clipboard"
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-violet-50 hover:text-[#4C1D95] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
            >
              <ClipboardPaste className="h-3.5 w-3.5" aria-hidden="true" />
              Paste
            </button>
            {originalText.length > 0 && (
              <button
                type="button"
                onClick={() => onOriginalTextChange("")}
                title="Clear original text"
                className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-violet-50 hover:text-[#4C1D95] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
              >
                <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 p-5">
          <label htmlFor="original-editor" className="sr-only">
            Original text input
          </label>
          <textarea
            id="original-editor"
            value={originalText}
            onChange={(e) => onOriginalTextChange(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && originalText.trim() && !isLoading) {
                e.preventDefault();
                onRephrase();
              }
            }}
            placeholder="Paste or type your draft here, or pick a sample above to see how RephrasePro AI transforms style, tone, length, clarity, and grammar..."
            className="h-full min-h-[320px] w-full resize-none border-0 bg-transparent text-[15px] leading-[1.7] text-[#1E1B4B] placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-violet-100/80 px-5 py-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-mono tabular-nums">
            <span>{originalMetrics.words} words</span>
            <span aria-hidden="true">·</span>
            <span>{originalMetrics.characters} chars</span>
            <span aria-hidden="true">·</span>
            <span>{originalMetrics.sentences} sentences</span>
          </div>
          <span className="font-mono tabular-nums">
            {originalMetrics.readingTimeLabel} read
          </span>
        </div>
      </div>

      {/* Right Pane: Rewritten Output (Highlighted with light lavender border & background) */}
      <div className="flex flex-col rounded-2xl border border-violet-300/80 bg-gradient-to-b from-[#FAF8FF] to-white shadow-[0_8px_28px_-6px_rgba(108,99,255,0.12)]">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b border-violet-200/70 bg-violet-50/55 px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-sm font-semibold text-[#1E1B4B]">
              Rewritten Output
            </h2>
            {rewrittenText && !isLoading && (
              <span className="text-xs text-slate-600 whitespace-nowrap">
                {appliedStyle} · {appliedTone}
              </span>
            )}
            {rewrittenText && !isLoading && isDemoMode && (
              <span className="text-xs font-medium text-[#5B52EE] whitespace-nowrap">
                · Demo Mode – Sample transformation
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div
              role="group"
              aria-label="Output view mode"
              className="flex items-center gap-0.5 rounded-xl border border-violet-200/70 bg-white/80 p-0.5"
            >
              <button
                type="button"
                onClick={() => setViewMode("clean")}
                aria-pressed={viewMode === "clean"}
                className={`min-h-[30px] rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] ${
                  viewMode === "clean"
                    ? "bg-[#EDE9FE] text-[#4C1D95] ring-1 ring-violet-300/60 shadow-xs"
                    : "text-slate-600 hover:bg-violet-50 hover:text-[#1E1B4B]"
                }`}
              >
                Clean
              </button>
              <button
                type="button"
                onClick={() => setViewMode("diff")}
                aria-pressed={viewMode === "diff"}
                className={`min-h-[30px] rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] ${
                  viewMode === "diff"
                    ? "bg-[#EDE9FE] text-[#4C1D95] ring-1 ring-violet-300/60 shadow-xs"
                    : "text-slate-600 hover:bg-violet-50 hover:text-[#1E1B4B]"
                }`}
              >
                Compare Diff
              </button>
            </div>

            {rewrittenText && (
              <>
                <button
                  type="button"
                  onClick={onUseAsOriginal}
                  title="Move rewritten text to Original pane for another refinement pass"
                  className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-2.5 py-1 text-xs font-medium text-[#1E1B4B] transition-colors hover:border-violet-300 hover:bg-violet-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5 text-[#6C63FF]" aria-hidden="true" />
                  Use as Draft
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-2.5 py-1 text-xs font-medium text-[#1E1B4B] transition-colors hover:border-violet-300 hover:bg-violet-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-[#6C63FF]" aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 p-5">
          {isLoading ? (
            <div className="flex min-h-[320px] flex-col justify-start gap-3 pt-1" aria-live="polite" aria-busy="true">
              <div className="h-4 w-11/12 rounded bg-violet-100/80 animate-pulse" />
              <div className="h-4 w-full rounded bg-violet-100/80 animate-pulse" />
              <div className="h-4 w-10/12 rounded bg-violet-100/80 animate-pulse" />
              <div className="h-4 w-9/12 rounded bg-violet-100/80 animate-pulse" />
              <div className="mt-2 h-4 w-full rounded bg-violet-100/80 animate-pulse" />
              <div className="h-4 w-4/5 rounded bg-violet-100/80 animate-pulse" />
              <p className="mt-4 text-xs font-medium text-slate-500">
                Rewriting draft while preserving core meaning...
              </p>
            </div>
          ) : errorMessage ? (
            <div
              role="alert"
              className="flex min-h-[320px] flex-col items-start justify-center gap-3 rounded-xl border border-red-200 bg-red-50/70 p-5"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Unable to rewrite text</span>
              </div>
              <p className="text-sm leading-relaxed text-red-700">{errorMessage}</p>
              <button
                type="button"
                onClick={onRephrase}
                disabled={!originalText.trim()}
                className="min-h-[36px] rounded-xl border border-red-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-800 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                Try Again
              </button>
            </div>
          ) : !rewrittenText ? (
            <div className="flex min-h-[320px] flex-col items-start justify-center gap-3 text-left">
              <p className="font-display text-base font-semibold text-[#1E1B4B]">
                Your rewritten text will appear here
              </p>
              <p className="max-w-md text-sm leading-relaxed text-slate-600">
                Select a writing style, tone, length, and clarity level above, then click{" "}
                <strong className="font-semibold text-[#1E1B4B]">Rephrase Text</strong>{" "}
                (or press <span className="font-mono text-xs text-[#4C1D95]">Ctrl/Cmd + Enter</span>)
                to compare the original and refined versions side by side.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!originalText.trim()) {
                      onLoadSample(SAMPLE_PRESETS[0]);
                    } else {
                      onRephrase();
                    }
                  }}
                  className="min-h-[40px] rounded-xl border border-violet-200 bg-white px-4 py-2 text-xs font-semibold text-[#4C1D95] shadow-xs transition-colors hover:border-violet-300 hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
                >
                  {originalText.trim() ? "Rephrase Current Draft" : "Load Executive Update Sample"}
                </button>
              </div>
            </div>
          ) : viewMode === "clean" ? (
            <div className="min-h-[320px] whitespace-pre-wrap text-[15px] leading-[1.7] text-[#1E1B4B]">
              {rewrittenText}
            </div>
          ) : (
            <div className="flex min-h-[320px] flex-col gap-4">
              <div className="flex flex-wrap items-center gap-4 border-b border-violet-100 pb-2.5 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-xs bg-red-100 border border-red-300" aria-hidden="true" />
                  Removed from original
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-xs bg-emerald-100 border border-emerald-300" aria-hidden="true" />
                  Added or revised
                </span>
              </div>
              <div className="whitespace-pre-wrap text-[15px] leading-[1.7] text-[#1E1B4B]">
                {diffSegments.map((seg, idx) => {
                  if (seg.type === "removed") {
                    return (
                      <del
                        key={idx}
                        className="bg-red-50 text-red-800 line-through decoration-red-400/80 px-0.5 rounded-xs"
                      >
                        {seg.value}
                      </del>
                    );
                  }
                  if (seg.type === "added") {
                    return (
                      <ins
                        key={idx}
                        className="bg-emerald-50 text-emerald-900 no-underline border-b border-emerald-400/70 px-0.5 rounded-xs"
                      >
                        {seg.value}
                      </ins>
                    );
                  }
                  return <span key={idx}>{seg.value}</span>;
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-violet-100 bg-violet-50/35 px-5 py-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-mono tabular-nums">
            <span>{rewrittenMetrics.words} words</span>
            {rewrittenText && (
              <>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    wordDelta < 0
                      ? "text-emerald-700"
                      : wordDelta > 0
                        ? "text-[#5B52EE]"
                        : "text-slate-500"
                  }
                >
                  {wordDeltaLabel}
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{rewrittenMetrics.characters} chars</span>
          </div>
          <div className="flex items-center gap-2">
            {rewrittenText && (
              <>
                <span>
                  {appliedLength} · {appliedClarity}
                </span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span className="font-mono tabular-nums">
              {rewrittenMetrics.readingTimeLabel} read
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
