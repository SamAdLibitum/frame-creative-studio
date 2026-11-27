import type { StoryTemplate } from '@/types/studio';

interface TemplatePreviewArtProps {
  template: StoryTemplate;
}

export function TemplatePreviewArt({ template }: TemplatePreviewArtProps) {
  const { category, accentColor, surfaceColor } = template;

  return (
    <div
      className="relative flex aspect-[9/16] w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 p-4 transition-transform duration-300 group-hover:scale-[1.02]"
      style={{ backgroundColor: surfaceColor }}
    >
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between">
        <span className="text-[10px] font-medium tracking-[0.16em] text-white/50 uppercase">
          9:16
        </span>
        {template.badge && (
          <span className="rounded-full border border-white/15 bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-xs">
            {template.badge}
          </span>
        )}
      </div>

      {category === 'Minimalist' && (
        <div className="relative my-auto space-y-3">
          <div className="mx-auto aspect-[3/4] w-4/5 rounded-xl border border-white/15 bg-white/[0.06]" />
          <div className="mx-auto h-1.5 w-12 rounded-full bg-white/40" />
        </div>
      )}

      {category === 'Editorial' && (
        <div className="relative my-auto space-y-2.5">
          <div className="h-3 w-3/4 rounded-xs bg-white/80" />
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-[3/4] rounded-lg border border-white/15 bg-white/[0.08]" />
            <div className="aspect-[3/4] translate-y-3 rounded-lg border border-white/15 bg-white/[0.05]" />
          </div>
        </div>
      )}

      {category === 'Korean Aesthetic' && (
        <div className="relative my-auto flex flex-col items-center gap-2.5">
          <div className="h-24 w-24 rounded-full border border-white/20 bg-white/[0.07]" />
          <div className="h-12 w-4/5 rounded-2xl border border-white/10 bg-white/[0.04]" />
        </div>
      )}

      {category === 'Analog Film' && (
        <div className="relative my-auto space-y-2 rounded-lg border border-white/15 bg-black/50 p-2">
          <div className="aspect-[4/5] rounded-sm bg-white/[0.08]" />
          <div className="flex justify-between text-[9px] font-mono text-orange-300/80">
            <span>04A</span>
            <span>400TX</span>
          </div>
        </div>
      )}

      {category === 'Polaroid' && (
        <div className="relative my-auto mx-auto w-4/5 rotate-2 rounded-md bg-neutral-100 p-2 pb-6 shadow-xl">
          <div className="aspect-square w-full rounded-xs bg-neutral-800" />
        </div>
      )}

      {category === 'Scrapbook' && (
        <div className="relative my-auto grid grid-cols-2 gap-2">
          <div className="aspect-square -rotate-3 rounded-lg border border-white/15 bg-white/[0.08]" />
          <div className="aspect-square rotate-3 translate-y-2 rounded-lg border border-white/15 bg-white/[0.05]" />
          <div className="col-span-2 h-8 rotate-1 rounded-md border border-dashed border-white/20 bg-white/[0.03]" />
        </div>
      )}

      {category === 'Photo Dump' && (
        <div className="relative my-auto grid grid-cols-2 gap-1.5">
          <div className="aspect-square rounded-lg bg-white/[0.09]" />
          <div className="aspect-square rounded-lg bg-white/[0.05]" />
          <div className="aspect-square rounded-lg bg-white/[0.05]" />
          <div className="aspect-square rounded-lg bg-white/[0.09]" />
        </div>
      )}

      {category === 'Travel Diary' && (
        <div className="relative my-auto space-y-2">
          <div className="aspect-[16/10] rounded-xl border border-white/15 bg-white/[0.08]" />
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <div className="h-1.5 w-20 rounded-full bg-white/30" />
          </div>
        </div>
      )}

      {category === 'Lifestyle' && (
        <div className="relative my-auto space-y-2.5 text-center">
          <div className="mx-auto aspect-[4/5] w-4/5 rounded-2xl border border-purple-300/20 bg-white/[0.06]" />
          <div className="mx-auto h-2 w-16 rounded-full bg-purple-300/50" />
        </div>
      )}

      {category === 'Cinematic' && (
        <div className="relative my-auto space-y-2">
          <div className="h-3 w-full bg-black/80" />
          <div className="aspect-[16/9] w-full rounded-sm border border-white/15 bg-white/[0.08]" />
          <div className="mx-auto h-1.5 w-24 rounded-full bg-white/35" />
          <div className="h-3 w-full bg-black/80" />
        </div>
      )}

      {category === 'Typography Focus' && (
        <div className="relative my-auto space-y-1.5 px-1">
          <div
            className="h-4 w-4/5 rounded-xs"
            style={{ backgroundColor: accentColor }}
          />
          <div
            className="h-4 w-3/5 rounded-xs"
            style={{ backgroundColor: accentColor }}
          />
          <div
            className="h-4 w-full rounded-xs"
            style={{ backgroundColor: accentColor }}
          />
          <div className="pt-2">
            <div className="h-1 w-14 rounded-full bg-white/40" />
          </div>
        </div>
      )}

      {category === 'Collage' && (
        <div className="relative my-auto grid grid-cols-2 gap-2">
          <div className="aspect-[3/4] -rotate-2 rounded-lg border border-pink-400/35 bg-white/[0.07]" />
          <div className="aspect-[3/4] rotate-3 translate-y-2 rounded-lg border border-pink-400/35 bg-white/[0.05]" />
        </div>
      )}

      <div className="relative flex items-center justify-between pt-2">
        <div
          className="h-1 w-8 rounded-full opacity-70"
          style={{ backgroundColor: accentColor }}
        />
        <span className="text-[10px] text-white/50">
          {template.photoCount} foto
        </span>
      </div>
    </div>
  );
}
