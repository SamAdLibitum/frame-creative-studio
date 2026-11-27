import { Eye, Maximize, Minus, Plus, RotateCcw } from 'lucide-react';

interface EditorBottomBarProps {
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
  elementCount: number;
  isComparingOriginal: boolean;
  onSetComparingOriginal: (comparing: boolean) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function EditorBottomBar({
  zoom,
  canvasWidth,
  canvasHeight,
  elementCount,
  isComparingOriginal,
  onSetComparingOriginal,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: EditorBottomBarProps) {
  return (
    <footer className="flex h-10 shrink-0 items-center justify-between border-t border-white/8 bg-[#0c0c0e] px-3 text-[11px] text-neutral-400 sm:px-5">
      <div className="flex items-center gap-3">
        <span>
          {canvasWidth} × {canvasHeight} px
        </span>
        <span className="hidden text-neutral-600 sm:inline">|</span>
        <span className="hidden text-neutral-500 sm:inline">
          {elementCount} objek
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            onSetComparingOriginal(true);
          }}
          onPointerUp={() => onSetComparingOriginal(false)}
          onPointerLeave={() => onSetComparingOriginal(false)}
          onPointerCancel={() => onSetComparingOriginal(false)}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              onSetComparingOriginal(true);
            }
          }}
          onKeyUp={() => onSetComparingOriginal(false)}
          onBlur={() => onSetComparingOriginal(false)}
          aria-pressed={isComparingOriginal}
          title="Tahan untuk melihat foto asli tanpa filter & overlay"
          className={`inline-flex select-none items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-colors ${
            isComparingOriginal
              ? 'border-sky-400 bg-sky-400/20 text-sky-200'
              : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.08]'
          }`}
        >
          <Eye className="h-3 w-3" />
          <span>Bandingkan Asli</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onResetZoom}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-neutral-400 transition-colors hover:bg-white/6 hover:text-white"
            title="Fit kanvas ke layar (100%)"
          >
            <Maximize className="h-3 w-3" />
            <span className="hidden sm:inline">Fit</span>
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

          <span className="w-10 text-center font-medium text-neutral-200">
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
              className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-white/6 hover:text-white"
              title="Reset zoom ke 100%"
              aria-label="Reset zoom"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
