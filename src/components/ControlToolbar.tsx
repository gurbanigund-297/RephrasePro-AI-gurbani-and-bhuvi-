import { RefreshCw, SlidersHorizontal } from "lucide-react";
import type {
  ClarityOption,
  LengthOption,
  ToneOption,
  WritingStyle,
} from "../types/rephrase.ts";

const STYLES: WritingStyle[] = [
  "Professional",
  "Casual",
  "Academic",
  "Creative",
  "Friendly",
];

const TONES: ToneOption[] = [
  "Neutral",
  "Confident",
  "Diplomatic",
  "Empathetic",
  "Persuasive",
];

const LENGTHS: LengthOption[] = ["Shorter", "Balanced", "Expanded"];

const CLARITIES: ClarityOption[] = ["Standard", "Clear & Direct", "Simplified"];

interface ControlToolbarProps {
  style: WritingStyle;
  onStyleChange: (style: WritingStyle) => void;
  tone: ToneOption;
  onToneChange: (tone: ToneOption) => void;
  length: LengthOption;
  onLengthChange: (length: LengthOption) => void;
  clarity: ClarityOption;
  onClarityChange: (clarity: ClarityOption) => void;
  fixGrammar: boolean;
  onFixGrammarChange: (val: boolean) => void;
  preserveMeaning: boolean;
  onPreserveMeaningChange: (val: boolean) => void;
  onRephrase: () => void;
  onTryVariation: () => void;
  isLoading: boolean;
  hasText: boolean;
  hasOutput: boolean;
}

export function ControlToolbar({
  style,
  onStyleChange,
  tone,
  onToneChange,
  length,
  onLengthChange,
  clarity,
  onClarityChange,
  fixGrammar,
  onFixGrammarChange,
  preserveMeaning,
  onPreserveMeaningChange,
  onRephrase,
  onTryVariation,
  isLoading,
  hasText,
  hasOutput,
}: ControlToolbarProps) {
  return (
    <section
      aria-label="Rewriting controls"
      className="rounded-2xl border border-violet-200/60 bg-white p-5 shadow-[0_6px_24px_-6px_rgba(108,99,255,0.09)]"
    >
      <div className="flex flex-col gap-5">
        {/* Top Row: Writing Style Selector + Primary Actions */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 whitespace-nowrap shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#6C63FF]" aria-hidden="true" />
              Writing Style
            </span>
            <div
              role="group"
              aria-label="Writing Style"
              className="flex flex-wrap items-center gap-1 rounded-xl border border-violet-100 bg-violet-50/70 p-1"
            >
              {STYLES.map((item) => {
                const active = style === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onStyleChange(item)}
                    aria-pressed={active}
                    className={`min-h-[36px] rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] ${
                      active
                        ? "bg-[#EDE9FE] text-[#4C1D95] ring-1 ring-violet-300/60 shadow-xs"
                        : "text-slate-600 hover:bg-white/90 hover:text-[#1E1B4B]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {hasOutput && (
              <button
                type="button"
                onClick={onTryVariation}
                disabled={isLoading || !hasText}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2 text-xs font-semibold text-[#1E1B4B] transition-colors duration-150 hover:border-violet-300 hover:bg-violet-50/70 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 text-[#6C63FF] ${isLoading ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
                Try Variation
              </button>
            )}
            <button
              type="button"
              onClick={onRephrase}
              disabled={isLoading || !hasText}
              className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-violet-500/25 transition-all duration-200 hover:-translate-y-px hover:from-[#5B52EE] hover:to-[#7C3AED] hover:shadow-md hover:shadow-violet-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none disabled:hover:translate-y-0 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2"
            >
              {isLoading ? "Rewriting..." : "Rephrase Text"}
            </button>
          </div>
        </div>

        <div className="h-px bg-violet-100/80" />

        {/* Second Row: Tone, Length, Clarity & Meaning/Grammar Switches */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:items-end">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="tone-select"
              className="text-xs font-semibold text-slate-600"
            >
              Tone
            </label>
            <select
              id="tone-select"
              value={tone}
              onChange={(e) => onToneChange(e.target.value as ToneOption)}
              className="min-h-[40px] w-full rounded-xl border border-violet-200/80 bg-white px-3 py-2 text-sm font-medium text-[#1E1B4B] transition-colors hover:border-violet-300 focus-visible:border-[#6C63FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/20"
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Length</span>
            <div
              role="group"
              aria-label="Target Length"
              className="grid grid-cols-3 gap-1 rounded-xl border border-violet-100 bg-violet-50/70 p-1"
            >
              {LENGTHS.map((item) => {
                const active = length === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onLengthChange(item)}
                    aria-pressed={active}
                    className={`min-h-[32px] rounded-lg px-2 py-1 text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] ${
                      active
                        ? "bg-[#EDE9FE] text-[#4C1D95] ring-1 ring-violet-300/60 shadow-xs"
                        : "text-slate-600 hover:bg-white/90 hover:text-[#1E1B4B]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Clarity</span>
            <div
              role="group"
              aria-label="Target Clarity"
              className="grid grid-cols-3 gap-1 rounded-xl border border-violet-100 bg-violet-50/70 p-1"
            >
              {CLARITIES.map((item) => {
                const active = clarity === item;
                const label = item === "Clear & Direct" ? "Direct" : item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onClarityChange(item)}
                    aria-pressed={active}
                    title={item}
                    className={`min-h-[32px] rounded-lg px-2 py-1 text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] ${
                      active
                        ? "bg-[#EDE9FE] text-[#4C1D95] ring-1 ring-violet-300/60 shadow-xs"
                        : "text-slate-600 hover:bg-white/90 hover:text-[#1E1B4B]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1 xl:justify-end">
            <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 text-xs font-medium text-slate-700 select-none hover:text-[#1E1B4B]">
              <input
                type="checkbox"
                checked={fixGrammar}
                onChange={(e) => onFixGrammarChange(e.target.checked)}
                className="h-4 w-4 rounded border-violet-300 accent-[#6C63FF] focus:ring-[#6C63FF]"
              />
              <span className="whitespace-nowrap">Improve grammar</span>
            </label>

            <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 text-xs font-medium text-slate-700 select-none hover:text-[#1E1B4B]">
              <input
                type="checkbox"
                checked={preserveMeaning}
                onChange={(e) => onPreserveMeaningChange(e.target.checked)}
                className="h-4 w-4 rounded border-violet-300 accent-[#6C63FF] focus:ring-[#6C63FF]"
              />
              <span className="whitespace-nowrap">Lock meaning</span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
