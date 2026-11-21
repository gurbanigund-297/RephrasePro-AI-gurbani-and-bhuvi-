interface HeaderProps {
  onRephrase: () => void;
  isLoading: boolean;
  hasText: boolean;
}

export function Header({ onRephrase, isLoading, hasText }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-violet-200/70 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-8 px-6 py-3.5">
        <a
          href="#studio"
          className="font-display text-lg font-bold tracking-tight text-[#1E1B4B] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2 rounded-sm"
        >
          RephrasePro AI
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <a
            href="#studio"
            className="hover:text-[#5B52EE] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-violet-300"
          >
            Studio
          </a>
          <a
            href="#grammar"
            className="hover:text-[#5B52EE] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-violet-300"
          >
            Grammar
          </a>
          <a
            href="#wording"
            className="hover:text-[#5B52EE] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-violet-300"
          >
            Wording
          </a>
          <a
            href="#history"
            className="hover:text-[#5B52EE] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-violet-300"
          >
            History
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onRephrase}
            disabled={isLoading || !hasText}
            className="min-h-[40px] rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/25 transition-all duration-200 hover:-translate-y-px hover:from-[#5B52EE] hover:to-[#7C3AED] hover:shadow-md hover:shadow-violet-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none disabled:hover:translate-y-0 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2"
          >
            {isLoading ? "Rewriting..." : "Rephrase Text"}
          </button>
        </div>
      </div>
    </header>
  );
}
