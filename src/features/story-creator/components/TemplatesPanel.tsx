import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { STORY_TEMPLATES, TEMPLATE_CATEGORIES } from '@/constants/templates';
import { TemplatePreviewArt } from '@/features/dashboard/TemplatePreviewArt';
import type { StoryTemplate, TemplateCategory } from '@/types/studio';

interface TemplatesPanelProps {
  hasExistingContent: boolean;
  onApplyTemplate: (template: StoryTemplate) => void;
}

export function TemplatesPanel({ hasExistingContent, onApplyTemplate }: TemplatesPanelProps) {
  const [selectedCat, setSelectedCat] = useState<TemplateCategory | 'Semua'>('Semua');
  const [confirmTemplate, setConfirmTemplate] = useState<StoryTemplate | null>(null);

  const filtered = selectedCat === 'Semua'
    ? STORY_TEMPLATES
    : STORY_TEMPLATES.filter((t) => t.category === selectedCat);

  const handlePick = (tpl: StoryTemplate) => {
    if (hasExistingContent) {
      setConfirmTemplate(tpl);
    } else {
      onApplyTemplate(tpl);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
      <div className="flex flex-wrap gap-1.5">
        {(['Semua', ...TEMPLATE_CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
              selectedCat === cat
                ? 'bg-white text-neutral-950'
                : 'border border-white/10 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filtered.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => handlePick(tpl)}
            className="group text-left focus:outline-none"
          >
            <TemplatePreviewArt template={tpl} />
            <p className="mt-1.5 truncate text-[11px] font-medium text-neutral-200">
              {tpl.title}
            </p>
          </button>
        ))}
      </div>

      {confirmTemplate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-white/15 bg-[#111114] p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Terapkan Template?</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400">
              Menerapkan template <strong className="text-neutral-200">"{confirmTemplate.title}"</strong> akan
              mengganti komposisi kanvas saat ini. Foto yang sudah diunggah tidak akan dihapus.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmTemplate(null)}
                className="rounded-lg border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.08]">
                Batal
              </button>
              <button type="button"
                onClick={() => { onApplyTemplate(confirmTemplate); setConfirmTemplate(null); }}
                className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-neutral-200">
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
