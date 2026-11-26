import { ArrowRight, ImagePlus, Layers, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onCreateStory: () => void;
  onExploreTemplates: () => void;
}

export function HeroSection({
  onCreateStory,
  onExploreTemplates,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#141418] via-[#0e0e12] to-[#09090b] p-6 sm:p-8 lg:p-10">
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/[0.04] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-neutral-300">
            <Sparkles className="h-3.5 w-3.5 text-neutral-200" aria-hidden="true" />
            <span>Instagram Story Creative Studio</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
            Ubah foto pribadi menjadi{' '}
            <span className="text-neutral-400">Instagram Story</span> yang
            berkarakter.
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base">
            Rancang komposisi satu foto maupun multi-foto dengan proporsi kanvas
            presisi <span className="text-neutral-200">1080 × 1920 px (9:16)</span>
            . Pilih estetika kurasi dan mulai berkreasi tanpa ribet.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onCreateStory}
              className="inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 shadow-lg shadow-white/5 transition-all duration-150 hover:bg-neutral-200 active:scale-[0.98]"
            >
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
              <span>Create Story</span>
            </button>

            <button
              type="button"
              onClick={onExploreTemplates}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-medium text-neutral-200 transition-colors hover:border-white/25 hover:bg-white/[0.07]"
            >
              <span>Jelajahi Template</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="hidden shrink-0 lg:flex lg:items-center lg:gap-4">
          <div className="relative h-56 w-32 -rotate-3 rounded-2xl border border-white/12 bg-[#16161b] p-2.5 shadow-2xl">
            <div className="h-full w-full rounded-xl bg-gradient-to-b from-neutral-800/80 to-neutral-900/90 p-3 flex flex-col justify-between">
              <div className="h-2 w-10 rounded-full bg-white/20" />
              <div className="space-y-1.5">
                <div className="h-1.5 w-16 rounded-full bg-white/30" />
                <div className="h-1.5 w-12 rounded-full bg-white/15" />
              </div>
            </div>
          </div>
          <div className="relative h-64 w-36 rotate-3 rounded-2xl border border-white/15 bg-[#1b1b21] p-3 shadow-2xl">
            <div className="flex h-full w-full flex-col justify-between rounded-xl border border-white/10 bg-gradient-to-br from-neutral-700/40 via-neutral-900 to-black p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium tracking-wider text-neutral-300">
                  9:16
                </span>
                <Layers className="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-white/[0.06] border border-white/8" />
                <div className="h-2 w-20 rounded-full bg-white/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
