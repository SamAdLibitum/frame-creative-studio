import { Download, Layers, X } from 'lucide-react';
import { useState } from 'react';
import { CANVAS_PRESETS } from '@/engines/canvas/formatEngine';
import type { CanvasPresetId } from '@/types/studio';
import type { ExportFormat } from '@/utils/exportEngine';

interface ExportDialogProps {
  isOpen: boolean;
  canvasWidth: number;
  canvasHeight: number;
  slideCount?: number;
  onClose: () => void;
  onExport: (format: ExportFormat, quality: number) => void;
  onExportAllSlides?: (format: ExportFormat, quality: number) => void;
  onBatchExport?: (
    presets: CanvasPresetId[],
    format: ExportFormat,
    quality: number,
  ) => Promise<{ succeeded: number; failed: string[] }>;
  isExporting: boolean;
}

const BATCH_PRESETS = CANVAS_PRESETS.filter((p) => p.id !== 'custom');

export function ExportDialog({
  isOpen,
  canvasWidth,
  canvasHeight,
  slideCount = 0,
  onClose,
  onExport,
  onExportAllSlides,
  onBatchExport,
  isExporting,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const [selectedBatch, setSelectedBatch] = useState<CanvasPresetId[]>([
    'story-9-16',
    'square-1-1',
    'portrait-4-5',
  ]);
  const [batchStatus, setBatchStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const togglePreset = (id: CanvasPresetId) => {
    setSelectedBatch((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const runBatch = async () => {
    if (!onBatchExport || selectedBatch.length === 0) return;
    setBatchStatus('Mengekspor multi-rasio...');
    const res = await onBatchExport(selectedBatch, format, quality);
    setBatchStatus(
      res.failed.length > 0
        ? `Berhasil ${res.succeeded}, gagal: ${res.failed.join(', ')}`
        : `Berhasil mengekspor ${res.succeeded} file.`,
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#111114] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Export Desain</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-neutral-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-300">
              Format
            </label>
            <div className="mt-1.5 flex gap-2">
              {(['png', 'jpeg'] as ExportFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium uppercase transition-colors ${
                    format === f
                      ? 'border-white/25 bg-white/10 text-white'
                      : 'border-white/8 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {format === 'jpeg' && (
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Kualitas</span>
                <span>{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="mt-1.5 w-full accent-white"
              />
            </div>
          )}

          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-2.5 text-[11px] text-neutral-400">
            Resolusi aktif: {canvasWidth} × {canvasHeight} px · Layer
            tersembunyi & panduan tidak diekspor.
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => onExport(format, quality)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-neutral-200 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>
                {isExporting
                  ? 'Mengekspor...'
                  : slideCount > 1
                    ? 'Export Slide Aktif'
                    : 'Download'}
              </span>
            </button>

            {slideCount > 1 && onExportAllSlides && (
              <button
                type="button"
                disabled={isExporting}
                onClick={() => onExportAllSlides(format, quality)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white hover:bg-white/[0.1] disabled:opacity-50"
              >
                <Layers className="h-3.5 w-3.5 text-sky-400" />
                <span>Export Semua {slideCount} Slide Berurutan</span>
              </button>
            )}
          </div>

          {/* Multi-Format Batch Export */}
          {onBatchExport && (
            <div className="space-y-2.5 border-t border-white/10 pt-3">
              <p className="text-xs font-semibold text-neutral-200">
                Batch Export Multi-Rasio
              </p>
              <div className="flex flex-wrap gap-1.5">
                {BATCH_PRESETS.map((p) => {
                  const active = selectedBatch.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePreset(p.id)}
                      className={`rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-colors ${
                        active
                          ? 'border-sky-400 bg-sky-400/15 text-sky-200'
                          : 'border-white/10 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                disabled={isExporting || selectedBatch.length === 0}
                onClick={() => void runBatch()}
                className="w-full rounded-xl border border-sky-400/35 bg-sky-400/10 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-400/20 disabled:opacity-40"
              >
                Batch Export ({selectedBatch.length} Rasio)
              </button>
              {batchStatus && (
                <p className="text-[11px] text-neutral-300">{batchStatus}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
