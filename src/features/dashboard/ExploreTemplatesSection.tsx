import { useState } from 'react';
import { TemplatePreviewArt } from '@/features/dashboard/TemplatePreviewArt';
import type { StoryTemplate, TemplateCategory } from '@/types/studio';

interface ExploreTemplatesSectionProps {
  templates: StoryTemplate[];
  categories: TemplateCategory[];
  onSelectTemplate: (template: StoryTemplate) => void;
}

export function ExploreTemplatesSection({
  templates,
  categories,
  onSelectTemplate,
}: ExploreTemplatesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    TemplateCategory | 'Semua'
  >('Semua');

  const filteredTemplates =
    selectedCategory === 'Semua'
      ? templates
      : templates.filter((tpl) => tpl.category === selectedCategory);

  return (
    <section id="explore-templates" className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
          Explore Templates
        </h2>
        <p className="mt-0.5 text-xs text-neutral-400 sm:text-sm">
          Pilih gaya visual Story 9:16 yang sesuai dengan suasana foto Anda.
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['Semua', ...categories] as const).map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white text-neutral-950'
                  : 'border border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:text-neutral-200'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelectTemplate(template)}
            className="group text-left focus:outline-none"
          >
            <TemplatePreviewArt template={template} />
            <div className="mt-2.5 px-0.5">
              <p className="truncate text-sm font-medium text-white group-hover:text-neutral-200">
                {template.title}
              </p>
              <p className="text-xs text-neutral-500">{template.category}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
