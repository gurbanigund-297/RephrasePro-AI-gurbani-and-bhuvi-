import { RotateCcw, Trash2 } from "lucide-react";
import type { RevisionEntry } from "../types/rephrase.ts";
import { analyzeTextMetrics } from "../utils/metrics.ts";

interface HistorySectionProps {
  history: RevisionEntry[];
  onRestore: (entry: RevisionEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function HistorySection({
  history,
  onRestore,
  onDelete,
  onClearAll,
}: HistorySectionProps) {
  return (
    <section
      id="history"
      aria-label="Recent revisions"
      className="rounded-2xl border border-violet-100 bg-white shadow-[0_6px_24px_-6px_rgba(108,99,255,0.08)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-100/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-base font-semibold text-[#1E1B4B]">
            Recent Revisions
          </h2>
          <span className="font-mono text-xs text-slate-500 tabular-nums">
            {history.length} saved
          </span>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="min-h-[34px] rounded-lg px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-violet-50 hover:text-[#4C1D95] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
          >
            Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="px-6 py-6 text-sm text-slate-600">
          Your completed rewrites will be saved locally here so you can compare
          iterations or restore an earlier version anytime.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-violet-100/80 text-xs font-semibold text-slate-500">
                <th className="px-6 py-3 font-semibold">Style &amp; Settings</th>
                <th className="px-6 py-3 font-semibold">Rewritten Preview</th>
                <th className="px-6 py-3 text-right font-semibold">Words</th>
                <th className="px-6 py-3 text-right font-semibold">Time</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-100/70">
              {history.map((entry) => {
                const origWords = analyzeTextMetrics(entry.originalText).words;
                const newWords = analyzeTextMetrics(entry.rewrittenText).words;
                const delta = newWords - origWords;
                const formattedTime = new Date(entry.timestamp).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" }
                );

                return (
                  <tr
                    key={entry.id}
                    className="transition-colors hover:bg-violet-50/40"
                  >
                    <td className="px-6 py-3.5 whitespace-nowrap text-xs font-medium text-[#1E1B4B]">
                      {entry.style} · {entry.tone} · {entry.length}
                    </td>
                    <td className="max-w-md px-6 py-3.5 text-slate-700">
                      <p className="truncate">{entry.rewrittenText}</p>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                      {newWords} ({delta >= 0 ? `+${delta}` : delta})
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                      {formattedTime}
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onRestore(entry)}
                          className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-violet-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#4C1D95] transition-colors hover:border-violet-300 hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
                        >
                          <RotateCcw className="h-3 w-3" aria-hidden="true" />
                          Restore
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(entry.id)}
                          aria-label="Delete revision"
                          className="inline-flex min-h-[32px] items-center justify-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
