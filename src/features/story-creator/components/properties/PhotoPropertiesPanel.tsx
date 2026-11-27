import { Crop, Frame } from 'lucide-react';
import { PhotoFiltersPanel } from '@/features/story-creator/components/PhotoFiltersPanel';
import type {
  CanvasElement,
  CanvasPhotoElement,
  FrameMaskKind,
  UploadedPhoto,
} from '@/types/studio';

const FRAME_MASK_OPTIONS: Array<{ value: FrameMaskKind; label: string }> = [
  { value: 'none', label: 'Tanpa Mask (Bebas)' },
  { value: 'rect', label: 'Rectangle' },
  { value: 'rounded-rect', label: 'Rounded Rectangle' },
  { value: 'circle', label: 'Circle' },
  { value: 'oval', label: 'Oval' },
  { value: 'arch', label: 'Arch (Kubah)' },
  { value: 'polaroid', label: 'Polaroid Frame' },
  { value: 'custom-ratio', label: 'Custom Aspect Ratio' },
];

interface PhotoPropertiesPanelProps {
  element: CanvasPhotoElement;
  photos: UploadedPhoto[];
  onUpdate: (
    patch: Partial<CanvasElement>,
    options?: { coalesce?: boolean },
  ) => void;
  onOpenCrop: () => void;
}

export function PhotoPropertiesPanel({
  element,
  photos,
  onUpdate,
  onOpenCrop,
}: PhotoPropertiesPanelProps) {
  return (
    <>
      <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-medium text-neutral-400">
            Sumber Foto
          </span>
          <select
            disabled={element.locked}
            value={element.photoId}
            onChange={(e) => {
              const picked = photos.find((p) => p.id === e.target.value);
              onUpdate({
                photoId: e.target.value,
                name: picked ? picked.name : element.name,
                crop: element.crop ?? { zoom: 1, offsetX: 0, offsetY: 0 },
              } as Partial<CanvasElement>);
            }}
            className="max-w-[150px] truncate rounded-md border border-white/10 bg-[#0c0c0e] px-2 py-1 text-[11px] text-neutral-200 focus:outline-none"
          >
            <option value="">(Frame Kosong)</option>
            {photos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {element.photoId && (
          <button
            type="button"
            disabled={element.locked}
            onClick={onOpenCrop}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-400/15 py-1.5 text-xs font-semibold text-sky-300 transition-colors hover:bg-sky-400/25 disabled:opacity-40"
          >
            <Crop className="h-3.5 w-3.5" />
            <span>Crop & Posisi Foto</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5 border-t border-white/8 pt-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
          <Frame className="h-3.5 w-3.5 text-sky-400" />
          <span>Frame Masking</span>
        </div>

        <label className="block rounded-xl border border-white/8 bg-white/[0.02] p-2">
          <span className="block text-[10px] text-neutral-500">
            Bentuk Masking
          </span>
          <select
            disabled={element.locked}
            value={element.frameShape ?? 'none'}
            onChange={(e) => {
              const nextShape = e.target.value as FrameMaskKind;
              const sizePatch: Partial<CanvasPhotoElement> =
                nextShape === 'circle'
                  ? {
                      width: Math.min(element.width, element.height),
                      height: Math.min(element.width, element.height),
                      keepAspectRatio: true,
                    }
                  : { keepAspectRatio: nextShape === 'none' };
              onUpdate({
                frameShape: nextShape,
                crop: element.crop ?? { zoom: 1, offsetX: 0, offsetY: 0 },
                frameBackground:
                  nextShape === 'polaroid'
                    ? '#fafaf9'
                    : element.frameBackground,
                cornerRadius:
                  nextShape === 'rounded-rect' && !element.cornerRadius
                    ? 36
                    : element.cornerRadius,
                ...sizePatch,
              } as Partial<CanvasElement>);
            }}
            className="mt-0.5 w-full bg-[#0c0c0e] text-xs text-neutral-200 focus:outline-none"
          >
            {FRAME_MASK_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {element.frameShape &&
          element.frameShape !== 'none' &&
          element.frameShape !== 'circle' &&
          element.frameShape !== 'oval' && (
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Corner Radius</span>
                <span className="font-mono text-neutral-300">
                  {element.cornerRadius ?? 0} px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={120}
                step={2}
                disabled={element.locked}
                value={element.cornerRadius ?? 0}
                onChange={(e) =>
                  onUpdate(
                    { cornerRadius: Number(e.target.value) } as Partial<CanvasElement>,
                    { coalesce: true },
                  )
                }
                className="h-1.5 w-full accent-white"
              />
            </div>
          )}

        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-neutral-300">
            <span>Border</span>
            <input
              type="color"
              disabled={element.locked}
              value={element.frameStroke || '#ffffff'}
              onChange={(e) =>
                onUpdate(
                  {
                    frameStroke: e.target.value,
                    frameStrokeWidth: element.frameStrokeWidth || 4,
                  } as Partial<CanvasElement>,
                  { coalesce: true },
                )
              }
              className="h-4 w-4 cursor-pointer rounded border-0 bg-transparent p-0"
            />
          </label>
          <label className="rounded-xl border border-white/8 bg-white/[0.02] px-2.5 py-1">
            <span className="block text-[9px] text-neutral-500">
              Tebal Border
            </span>
            <input
              type="number"
              min={0}
              max={32}
              disabled={element.locked}
              value={element.frameStrokeWidth ?? 0}
              onChange={(e) =>
                onUpdate({
                  frameStrokeWidth: Number(e.target.value) || 0,
                } as Partial<CanvasElement>)
              }
              className="w-full bg-transparent text-xs text-neutral-200 focus:outline-none"
            />
          </label>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="flex flex-1 items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-neutral-300">
            <span>Bg Frame</span>
            <input
              type="color"
              disabled={element.locked}
              value={
                element.frameBackground &&
                element.frameBackground !== 'transparent'
                  ? element.frameBackground
                  : '#fafaf9'
              }
              onChange={(e) =>
                onUpdate(
                  { frameBackground: e.target.value } as Partial<CanvasElement>,
                  { coalesce: true },
                )
              }
              className="h-4 w-4 cursor-pointer rounded border-0 bg-transparent p-0"
            />
          </label>
          <button
            type="button"
            onClick={() =>
              onUpdate({
                frameBackground: 'transparent',
              } as Partial<CanvasElement>)
            }
            className="rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-neutral-400 hover:text-white"
          >
            Kosong
          </button>
        </div>
      </div>

      {element.photoId && (
        <div className="border-t border-white/8 pt-3">
          <PhotoFiltersPanel
            element={element}
            onUpdate={(u, opts) =>
              onUpdate(u as Partial<CanvasElement>, opts)
            }
          />
        </div>
      )}
    </>
  );
}
