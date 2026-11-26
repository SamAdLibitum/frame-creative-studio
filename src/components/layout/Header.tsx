import { Menu, Plus, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onCreateStory: () => void;
}

export function Header({ onOpenMobileMenu, onCreateStory }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/8 bg-[#09090b]/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/6 hover:text-white lg:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 lg:hidden">
          <span className="text-sm font-semibold tracking-[0.18em] text-white">
            FRAME
          </span>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-neutral-400 sm:flex">
          <Sparkles className="h-3.5 w-3.5 text-neutral-300" aria-hidden="true" />
          <span>Story Studio · 1080 × 1920 px</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCreateStory}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-950 transition-all duration-150 hover:bg-neutral-200 active:scale-[0.98] sm:text-sm"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Create Story</span>
        </button>
      </div>
    </header>
  );
}
