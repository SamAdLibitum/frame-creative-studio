import { Dices, Download, Layers, Pipette, Sparkles, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_PROCEDURAL_CONFIG,
  PROCEDURAL_GENERATORS,
  PROCEDURAL_PALETTES,
  type ProceduralBlendMode,
  type ProceduralConfig,
  type ProceduralGeneratorType,
  renderProceduralToCanvas,
  sanitizeProceduralConfig,
} from '@/engines/procedural';
import { useStoryEditor } from '@/features/story-creator/context/StoryEditorContext';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/types/studio';
import { downloadBlob } from '@/utils/exportEngine';

const BLEND_MODE_OPTIONS: Array<{ value: ProceduralBlendMode; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'lighten', label: 'Lighten' },
];

const THUMB_SIZE = 140;

function GeneratorThumbnail({
  generatorType,
  baseConfig,
}: {
  generatorType: ProceduralGeneratorType;
  baseConfig: ProceduralConfig;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const dest = canvasRef.current;
    if (!dest) return;
    const ctx = dest.getContext('2d');
    if (!ctx) return;

    const previewCfg = sanitizeProceduralConfig({
      ...baseConfig,
      generatorType,
    });
    const src = renderProceduralToCanvas(previewCfg, THUMB_SIZE, THUMB_SIZE);

    ctx.clearRect(0, 0, THUMB_SIZE, THUMB_SIZE);
    // Subtle base backdrop for transparent-space generators in thumbnail preview
    ctx.fillStyle = previewCfg.palette[0];
    ctx.fillRect(0, 0, THUMB_SIZE, THUMB_SIZE);
    ctx.drawImage(src, 0, 0, THUMB_SIZE, THUMB_SIZE);
  }, [
    generatorType,
    baseConfig.seed,
    baseConfig.palette,
    baseConfig.complexity,
    baseConfig.density,
    baseConfig.scale,
    baseConfig.rotation,
    baseConfig.grain,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={THUMB_SIZE}
      height={THUMB_SIZE}
      className="aspect-square w-full rounded-lg border border-white/10 object-cover"
    />
  );
}

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
  { key: 'rotation', label: 'Rotation', min: 0, max: 360, unit: '°' },
  { key: 'grain', label: 'Grain', min: 0, max: 50, unit: '' },
];

export function ProceduralPanel() {
  const {
    addProceduralLayer,
    applyProceduralBackground,
    applyProceduralOverlay,
    extractPaletteFromActivePhoto,
    uploadedPhotos,
  } = useStoryEditor();
  const [config, setConfig] = useState<ProceduralConfig>(() =>
    sanitizeProceduralConfig(DEFAULT_PROCEDURAL_CONFIG),
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [extractNote, setExtractNote] = useState<string | null>(null);

  const updateDraft = (patch: Partial<ProceduralConfig>) => {
    setConfig((prev) => sanitizeProceduralConfig({ ...prev, ...patch }));
  };

  const handleExtractFromPhoto = async () => {
    setExtractNote(null);
    const extracted = await extractPaletteFromActivePhoto();
    if (!extracted) {
      setExtractNote('Unggah atau pilih foto terlebih dahulu.');
      return;
    }
    updateDraft({ palette: extracted });
  };

  const handleRandomSeed = () => {
    const nextSeed = Math.floor(1000 + Math.random() * 999000);
    updateDraft({ seed: nextSeed });
  };

  const handleDownloadStandalonePng = () => {
    setIsDownloading(true);
    try {
      const rendered = renderProceduralToCanvas(
        config,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
      );
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = CANVAS_WIDTH;
      exportCanvas.height = CANVAS_HEIGHT;
      const ctx = exportCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(rendered, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
      exportCanvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(
            blob,
            `procedural-${config.generatorType}-${config.seed}.png`,
          );
        }
        setIsDownloading(false);
        exportCanvas.width = 0;
        exportCanvas.height = 0;
      }, 'image/png');
    } catch {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-0.5">
      {/* 1. Generator Grid with Live 140x140 Thumbnails */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-neutral-200">
          1. Pilih Generator
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PROCEDURAL_GENERATORS.map((gen) => {
            const isSelected = config.generatorType === gen.id;
            return (
              <button
                key={gen.id}
                type="button"
                onClick={() => updateDraft({ generatorType: gen.id })}
                className={`flex flex-col rounded-xl border p-1.5 text-left transition-all ${
                  isSelected
                    ? 'border-sky-400 bg-sky-400/[0.08]'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                }`}
              >
                <GeneratorThumbnail
                  generatorType={gen.id}
                  baseConfig={config}
                />
                <span className="mt-1.5 truncate px-0.5 text-[10px] font-semibold text-neutral-200">
                  {gen.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Seed Controls */}
      <div className="space-y-1.5 border-t border-white/8 pt-3">
        <p className="text-[11px] font-semibold text-neutral-200">
          2. Seed Deterministik
        </p>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            value={config.seed}
            onChange={(e) =>
              updateDraft({ seed: Math.max(0, Number(e.target.value) || 0) })
            }
            aria-label="Seed numerik"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-xs text-neutral-200 focus:border-sky-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleRandomSeed}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-white/[0.1] hover:text-white"
          >
            <Dices className="h-3.5 w-3.5 text-sky-400" />
            <span>Acak Seed</span>
          </button>
        </div>
      </div>

      {/* 3. Curated Palettes & Individual Color Editing */}
      <div className="space-y-2 border-t border-white/8 pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-neutral-200">
            3. Palet Warna
          </p>
          <button
            type="button"
            disabled={uploadedPhotos.length === 0}
            onClick={() => void handleExtractFromPhoto()}
            title="Ekstrak 5 warna harmonis dari foto aktif di kanvas"
            className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-sky-300 transition-colors hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Pipette className="h-3 w-3" />
            <span>Ambil Warna dari Foto</span>
          </button>
        </div>
        {extractNote && (
          <p className="text-[10px] text-amber-300">{extractNote}</p>
        )}

        {/* Active Palette Individual Swatch Pickers */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-2">
          {config.palette.map((hex, idx) => (
            <label
              key={idx}
              title={
                idx === 0
                  ? `Base: ${hex}`
                  : idx === config.palette.length - 1
                    ? `Accent: ${hex}`
                    : `Support: ${hex}`
              }
              className="relative flex h-6 flex-1 cursor-pointer overflow-hidden rounded-md border border-white/20 transition-transform hover:scale-105"
              style={{ backgroundColor: hex }}
            >
              <input
                type="color"
                value={hex}
                onChange={(e) => {
                  const nextPalette = [...config.palette];
                  nextPalette[idx] = e.target.value;
                  updateDraft({ palette: nextPalette });
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
          ))}
        </div>

        {/* 10 Curated Presets */}
        <div className="grid grid-cols-2 gap-1.5">
          {PROCEDURAL_PALETTES.map((pal) => {
            const isMatch =
              pal.colors.join(',').toUpperCase() ===
              config.palette.join(',').toUpperCase();
            return (
              <button
                key={pal.id}
                type="button"
                onClick={() => updateDraft({ palette: [...pal.colors] })}
                className={`flex flex-col gap-1 rounded-xl border p-2 text-left transition-colors ${
                  isMatch
                    ? 'border-white/35 bg-white/10'
                    : 'border-white/8 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex h-2.5 w-full overflow-hidden rounded-xs">
                  {pal.colors.map((c, i) => (
                    <span
                      key={i}
                      className="h-full flex-1"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span className="truncate text-[10px] font-medium text-neutral-300">
                  {pal.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Parameter Sliders */}
      <div className="space-y-2.5 border-t border-white/8 pt-3">
        <p className="text-[11px] font-semibold text-neutral-200">
          4. Parameter Komposisi
        </p>
        <label className="block rounded-xl border border-white/8 bg-white/[0.02] p-2">
          <span className="block text-[10px] text-neutral-500">
            Mode Pencampuran
          </span>
          <select
            value={config.blendMode ?? 'normal'}
            onChange={(e) =>
              updateDraft({
                blendMode: e.target.value as ProceduralBlendMode,
              })
            }
            className="mt-0.5 w-full bg-[#0f0f12] text-xs text-neutral-200 focus:outline-none"
          >
            {BLEND_MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        {SLIDER_SPECS.map((spec) => (
          <div key={spec.key} className="space-y-0.5">
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>{spec.label}</span>
              <span className="font-mono text-neutral-300">
                {config[spec.key]}
                {spec.unit}
              </span>
            </div>
            <input
              type="range"
              min={spec.min}
              max={spec.max}
              step={1}
              value={config[spec.key]}
              onChange={(e) =>
                updateDraft({ [spec.key]: Number(e.target.value) })
              }
              className="h-1.5 w-full accent-sky-400"
            />
          </div>
        ))}
      </div>

      {/* 5. Canvas & Export Actions */}
      <div className="space-y-2 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={() => applyProceduralOverlay(config)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-sky-400 py-2 text-xs font-semibold text-neutral-950 transition-colors hover:bg-sky-300"
        >
          <Sun className="h-3.5 w-3.5" />
          <span>Terapkan di Atas Foto</span>
        </button>

        <button
          type="button"
          onClick={() => applyProceduralBackground(config)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white py-2 text-xs font-semibold text-neutral-950 transition-colors hover:bg-neutral-200"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Jadikan Latar Kanvas</span>
        </button>

        <button
          type="button"
          onClick={() => addProceduralLayer(config)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] py-2 text-xs font-medium text-neutral-100 transition-colors hover:bg-white/[0.1]"
        >
          <Layers className="h-3.5 w-3.5 text-sky-400" />
          <span>Tambah sebagai Layer</span>
        </button>

        <button
          type="button"
          disabled={isDownloading}
          onClick={handleDownloadStandalonePng}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          <span>
            {isDownloading ? 'Menyiapkan PNG...' : 'Unduh PNG (1080×1920)'}
          </span>
        </button>
      </div>
    </div>
  );
}
