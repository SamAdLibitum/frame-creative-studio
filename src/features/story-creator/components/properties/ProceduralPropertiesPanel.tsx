import { Dices, Pipette, Sparkles } from 'lucide-react';
import {
  PROCEDURAL_GENERATORS,
  PROCEDURAL_PALETTES,
  type ProceduralBlendMode,
  type ProceduralConfig,
  type ProceduralGeneratorType,
} from '@/engines/procedural';
import { useStoryEditor } from '@/features/story-creator/context/StoryEditorContext';
import type { CanvasProceduralElement } from '@/types/studio';

interface ProceduralPropertiesPanelProps {
  element: CanvasProceduralElement;
  onUpdateConfig: (
    patch: Partial<ProceduralConfig>,
    options?: { coalesce?: boolean },
  ) => void;
}

const BLEND_MODE_OPTIONS: Array<{ value: ProceduralBlendMode; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'lighten', label: 'Lighten' },
];

const SLIDER_SPECS: Array<{
  key: 'complexity' | 'density' | 'scale' | 'rotation' | 'grain';
  label: string;
  min: number;
  max: number;
  unit: string;
}> = [
  { key: 'complexity', label: 'Complexity', min: 1, max: 100, unit: '' },
  { key: 'density', label: 'Density', min: 1, max: 100, unit: '' },
  { key: 'scale', label: 'Scale', min: 20, max: 200, unit: '%' },
  { key: 'rotation', label: 'Orientasi Komposisi', min: 0, max: 360, unit: '°' },
  { key: 'grain', label: 'Grain', min: 0, max: 50, unit: '' },
];

export function ProceduralPropertiesPanel({
  element,
  onUpdateConfig,
}: ProceduralPropertiesPanelProps) {
  const { extractPaletteFromActivePhoto, uploadedPhotos } = useStoryEditor();
  const cfg = element.procedural;

  const handleExtractPalette = async () => {
    const extracted = await extractPaletteFromActivePhoto();
    if (extracted) {
      onUpdateConfig({ palette: extracted });
    }
  };

  return (
    <div className="space-y-3 border-t border-white/8 pt-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
          <Sparkles className="h-3.5 w-3.5 text-sky-400" />
          <span>Procedural Artwork</span>
        </div>
        <button
          type="button"
          disabled={element.locked || uploadedPhotos.length === 0}
          onClick={() => void handleExtractPalette()}
          title="Ambil palet warna dari foto di kanvas"
          className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-sky-300 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Pipette className="h-3 w-3" />
          <span>Ambil Warna dari Foto</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block rounded-xl border border-white/8 bg-white/[0.02] p-2">
          <span className="block text-[10px] text-neutral-500">Generator</span>
          <select
            disabled={element.locked}
            value={cfg.generatorType}
            onChange={(e) =>
              onUpdateConfig({
                generatorType: e.target.value as ProceduralGeneratorType,
              })
            }
            className="mt-0.5 w-full bg-[#0c0c0e] text-xs text-neutral-200 focus:outline-none"
          >
            {PROCEDURAL_GENERATORS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block rounded-xl border border-white/8 bg-white/[0.02] p-2">
          <span className="block text-[10px] text-neutral-500">
            Mode Pencampuran
          </span>
          <select
            disabled={element.locked}
            value={cfg.blendMode ?? 'normal'}
            onChange={(e) =>
              onUpdateConfig({
                blendMode: e.target.value as ProceduralBlendMode,
              })
            }
            className="mt-0.5 w-full bg-[#0c0c0e] text-xs text-neutral-200 focus:outline-none"
          >
            {BLEND_MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Seed */}
      <div className="flex items-center gap-1.5">
        <label className="min-w-0 flex-1 rounded-xl border border-white/8 bg-white/[0.02] px-2.5 py-1.5">
          <span className="block text-[9px] text-neutral-500">Seed</span>
          <input
            type="number"
            min={0}
            disabled={element.locked}
            value={cfg.seed}
            onChange={(e) =>
              onUpdateConfig({
                seed: Math.max(0, Number(e.target.value) || 0),
              })
            }
            className="w-full bg-transparent font-mono text-xs text-neutral-200 focus:outline-none"
          />
        </label>
        <button
          type="button"
          disabled={element.locked}
          onClick={() =>
            onUpdateConfig({
              seed: Math.floor(1000 + Math.random() * 999000),
            })
          }
          className="inline-flex items-center gap-1 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-xs font-medium text-neutral-200 hover:bg-white/[0.1] disabled:opacity-40"
        >
          <Dices className="h-3.5 w-3.5 text-sky-400" />
          <span>Acak</span>
        </button>
      </div>

      {/* Palette Swatches & Preset Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-2">
          {cfg.palette.map((hex, idx) => (
            <label
              key={idx}
              className="relative flex h-5 flex-1 cursor-pointer overflow-hidden rounded border border-white/20"
              style={{ backgroundColor: hex }}
            >
              <input
                type="color"
                disabled={element.locked}
                value={hex}
                onChange={(e) => {
                  const nextPalette = [...cfg.palette];
                  nextPalette[idx] = e.target.value;
                  onUpdateConfig(
                    { palette: nextPalette },
                    { coalesce: true },
                  );
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
          ))}
        </div>

        <select
          disabled={element.locked}
          value={
            PROCEDURAL_PALETTES.find(
              (p) =>
                p.colors.join(',').toUpperCase() ===
                cfg.palette.join(',').toUpperCase(),
            )?.id ?? ''
          }
          onChange={(e) => {
            const pal = PROCEDURAL_PALETTES.find(
              (p) => p.id === e.target.value,
            );
            if (pal) onUpdateConfig({ palette: [...pal.colors] });
          }}
          className="w-full rounded-xl border border-white/10 bg-[#0c0c0e] px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none"
        >
          <option value="" disabled>
            Pilih Palet Preset...
          </option>
          {PROCEDURAL_PALETTES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sliders */}
      <div className="space-y-2">
        {SLIDER_SPECS.map((spec) => (
          <div key={spec.key} className="space-y-0.5">
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>{spec.label}</span>
              <span className="font-mono text-neutral-300">
                {cfg[spec.key]}
                {spec.unit}
              </span>
            </div>
            <input
              type="range"
              min={spec.min}
              max={spec.max}
              step={1}
              disabled={element.locked}
              value={cfg[spec.key]}
              onChange={(e) =>
                onUpdateConfig(
                  { [spec.key]: Number(e.target.value) },
                  { coalesce: true },
                )
              }
              className="h-1.5 w-full accent-sky-400"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
