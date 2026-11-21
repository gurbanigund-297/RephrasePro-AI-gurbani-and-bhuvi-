import { ArrowRight, Check } from "lucide-react";
import type { RephraseResult, WordingSuggestion } from "../types/rephrase.ts";

interface InsightsSectionProps {
  result: RephraseResult | null;
  rewrittenText: string;
  onApplyWording: (suggestion: WordingSuggestion) => void;
}

export function InsightsSection({
  result,
  rewrittenText,
  onApplyWording,
}: InsightsSectionProps) {
  if (!result) {
    return (
      <section
        id="grammar"
        aria-label="Grammar and wording insights"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-[0_6px_24px_-6px_rgba(108,99,255,0.08)]">
          <h2 className="font-display text-base font-semibold text-[#1E1B4B]">
            Grammar &amp; Clarity Improvements
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            When you rephrase a draft, specific grammar, punctuation, agreement, and
            conciseness corrections will be itemized here for transparent review.
          </p>
        </div>

        <div id="wording" className="rounded-2xl border border-violet-100 bg-white p-6 shadow-[0_6px_24px_-6px_rgba(108,99,255,0.08)]">
          <h2 className="font-display text-base font-semibold text-[#1E1B4B]">
            Better Wording Suggestions
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Actionable vocabulary and phrasing alternatives will appear here so you
            can swap stronger phrasing directly into your rewritten output with one click.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Meaning Preservation & Style Summary Strip */}
      {(result.meaningPreservationNote || result.toneSummary) && (
        <section
          aria-label="Meaning preservation summary"
          className="rounded-2xl border border-violet-100 bg-white px-6 py-4 shadow-[0_6px_24px_-6px_rgba(108,99,255,0.08)]"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
            <div>
              <h3 className="text-xs font-semibold text-slate-500">
                Meaning Preservation Check
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[#1E1B4B]">
                {result.meaningPreservationNote}
              </p>
            </div>
            <div className="border-t border-violet-100 pt-4 md:border-t-0 md:border-l md:pl-8 md:pt-0">
              <h3 className="text-xs font-semibold text-slate-500">
                Style &amp; Tone Adjustment
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[#1E1B4B]">
                {result.toneSummary}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 2-Column Grammar Fixes & Wording Suggestions */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
        <div id="grammar" className="rounded-2xl border border-violet-100 bg-white shadow-[0_6px_24px_-6px_rgba(108,99,255,0.08)]">
          <div className="flex items-center justify-between border-b border-violet-100/80 px-6 py-4">
            <h2 className="font-display text-base font-semibold text-[#1E1B4B]">
              Grammar &amp; Clarity Fixes
            </h2>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {result.grammarFixes.length}{" "}
              {result.grammarFixes.length === 1 ? "fix" : "fixes"}
            </span>
          </div>

          {result.grammarFixes.length === 0 ? (
            <div className="px-6 py-6 text-sm text-slate-600">
              No grammatical or mechanical errors detected in your original text.
            </div>
          ) : (
            <ul className="divide-y divide-violet-100/70">
              {result.grammarFixes.map((fix, idx) => (
                <li key={idx} className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-[#4C1D95]">
                      {fix.issueType}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-red-700 line-through decoration-red-400">
                      {fix.original}
                    </span>
                    <ArrowRight
                      className="h-3.5 w-3.5 shrink-0 text-slate-400"
                      aria-hidden="true"
                    />
                    <span className="font-medium text-emerald-800">
                      {fix.corrected}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    {fix.explanation}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div id="wording" className="rounded-2xl border border-violet-100 bg-white shadow-[0_6px_24px_-6px_rgba(108,99,255,0.08)]">
          <div className="flex items-center justify-between border-b border-violet-100/80 px-6 py-4">
            <h2 className="font-display text-base font-semibold text-[#1E1B4B]">
              Better Wording Suggestions
            </h2>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {result.wordingSuggestions.length} suggestions
            </span>
          </div>

          {result.wordingSuggestions.length === 0 ? (
            <div className="px-6 py-6 text-sm text-slate-600">
              Your rewritten text already uses concise, natural phrasing.
            </div>
          ) : (
            <ul className="divide-y divide-violet-100/70">
              {result.wordingSuggestions.map((item, idx) => {
                const canApply = rewrittenText.includes(item.targetPhrase);
                const alreadyApplied =
                  !canApply && rewrittenText.includes(item.suggestedAlternative);

                return (
                  <li
                    key={idx}
                    className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-slate-600">{item.targetPhrase}</span>
                        <ArrowRight
                          className="h-3.5 w-3.5 shrink-0 text-slate-400"
                          aria-hidden="true"
                        />
                        <span className="font-semibold text-[#5B52EE]">
                          {item.suggestedAlternative}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {item.reason}
                      </p>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {alreadyApplied ? (
                        <span className="inline-flex min-h-[32px] items-center gap-1 text-xs font-medium text-emerald-700">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          Applied
                        </span>
                      ) : canApply ? (
                        <button
                          type="button"
                          onClick={() => onApplyWording(item)}
                          className="min-h-[34px] rounded-xl border border-violet-200 bg-white px-3 py-1 text-xs font-semibold text-[#4C1D95] transition-colors hover:border-violet-300 hover:bg-violet-50 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
                        >
                          Apply
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
