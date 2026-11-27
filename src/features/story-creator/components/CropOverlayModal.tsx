import { Check, Crop, Move, RotateCcw, X, ZoomIn } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  computeCoverImageDraw,
  getPhotoWindowRect,
} from '@/features/story-creator/utils/frameMaskPaths';
import type {
  CanvasPhotoElement,
  PhotoCropParams,
  UploadedPhoto,
} from '@/types/studio';

interface CropOverlayModalProps {
  element: CanvasPhotoElement;
  photo: UploadedPhoto;
  onApply: (updated: Partial<CanvasPhotoElement>) => void;
  onCancel: () => void;
}

const ASPECT_PRESETS: Array<{ label: string; ratio: number | null }> = [
  { label: 'Bebas', ratio: null },
  { label: '1:1', ratio: 1 },
  { label: '4:5', ratio: 4 / 5 },
  { label: '3:4', ratio: 3 / 4 },
  { label: '9:16', ratio: 9 / 16 },
  { label: '16:9', ratio: 16 / 9 },
];

export function CropOverlayModal({
  element,
  photo,
  onApply,
  onCancel,
}: CropOverlayModalProps) {
  const [cropWidth, setCropWidth] = useState(element.width);
  const [cropHeight, setCropHeight] = useState(element.height);
  const [crop, setCrop] = useState<PhotoCropParams>(
    element.crop ?? { zoom: 1, offsetX: 0, offsetY: 0 },
  );

  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  // Scale preview box to fit nicely inside 320x380 viewport
  const previewMaxW = 300;
  const previewMaxH = 360;
  const previewScale = Math.min(
    previewMaxW / Math.max(1, cropWidth),
    previewMaxH / Math.max(1, cropHeight),
  );
  const boxW = Math.round(cropWidth * previewScale);
  const boxH = Math.round(cropHeight * previewScale);

  const winRect = getPhotoWindowRect(element.frameShape, boxW, boxH);
  const drawRect = computeCoverImageDraw(
    winRect,
    photo.naturalWidth,
    photo.naturalHeight,
    crop,
  );

  const maxPanX = Math.max(1, (drawRect.width - winRect.width) / 2);
  const maxPanY = Math.max(1, (drawRect.height - winRect.height) / 2);

  const handleApplyAspect = (ratio: number | null) => {
    if (!ratio) return;
    const area = cropWidth * cropHeight;
    const nextW = Math.max(80, Math.min(1040, Math.round(Math.sqrt(area * ratio))));
    const nextH = Math.max(80, Math.min(1860, Math.round(nextW / ratio)));
    setCropWidth(nextW);
    setCropHeight(nextH);
  };

  const handleReset = () => {
    setCrop({ zoom: 1, offsetX: 0, offsetY: 0 });
    const fitScale = Math.min(
      840 / Math.max(1, photo.naturalWidth),
      1240 / Math.max(1, photo.naturalHeight),
      1,
    );
    if (element.layoutSlotIndex === undefined && (!element.frameShape || element.frameShape === 'none')) {
      setCropWidth(Math.round(photo.naturalWidth * fitScale));
      setCropHeight(Math.round(photo.naturalHeight * fitScale));
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#111115] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Crop className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">
              Crop & Posisi Foto
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-neutral-400 hover:bg-white/8 hover:text-white"
            aria-label="Batal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto p-5 md:grid-cols-2">
          {/* Interactive Crop Viewport */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-[#070709] p-6">
            <div
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                dragStartRef.current = {
                  clientX: e.clientX,
                  clientY: e.clientY,
                  startOffsetX: crop.offsetX,
                  startOffsetY: crop.offsetY,
                };
              }}
              onPointerMove={(e) => {
                const start = dragStartRef.current;
                if (!start) return;
                const dx = e.clientX - start.clientX;
                const dy = e.clientY - start.clientY;
                setCrop((prev) => ({
                  ...prev,
                  offsetX: Math.max(
                    -1,
                    Math.min(1, start.startOffsetX + dx / maxPanX),
                  ),
                  offsetY: Math.max(
                    -1,
                    Math.min(1, start.startOffsetY + dy / maxPanY),
                  ),
                }));
              }}
              onPointerUp={() => {
                dragStartRef.current = null;
              }}
              className="relative cursor-move select-none"
              style={{ width: boxW, height: boxH }}
            >
              {/* Dimmed Full Photo Ghost Outside Crop Boundary */}
              <img
                src={photo.objectUrl}
                alt=""
                draggable={false}
                className="pointer-events-none absolute max-w-none opacity-25"
                style={{
                  left: drawRect.x,
                  top: drawRect.y,
                  width: drawRect.width,
                  height: drawRect.height,
                }}
              />

              {/* Active Bright Crop Boundary */}
              <div
                className="relative overflow-hidden border-2 border-sky-400 shadow-lg"
                style={{
                  left: winRect.x,
                  top: winRect.y,
                  width: winRect.width,
                  height: winRect.height,
                  borderRadius:
                    element.frameShape === 'circle'
                      ? '9999px'
                      : element.frameShape === 'oval'
                        ? '50%'
                        : element.frameShape === 'arch'
                          ? '9999px 9999px 12px 12px'
                          : element.cornerRadius
                            ? `${Math.round(element.cornerRadius * previewScale)}px`
                            : '2px',
                }}
              >
                <img
                  src={photo.objectUrl}
                  alt={photo.name}
                  draggable={false}
                  className="pointer-events-none absolute max-w-none"
                  style={{
                    left: drawRect.x - winRect.x,
                    top: drawRect.y - winRect.y,
                    width: drawRect.width,
                    height: drawRect.height,
                  }}
                />
                {/* Rule-of-thirds grid overlay */}
                <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <div key={idx} className="border border-white/15" />
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-neutral-400">
              <Move className="h-3.5 w-3.5 text-sky-400" />
              <span>Geser foto langsung untuk mengatur posisi di dalam crop</span>
            </p>
          </div>

          {/* Crop Controls */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Zoom */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-300">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <ZoomIn className="h-3.5 w-3.5 text-neutral-400" />
                    Zoom Foto
                  </span>
                  <span className="font-mono text-[11px] text-neutral-400">
                    {Math.round(crop.zoom * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.02}
                  value={crop.zoom}
                  onChange={(e) =>
                    setCrop((prev) => ({
                      ...prev,
                      zoom: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-sky-400"
                />
              </div>

              {/* Horizontal & Vertical Pan */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>Horizontal</span>
                    <span>{Math.round(crop.offsetX * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.02}
                    value={crop.offsetX}
                    onChange={(e) =>
                      setCrop((prev) => ({
                        ...prev,
                        offsetX: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-white"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>Vertikal</span>
                    <span>{Math.round(crop.offsetY * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.02}
                    value={crop.offsetY}
                    onChange={(e) =>
                      setCrop((prev) => ({
                        ...prev,
                        offsetY: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-white"
                  />
                </div>
              </div>

              {/* Crop Boundary Dimensions & Ratio (disabled only for circle or locked layout slots) */}
              {element.layoutSlotIndex === undefined &&
                element.frameShape !== 'circle' && (
                  <div className="space-y-2.5 border-t border-white/8 pt-3">
                    <p className="text-xs font-medium text-neutral-300">
                      Area & Rasio Crop
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {ASPECT_PRESETS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => handleApplyAspect(p.ratio)}
                          className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:border-white/25 hover:text-white"
                        >
                          {p.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          handleApplyAspect(
                            photo.naturalWidth /
                              Math.max(1, photo.naturalHeight),
                          )
                        }
                        className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:border-white/25 hover:text-white"
                      >
                        Rasio Asli
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
                        <span className="block text-[10px] text-neutral-500">
                          Lebar Area (px)
                        </span>
                        <input
                          type="number"
                          min={60}
                          max={1080}
                          value={cropWidth}
                          onChange={(e) =>
                            setCropWidth(
                              Math.max(60, Number(e.target.value) || 60),
                            )
                          }
                          className="mt-0.5 w-full bg-transparent text-xs font-medium text-neutral-200 focus:outline-none"
                        />
                      </label>
                      <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
                        <span className="block text-[10px] text-neutral-500">
                          Tinggi Area (px)
                        </span>
                        <input
                          type="number"
                          min={60}
                          max={1920}
                          value={cropHeight}
                          onChange={(e) =>
                            setCropHeight(
                              Math.max(60, Number(e.target.value) || 60),
                            )
                          }
                          className="mt-0.5 w-full bg-transparent text-xs font-medium text-neutral-200 focus:outline-none"
                        />
                      </label>
                    </div>
                  </div>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Crop</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.08]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const dx = Math.round((element.width - cropWidth) / 2);
                    const dy = Math.round((element.height - cropHeight) / 2);
                    onApply({
                      x: element.x + dx,
                      y: element.y + dy,
                      width: cropWidth,
                      height: cropHeight,
                      crop,
                      keepAspectRatio: false,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-neutral-200"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Terapkan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
