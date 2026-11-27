import { Maximize, Minus, Plus, RotateCcw } from 'lucide-react';

interface EditorBottomBarProps {
  zoom: number;
  elementCount: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function EditorBottomBar({
  zoom,
  elementCount,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: EditorBottomBarProps) {
  return (
    <footer className="flex h-10 shrink-0 items-center justify-between border-t border-white/8 bg-[#0c0c0e] px-3 text-[11px] text-neutral-400 sm:px-5">
      <div className="flex items-center gap-3">
        <span>1080 × 1920 px · 9:16</span>
        <span className="hidden text-neutral-600 sm:inline">|</span>
        <span className="hidden text-neutral-500 sm:inline">
          {elementCount} objek di kanvas
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onResetZoom}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-neutral-400 transition-colors hover:bg-white/6 hover:text-white"
          title="Fit kanvas ke layar (100%)"
        >
          <Maximize className="h-3 w-3" />
          <span>Fit</span>
        </button>

        <button
          type="button"
          onClick={onZoomOut}
          disabled={zoom <= 50}
          className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-white/6 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Perkecil zoom"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <span className="w-11 text-center font-medium text-neutral-200">
          {zoom}%
        </span>

        <button
          type="button"
          onClick={onZoomIn}
          disabled={zoom >= 150}
          className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-white/6 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Perbesar zoom"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        {zoom !== 100 && (
          <button
            type="button"
            onClick={onResetZoom}
            className="ml-0.5 rounded-md p-1 text-neutral-400 transition-colors hover:bg-white/6 hover:text-white"
            title="Reset zoom ke 100%"
            aria-label="Reset zoom"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        )}
      </div>
    </footer>
  );
}
