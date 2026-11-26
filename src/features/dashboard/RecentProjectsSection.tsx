import { Clock, FolderOpen, Image, Plus } from 'lucide-react';
import type { StoryProject } from '@/types/studio';

interface RecentProjectsSectionProps {
  projects: StoryProject[];
  showEmptyDemo: boolean;
  onToggleEmptyDemo: () => void;
  onCreateStory: () => void;
}

export function RecentProjectsSection({
  projects,
  showEmptyDemo,
  onToggleEmptyDemo,
  onCreateStory,
}: RecentProjectsSectionProps) {
  const visibleProjects = showEmptyDemo ? [] : projects;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Recent Projects
          </h2>
          <p className="mt-0.5 text-xs text-neutral-400 sm:text-sm">
            Lanjutkan desain Story yang terakhir Anda kerjakan.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleEmptyDemo}
          className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:border-white/20 hover:text-neutral-200"
        >
          {showEmptyDemo ? 'Tampilkan Proyek Contoh' : 'Lihat Empty State'}
        </button>
      </div>

      {visibleProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-neutral-300">
            <FolderOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-white">
            Belum ada proyek Story
          </h3>
          <p className="mt-1.5 max-w-sm text-sm text-neutral-400">
            Mulai dari kanvas kosong 1080 × 1920 px atau pilih template di bawah
            untuk membuat Instagram Story pertama Anda.
          </p>
          <button
            type="button"
            onClick={onCreateStory}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-neutral-950 transition-all hover:bg-neutral-200 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Create Story</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <article
              key={project.id}
              className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-[#111114] p-3.5 transition-all duration-200 hover:border-white/20 hover:bg-[#151519]"
            >
              <div
                className="relative flex h-24 w-14 shrink-0 flex-col justify-between overflow-hidden rounded-xl border border-white/10 p-2"
                style={{ backgroundColor: project.surfaceColor }}
              >
                <div
                  className="h-1.5 w-6 rounded-full opacity-70"
                  style={{ backgroundColor: project.accentColor }}
                />
                <div className="h-10 rounded-md border border-white/10 bg-white/[0.05]" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-neutral-300">
                  {project.templateCategory}
                </span>
                <h3 className="mt-1.5 truncate text-sm font-semibold text-white group-hover:text-neutral-100">
                  {project.title}
                </h3>
                <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                  <span className="inline-flex items-center gap-1">
                    <Image className="h-3 w-3" aria-hidden="true" />
                    {project.photoCount} foto
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {project.updatedAt}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
