import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Grid2x2,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { CarouselTemplateId } from '@/engines/carousel/carouselEngine';
import { useStoryEditor } from '@/features/story-creator/context/StoryEditorContext';

const CAROUSEL_TEMPLATES: Array<{ id: CarouselTemplateId; label: string }> = [
  { id: 'minimal-editorial', label: 'Minimal Editorial' },
  { id: 'educational', label: 'Educational' },
  { id: 'photo-storytelling', label: 'Photo Story' },
  { id: 'promotional-showcase', label: 'Showcase' },
];

export function CarouselSlideBar() {
  const {
    state,
    selectCarouselSlide,
    addCarouselSlide,
    duplicateCarouselSlideById,
    deleteCarouselSlideById,
    reorderCarouselSlide,
    applyCarouselTemplate,
    isCarouselOverviewOpen,
    setIsCarouselOverviewOpen,
  } = useStoryEditor();

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const slides = state.slides ?? [];
  const activeIdx = slides.findIndex((s) => s.id === state.activeSlideId);

  if (slides.length === 0) return null;

  return (
    <>
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-t border-white/8 bg-[#0e0e11] px-3 py-2">
        <div className="flex shrink-0 items-center gap-1 border-r border-white/10 pr-2">
          <button
            type="button"
            disabled={activeIdx <= 0}
            onClick={() => {
              if (activeIdx > 0) selectCarouselSlide(slides[activeIdx - 1].id);
            }}
            className="rounded-md p-1 text-neutral-400 hover:bg-white/8 hover:text-white disabled:opacity-30"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px] font-medium text-neutral-300">
            {activeIdx + 1}/{slides.length}
          </span>
          <button
            type="button"
            disabled={activeIdx >= slides.length - 1}
            onClick={() => {
              if (activeIdx < slides.length - 1) {
                selectCarouselSlide(slides[activeIdx + 1].id);
              }
            }}
            className="rounded-md p-1 text-neutral-400 hover:bg-white/8 hover:text-white disabled:opacity-30"
            aria-label="Slide berikutnya"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsCarouselOverviewOpen(true)}
            title="Overview seluruh slide"
            className="ml-1 inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-neutral-200 hover:bg-white/[0.09]"
          >
            <Grid2x2 className="h-3 w-3" />
            <span>Overview</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {slides.map((slide, idx) => {
            const isActive = slide.id === state.activeSlideId;
            return (
              <div
                key={slide.id}
                draggable
                onDragStart={() => setDragIdx(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIdx !== null && dragIdx !== idx) {
                    reorderCarouselSlide(dragIdx, idx);
                  }
                  setDragIdx(null);
                }}
                className={`group flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] transition-colors ${
                  isActive
                    ? 'border-sky-400 bg-sky-400/15 text-white'
                    : 'border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/25 hover:text-neutral-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => selectCarouselSlide(slide.id)}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className="h-4 w-3 rounded-xs border border-white/20"
                    style={{ backgroundColor: slide.backgroundColor }}
                  />
                  <span className="max-w-[80px] truncate font-medium">
                    {idx + 1}. {slide.name}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => duplicateCarouselSlideById(slide.id)}
                  title="Duplikat slide"
                  className="rounded p-0.5 text-neutral-400 hover:text-white"
                >
                  <Copy className="h-2.5 w-2.5" />
                </button>
                {slides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteCarouselSlideById(slide.id)}
                    title="Hapus slide"
                    className="rounded p-0.5 text-neutral-400 hover:text-red-400"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addCarouselSlide}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-dashed border-white/20 px-2.5 py-1 text-[10px] font-medium text-neutral-300 hover:border-white/40 hover:text-white"
          >
            <Plus className="h-3 w-3" />
            <span>Slide</span>
          </button>
        </div>

        <div className="ml-auto hidden shrink-0 items-center gap-1 border-l border-white/10 pl-2 xl:flex">
          <span className="text-[10px] text-neutral-500">Starter:</span>
          {CAROUSEL_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyCarouselTemplate(t.id)}
              className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-neutral-300 hover:bg-white/[0.08]"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Carousel Overview Modal */}
      {isCarouselOverviewOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#111114]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <h3 className="text-sm font-semibold text-white">
                Carousel Overview ({slides.length} Slide)
              </h3>
              <button
                type="button"
                onClick={() => setIsCarouselOverviewOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 overflow-y-auto p-5 sm:grid-cols-3 md:grid-cols-4">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => {
                    selectCarouselSlide(slide.id);
                    setIsCarouselOverviewOpen(false);
                  }}
                  className={`flex flex-col rounded-xl border p-2.5 text-left transition-all ${
                    slide.id === state.activeSlideId
                      ? 'border-sky-400 bg-sky-400/10'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                  }`}
                >
                  <div
                    className="flex aspect-[4/5] w-full flex-col items-center justify-center rounded-lg border border-white/10 p-3 text-center"
                    style={{ backgroundColor: slide.backgroundColor }}
                  >
                    <span className="text-lg font-semibold text-white/80">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="mt-1 text-[10px] text-neutral-400">
                      {slide.elements.length} objek
                    </span>
                  </div>
                  <p className="mt-2 truncate text-xs font-medium text-neutral-200">
                    {slide.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
