import {
  AlertTriangle,
  Check,
  Crop,
  RotateCcw,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { BackgroundControls } from '@/features/story-creator/components/BackgroundControls';
import {
  getPhotoOrientation,
  matchPhotosToLayoutSlots,
  SMART_LAYOUTS,
  type SmartLayoutCategory,
  type SmartLayoutDefinition,
  scoreLayoutForPhotos,
} from '@/features/story-creator/utils/smartLayoutEngine';
import type {
  AppliedSmartLayoutState,
  UploadedPhoto,
} from '@/types/studio';

interface SmartLayoutPanelProps {
  photos: UploadedPhoto[];
  appliedLayout?: AppliedSmartLayoutState;
  backgroundColor: string;
  hasManualPhotoContent: boolean;
  onApplyLayout: (
    config: AppliedSmartLayoutState,
    mode: 'preserve-decor' | 'replace-all',
  ) => void;
  onUpdateLayoutParams: (
    patch: Partial<AppliedSmartLayoutState>,
    options?: { coalesce?: boolean },
  ) => void;
  onResetLayoutDefaults: () => void;
  onChangeBackground: (color: string) => void;
  onEditSlotCrop: (slotIndex: number) => void;
  onGoToUploads: () => void;
}

const CATEGORIES: Array<SmartLayoutCategory | 'Semua'> = [
  'Semua',
  'Minimal',
  'Grid',
  'Editorial',
  'Collage',
];

export function SmartLayoutPanel({
  photos,
  appliedLayout,
  backgroundColor,
  hasManualPhotoContent,
  onApplyLayout,
  onUpdateLayoutParams,
  onResetLayoutDefaults,
  onChangeBackground,
  onEditSlotCrop,
  onGoToUploads,
}: SmartLayoutPanelProps) {
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>(() =>
    photos.slice(0, 3).map((p) => p.id),
  );
  const [filterCount, setFilterCount] = useState<number | 'auto'>('auto');
  const [filterCategory, setFilterCategory] = useState<
    SmartLayoutCategory | 'Semua'
  >('Semua');
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>(
    appliedLayout?.layoutId ?? 'three-editorial',
  );
  const [pendingApply, setPendingApply] =
    useState<AppliedSmartLayoutState | null>(null);

  // Keep valid photo selection synced with available uploads
  const activeSelectedIds = useMemo(() => {
    const valid = selectedPhotoIds.filter((id) =>
      photos.some((p) => p.id === id),
    );
    if (valid.length > 0) return valid.slice(0, 6);
    return photos.slice(0, 3).map((p) => p.id);
  }, [selectedPhotoIds, photos]);

  const selectedPhotos = useMemo(
    () =>
      activeSelectedIds
        .map((id) => photos.find((p) => p.id === id))
        .filter((p): p is UploadedPhoto => Boolean(p)),
    [activeSelectedIds, photos],
  );

  const targetCount =
    filterCount === 'auto'
      ? Math.max(1, Math.min(6, selectedPhotos.length || 3))
      : filterCount;

  const layoutsWithScore = useMemo(() => {
    const candidates = SMART_LAYOUTS.filter((l) => {
      const matchCount = l.photoCount === targetCount;
      const matchCat =
        filterCategory === 'Semua' || l.category === filterCategory;
      return matchCount && matchCat;
    });

    const scored = candidates.map((layout) => ({
      layout,
      score: scoreLayoutForPhotos(layout, selectedPhotos),
    }));

    const maxScore = Math.max(...scored.map((s) => s.score), 0);
    return scored.map((item) => ({
      ...item,
      isRecommended:
        selectedPhotos.length === item.layout.photoCount &&
        maxScore > 0 &&
        item.score >= maxScore - 2,
    }));
  }, [targetCount, filterCategory, selectedPhotos]);

  const togglePhotoSelection = (id: string) => {
    setSelectedPhotoIds((prev) => {
      const current =
        prev.length > 0 ? prev : photos.slice(0, 3).map((p) => p.id);
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= 6) return [...current.slice(1), id];
      return [...current, id];
    });
  };

  const buildConfigForLayout = (
    layout: SmartLayoutDefinition,
  ): AppliedSmartLayoutState => {
    const pool =
      selectedPhotos.length >= layout.photoCount
        ? selectedPhotos.slice(0, layout.photoCount)
        : [
            ...selectedPhotos,
            ...photos.filter((p) => !activeSelectedIds.includes(p.id)),
          ].slice(0, layout.photoCount);

    const orderedIds = matchPhotosToLayoutSlots(layout, pool);
    while (orderedIds.length < layout.photoCount) {
      orderedIds.push('');
    }

    return {
      layoutId: layout.id,
      photoIds: orderedIds,
      spacing: layout.defaultSpacing,
      margin: layout.defaultMargin,
      cornerRadius: layout.defaultCornerRadius,
    };
  };

  const triggerApply = (layout: SmartLayoutDefinition) => {
    setSelectedLayoutId(layout.id);
    const config = buildConfigForLayout(layout);
    if (hasManualPhotoContent && !appliedLayout) {
      setPendingApply(config);
    } else {
      onApplyLayout(config, 'preserve-decor');
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-0.5">
      {/* 1. Photo Selection (1–6 photos) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-neutral-200">
            1. Pilih Foto ({activeSelectedIds.length}/6)
          </p>
          {photos.length === 0 && (
            <button
              type="button"
              onClick={onGoToUploads}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-400 hover:underline"
            >
              <Upload className="h-3 w-3" />
              Unggah
            </button>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.02] p-3 text-center">
            <p className="text-[11px] text-neutral-400">
              Unggah 1–6 foto untuk rekomendasi rasio otomatis, atau terapkan
              kerangka layout kosong terlebih dahulu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {photos.map((photo) => {
              const orderIdx = activeSelectedIds.indexOf(photo.id);
              const isSelected = orderIdx !== -1;
              const orient = getPhotoOrientation(photo);
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => togglePhotoSelection(photo.id)}
                  className={`group relative aspect-square overflow-hidden rounded-lg border transition-all ${
                    isSelected
                      ? 'border-sky-400 ring-1 ring-sky-400/50'
                      : 'border-white/10 opacity-65 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo.objectUrl}
                    alt={photo.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 py-0.5 text-[8px] font-medium text-neutral-200 uppercase">
                    {orient === 'portrait'
                      ? 'P'
                      : orient === 'landscape'
                        ? 'L'
                        : '1:1'}
                  </span>
                  {isSelected && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-400 text-[9px] font-bold text-neutral-950">
                      {orderIdx + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Layout Count & Category Filters */}
      <div className="space-y-2 border-t border-white/8 pt-3">
        <p className="text-[11px] font-semibold text-neutral-200">
          2. Galeri Smart Layout
        </p>

        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setFilterCount('auto')}
            className={`rounded-md px-2 py-1 text-[10px] font-medium ${
              filterCount === 'auto'
                ? 'bg-white text-neutral-950'
                : 'border border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            Otomatis ({Math.max(1, selectedPhotos.length || 3)})
          </button>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setFilterCount(n)}
              className={`rounded-md px-2 py-1 text-[10px] font-medium ${
                filterCount === n
                  ? 'bg-white text-neutral-950'
                  : 'border border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                filterCategory === cat
                  ? 'bg-white/15 text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Visual Layout Gallery */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {layoutsWithScore.map(({ layout, isRecommended }) => {
            const slots = layout.computeSlots(0.05, 0.035);
            const isSelected =
              (appliedLayout?.layoutId ?? selectedLayoutId) === layout.id;

            return (
              <div
                key={layout.id}
                className={`flex flex-col rounded-xl border p-2 transition-all ${
                  isSelected
                    ? 'border-sky-400 bg-sky-400/[0.07]'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                }`}
              >
                <button
                  type="button"
                  onClick={() => triggerApply(layout)}
                  className="text-left focus:outline-none"
                >
                  {/* Lightweight SVG 9:16 Geometry Visualization */}
                  <div className="relative mx-auto aspect-[9/16] w-full overflow-hidden rounded-lg border border-white/10 bg-[#09090b]">
                    {isRecommended && (
                      <span className="absolute top-1 right-1 z-10 inline-flex items-center gap-0.5 rounded-full bg-amber-400/90 px-1.5 py-0.5 text-[8px] font-bold text-neutral-950">
                        <Sparkles className="h-2 w-2" />
                        Cocok
                      </span>
                    )}
                    <svg
                      viewBox="0 0 90 160"
                      className="h-full w-full"
                      aria-hidden="true"
                    >
                      {slots.map((s, idx) => {
                        const padX = layout.fullBleed ? 2 : 7;
                        const padTop = layout.fullBleed ? 2 : 18;
                        const padBot = layout.fullBleed ? 2 : 18;
                        const availW = 90 - padX * 2;
                        const availH = 160 - padTop - padBot;
                        return (
                          <rect
                            key={idx}
                            x={padX + s.nx * availW}
                            y={padTop + s.ny * availH}
                            width={Math.max(4, s.nw * availW)}
                            height={Math.max(4, s.nh * availH)}
                            rx={layout.defaultCornerRadius > 0 ? 3 : 0.5}
                            fill={
                              isSelected
                                ? 'rgba(56, 189, 248, 0.32)'
                                : 'rgba(255, 255, 255, 0.14)'
                            }
                            stroke={
                              isSelected
                                ? 'rgba(56, 189, 248, 0.85)'
                                : 'rgba(255, 255, 255, 0.35)'
                            }
                            strokeWidth="1"
                          />
                        );
                      })}
                    </svg>
                  </div>

                  <p className="mt-1.5 line-clamp-1 text-[10px] font-semibold text-neutral-200">
                    {layout.name}
                  </p>
                  <div className="mt-0.5 flex items-center justify-between text-[9px] text-neutral-500">
                    <span>{layout.category}</span>
                    <span>{layout.photoCount} foto</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => triggerApply(layout)}
                  className={`mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-1 text-[10px] font-semibold transition-colors ${
                    isSelected
                      ? 'bg-sky-400 text-neutral-950 hover:bg-sky-300'
                      : 'bg-white/10 text-neutral-200 hover:bg-white/20'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  <span>Apply</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Active Smart Layout Live Controls */}
      {appliedLayout && (
        <div className="space-y-3 border-t border-white/10 pt-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-white">
              3. Pengaturan Layout Aktif
            </p>
            <button
              type="button"
              onClick={onResetLayoutDefaults}
              title="Kembalikan pengaturan layout ke default"
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-neutral-300 hover:text-white"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Reset
            </button>
          </div>

          <div className="space-y-2">
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Spacing Antar Foto</span>
                <span className="font-mono text-neutral-300">
                  {appliedLayout.spacing} px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={64}
                step={2}
                value={appliedLayout.spacing}
                onChange={(e) =>
                  onUpdateLayoutParams(
                    { spacing: Number(e.target.value) },
                    { coalesce: true },
                  )
                }
                className="h-1.5 w-full accent-sky-400"
              />
            </div>

            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Margin Tepi</span>
                <span className="font-mono text-neutral-300">
                  {appliedLayout.margin} px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={140}
                step={4}
                value={appliedLayout.margin}
                onChange={(e) =>
                  onUpdateLayoutParams(
                    { margin: Number(e.target.value) },
                    { coalesce: true },
                  )
                }
                className="h-1.5 w-full accent-sky-400"
              />
            </div>

            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Corner Radius</span>
                <span className="font-mono text-neutral-300">
                  {appliedLayout.cornerRadius} px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={64}
                step={2}
                value={appliedLayout.cornerRadius}
                onChange={(e) =>
                  onUpdateLayoutParams(
                    { cornerRadius: Number(e.target.value) },
                    { coalesce: true },
                  )
                }
                className="h-1.5 w-full accent-sky-400"
              />
            </div>
          </div>

          {/* Slot Photo Replacement & Crop */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-neutral-400">
              Slot Foto
            </p>
            {appliedLayout.photoIds.map((pid, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/[0.02] px-2 py-1.5"
              >
                <span className="w-10 shrink-0 text-[10px] font-medium text-neutral-400">
                  Slot {idx + 1}
                </span>
                <select
                  value={pid}
                  onChange={(e) => {
                    const nextIds = [...appliedLayout.photoIds];
                    nextIds[idx] = e.target.value;
                    onUpdateLayoutParams({ photoIds: nextIds });
                  }}
                  className="min-w-0 flex-1 truncate bg-[#0f0f12] text-[10px] text-neutral-200 focus:outline-none"
                >
                  <option value="">(Kosong)</option>
                  {photos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {pid && (
                  <button
                    type="button"
                    onClick={() => onEditSlotCrop(idx)}
                    title="Atur posisi/crop foto di slot ini"
                    className="rounded border border-white/10 p-1 text-neutral-300 hover:bg-white/10 hover:text-white"
                  >
                    <Crop className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] font-medium text-neutral-400">
              Warna Background Layout
            </p>
            <BackgroundControls
              backgroundColor={backgroundColor}
              onChangeBackground={onChangeBackground}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal if replacing existing manual photos */}
      {pendingApply && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#111114] p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">
                Terapkan Smart Layout?
              </h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400">
              Kanvas saat ini sudah memiliki foto. Anda dapat menerapkan layout
              foto sambil mempertahankan teks & elemen dekorasi, atau mengganti
              seluruh isi kanvas.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onApplyLayout(pendingApply, 'preserve-decor');
                  setPendingApply(null);
                }}
                className="w-full rounded-xl bg-white py-2 text-xs font-semibold text-neutral-950 hover:bg-neutral-200"
              >
                Pertahankan Teks & Dekorasi
              </button>
              <button
                type="button"
                onClick={() => {
                  onApplyLayout(pendingApply, 'replace-all');
                  setPendingApply(null);
                }}
                className="w-full rounded-xl border border-white/12 bg-white/[0.05] py-2 text-xs font-medium text-neutral-200 hover:bg-white/[0.1]"
              >
                Ganti Seluruh Kanvas
              </button>
              <button
                type="button"
                onClick={() => setPendingApply(null)}
                className="w-full py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
