import { Eye, EyeOff, Maximize2, Palette } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CANVAS_PRESETS,
  MAX_CANVAS_DIM,
  MIN_CANVAS_DIM,
} from '@/engines/canvas/formatEngine';
import { BackgroundControls } from '@/features/story-creator/components/BackgroundControls';
import type { CanvasPresetId } from '@/types/studio';

interface CanvasPropertiesPanelProps {
  canvasWidth: number;
  canvasHeight: number;
  canvasPreset: CanvasPresetId;
  onChangeFormat: (
    presetId: CanvasPresetId,
    customW?: number,
    customH?: number,
  ) => void;
  backgroundColor: string;
  onChangeBackground: (color: string) => void;
  showSafeArea: boolean;
  onToggleSafeArea: () => void;
}

export function CanvasPropertiesPanel({
  canvasWidth,
  canvasHeight,
  canvasPreset,
  onChangeFormat,
  backgroundColor,
  onChangeBackground,
  showSafeArea,
  onToggleSafeArea,
}: CanvasPropertiesPanelProps) {
  const [customW, setCustomW] = useState(canvasWidth);
  const [customH, setCustomH] = useState(canvasHeight);

  useEffect(() => {
    setCustomW(canvasWidth);
    setCustomH(canvasHeight);
  }, [canvasWidth, canvasHeight]);

  return (
    <>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
          <Maximize2 className="h-3.5 w-3.5 text-neutral-500" />
          <span>Universal Canvas</span>
        </div>

        <label className="block rounded-xl border border-white/8 bg-white/[0.02] p-2">
          <span className="block text-[10px] text-neutral-500">
            Preset Rasio
          </span>
          <select
            value={canvasPreset}
            onChange={(e) => {
              const next = e.target.value as CanvasPresetId;
              if (next === 'custom') {
                onChangeFormat('custom', customW, customH);
              } else {
                onChangeFormat(next);
              }
            }}
            className="mt-0.5 w-full bg-[#0c0c0e] text-xs text-neutral-200 focus:outline-none"
          >
            {CANVAS_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} ({p.width}×{p.height})
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
            <span className="block text-[10px] text-neutral-500">Lebar</span>
            <input
              type="number"
              min={MIN_CANVAS_DIM}
              max={MAX_CANVAS_DIM}
              value={customW}
              onChange={(e) => setCustomW(Number(e.target.value) || MIN_CANVAS_DIM)}
              className="mt-0.5 w-full bg-transparent text-xs font-medium text-neutral-200 focus:outline-none"
            />
          </label>
          <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
            <span className="block text-[10px] text-neutral-500">Tinggi</span>
            <input
              type="number"
              min={MIN_CANVAS_DIM}
              max={MAX_CANVAS_DIM}
              value={customH}
              onChange={(e) => setCustomH(Number(e.target.value) || MIN_CANVAS_DIM)}
              className="mt-0.5 w-full bg-transparent text-xs font-medium text-neutral-200 focus:outline-none"
            />
          </label>
        </div>

        {(customW !== canvasWidth || customH !== canvasHeight) && (
          <button
            type="button"
            onClick={() => onChangeFormat('custom', customW, customH)}
            className="w-full rounded-xl bg-white py-1.5 text-xs font-semibold text-neutral-950 hover:bg-neutral-200"
          >
            Terapkan Ukuran ({customW}×{customH})
          </button>
        )}
      </div>

      <div className="h-px bg-white/8" />

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
          <Palette className="h-3.5 w-3.5 text-neutral-500" />
          <span>Background</span>
        </div>
        <BackgroundControls
          backgroundColor={backgroundColor}
          onChangeBackground={onChangeBackground}
        />
      </div>

      <div className="h-px bg-white/8" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-300">Safe Area</span>
        <button
          type="button"
          onClick={onToggleSafeArea}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
            showSafeArea
              ? 'border-sky-400/40 bg-sky-400/10 text-sky-300'
              : 'border-white/10 bg-white/[0.03] text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {showSafeArea ? (
            <>
              <Eye className="h-3 w-3" />
              <span>Aktif</span>
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3" />
              <span>Nonaktif</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
