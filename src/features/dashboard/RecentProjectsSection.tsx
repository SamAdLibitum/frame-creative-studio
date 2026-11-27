import {
  AlertTriangle,
  Clock,
  Copy,
  FolderOpen,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { StoredProject } from '@/types/studio';

interface RecentProjectsSectionProps {
  projects: StoredProject[];
  onCreateStory: () => void;
  onOpenProject: (project: StoredProject) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSec < 60) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} hari lalu`;
}

export function RecentProjectsSection({
  projects,
  onCreateStory,
  onOpenProject,
  onDuplicateProject,
  onDeleteProject,
}: RecentProjectsSectionProps) {
  const [confirmDelete, setConfirmDelete] = useState<StoredProject | null>(
    null,
  );

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Recent Projects
          </h2>
          <p className="mt-0.5 text-xs text-neutral-400 sm:text-sm">
            Proyek tersimpan otomatis secara lokal di browser Anda.
          </p>
        </div>

        {projects.length > 0 && (
          <button
            type="button"
            onClick={onCreateStory}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-white/25 hover:bg-white/[0.08]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Proyek Baru</span>
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-neutral-300">
            <FolderOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-white">
            Belum ada proyek tersimpan
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
          {projects.map((project) => (
            <article
              key={project.id}
              className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-[#111114] p-3.5 transition-all duration-200 hover:border-white/20 hover:bg-[#151519]"
            >
              <button
                type="button"
                onClick={() => onOpenProject(project)}
                className="relative flex h-24 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10"
                style={{
                  backgroundColor:
                    project.document.backgroundColor === 'transparent'
                      ? '#18181b'
                      : project.document.backgroundColor,
                }}
              >
                {project.thumbnailDataUrl ? (
                  <img
                    src={project.thumbnailDataUrl}
                    alt={project.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Layers className="h-4 w-4 text-neutral-500" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onOpenProject(project)}
                  className="block w-full text-left focus:outline-none"
                >
                  {project.templateCategory && (
                    <span className="inline-block rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-neutral-300">
                      {project.templateCategory}
                    </span>
                  )}
                  <h3 className="mt-1 truncate text-sm font-semibold text-white group-hover:text-neutral-100">
                    {project.name}
                  </h3>
                </button>
                <div className="mt-2 flex items-center justify-between gap-2 text-xs text-neutral-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {formatRelativeTime(project.updatedAt)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onDuplicateProject(project.id)}
                      title="Duplikat proyek"
                      className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-white/[0.08] hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(project)}
                      title="Hapus proyek"
                      className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-red-500/15 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-white/15 bg-[#111114] p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
              <h3 className="text-sm font-semibold text-white">
                Hapus Proyek?
              </h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400">
              Proyek{' '}
              <strong className="text-neutral-200">
                "{confirmDelete.name}"
              </strong>{' '}
              beserta foto di dalamnya akan dihapus permanen dari browser ini.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.08]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProject(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
