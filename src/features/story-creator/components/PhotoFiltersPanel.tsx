import { RotateCcw, Sparkles } from 'lucide-react';
import {
  DEFAULT_ADJUSTMENTS,
  FILTER_PRESETS,
} from '@/features/story-creator/utils/photoFilters';
import type {
  CanvasPhotoElement,
  FilterPresetId,
  PhotoAdjustments,
} from '@/types/studio';

interface PhotoFiltersPanelProps {
  element: CanvasPhotoElement;
  onUpdate: (
    updated: Partial<CanvasPhotoElement>,
    options?: { coalesce?: boolean },
  ) => void;
}

const ADJUSTMENT_CONTROLS: Array<{
  key: keyof PhotoAdjustments;
  label: string;
  min: number;
  max: number;
  step: number;
}> = [
  { key: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1 },
  { key: 'contrast', label: 'Contrast', min: -100, max: 100, step: 1 },
  { key: 'saturation', label: 'Saturation', min: -100, max: 100, step: 1 },
  { key: 'warmth', label: 'Warmth', min: -100, max: 100, step: 1 },
  { key: 'exposure', label: 'Exposure', min: -100, max: 100, step: 1 },
  { key: 'fade', label: 'Fade', min: 0, max: 100, step: 1 },
  { key: 'grain', label: 'Film Grain', min: 0, max: 100, step: 1 },
  { key: 'blur', label: 'Blur', min: 0, max: 20, step: 0.5 },
  { key: 'sepia', label: 'Sepia', min: 0, max: 100, step: 1 },
  { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, step: 1 },
];

export function PhotoFiltersPanel({
  element,
  onUpdate,
}: PhotoFiltersPanelProps) {
  const activePreset: FilterPresetId = element.filterPreset ?? 'original';
  const intensity = element.presetIntensity ?? 100;
  const adjustments: PhotoAdjustments = {
    ...DEFAULT_ADJUSTMENTS,
    ...(element.adjustments ?? {}),
  };

  const handleSelectPreset = (presetId: FilterPresetId) => {
    onUpdate({
      filterPreset: presetId,
      presetIntensity: presetId === 'original' ? 100 : intensity || 100,
    });
  };

  const handleResetAll = () => {
    onUpdate({
      filterPreset: 'original',
      presetIntensity: 100,
      adjustments: { ...DEFAULT_ADJUSTMENTS },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          Filter & Adjustments
        </span>
        <button
          type="button"
          disabled={element.locked}
          onClick={handleResetAll}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Original</span>
        </button>
      </div>

      {/* 10 Filter Presets */}
      <div className="grid grid-cols-2 gap-1.5">
        {FILTER_PRESETS.map((preset) => {
          const isSelected = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              disabled={element.locked}
              onClick={() => handleSelectPreset(preset.id)}
              className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition-all ${
                isSelected
                  ? 'border-white/35 bg-white/12 text-white'
                  : 'border-white/8 bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:text-neutral-200'
              } disabled:opacity-40`}
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-white/20"
                style={{ background: preset.swatchGradient }}
              />
              <span className="truncate text-[11px] font-medium">
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Preset Intensity */}
      {activePreset !== 'original' && (
        <div className="space-y-1 rounded-xl border border-white/8 bg-white/[0.02] p-2.5">
          <div className="flex justify-between text-[11px] text-neutral-300">
            <span>Intensitas Preset</span>
            <span className="font-mono text-neutral-400">{intensity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            disabled={element.locked}
            value={intensity}
            onChange={(e) =>
              onUpdate(
                { presetIntensity: Number(e.target.value) },
                { coalesce: true },
              )
            }
            className="w-full accent-amber-400"
          />
        </div>
      )}

      {/* Individual Adjustments */}
      <div className="space-y-2.5 border-t border-white/8 pt-3">
        <p className="text-[11px] font-medium text-neutral-400">
          Penyesuaian Detail
        </p>
        {ADJUSTMENT_CONTROLS.map((ctrl) => {
          const val = adjustments[ctrl.key];
          return (
            <div key={ctrl.key} className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>{ctrl.label}</span>
                <span className="font-mono text-neutral-300">
                  {val > 0 && ctrl.min < 0 ? `+${val}` : val}
                </span>
              </div>
              <input
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step}
                disabled={element.locked}
                value={val}
                onChange={(e) =>
                  onUpdate(
                    {
                      adjustments: {
                        ...adjustments,
                        [ctrl.key]: Number(e.target.value),
                      },
                    },
                    { coalesce: true },
                  )
                }
                className="h-1.5 w-full accent-white"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
