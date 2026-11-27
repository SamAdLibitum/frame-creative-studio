import { useState } from 'react';
import { Download, X } from 'lucide-react';
import type { ExportFormat } from '@/utils/exportEngine';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, quality: number) => void;
  isExporting: boolean;
}

export function ExportDialog({ isOpen, onClose, onExport, isExporting }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(0.92);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-white/15 bg-[#111114] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Export Story</h3>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-neutral-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-300">Format</label>
            <div className="mt-1.5 flex gap-2">
              {(['png', 'jpeg'] as ExportFormat[]).map((f) => (
                <button key={f} type="button" onClick={() => setFormat(f)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium uppercase transition-colors ${
                    format === f ? 'border-white/25 bg-white/10 text-white' : 'border-white/8 text-neutral-400 hover:text-neutral-200'
                  }`}>
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
              <input type="range" min={0.1} max={1} step={0.05} value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="mt-1.5 w-full accent-white" />
            </div>
          )}

          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-2.5 text-[11px] text-neutral-400">
            Resolusi: 1080 × 1920 px · Rasio 9:16 · Layer tersembunyi tidak diekspor.
          </div>

          <button type="button" disabled={isExporting}
            onClick={() => onExport(format, quality)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-neutral-200 disabled:opacity-50">
            <Download className="h-4 w-4" />
            <span>{isExporting ? 'Mengekspor...' : 'Download'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
