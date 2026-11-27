import { Eye, EyeOff, Maximize2, Palette } from 'lucide-react';
import { BackgroundControls } from '@/features/story-creator/components/BackgroundControls';

interface CanvasPropertiesPanelProps {
  backgroundColor: string;
  onChangeBackground: (color: string) => void;
  showSafeArea: boolean;
  onToggleSafeArea: () => void;
}

export function CanvasPropertiesPanel({
  backgroundColor,
  onChangeBackground,
  showSafeArea,
  onToggleSafeArea,
}: CanvasPropertiesPanelProps) {
  return (
    <>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
          <Maximize2 className="h-3.5 w-3.5 text-neutral-500" />
          <span>Dokumen</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-2.5">
            <p className="text-[10px] text-neutral-500">Document Size</p>
            <p className="mt-0.5 text-xs font-medium text-neutral-200">
              1080 × 1920 px
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-2.5">
            <p className="text-[10px] text-neutral-500">Aspect Ratio</p>
            <p className="mt-0.5 text-xs font-medium text-neutral-200">9:16</p>
          </div>
        </div>
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
