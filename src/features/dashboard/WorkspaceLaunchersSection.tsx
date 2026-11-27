import {
  Camera,
  Columns3,
  FileImage,
  Grid2x2,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';
import { WORKSPACE_DEFINITIONS } from '@/constants/workspaces';
import type { WorkspaceMode } from '@/types/studio';

interface WorkspaceLaunchersSectionProps {
  onLaunchWorkspace: (mode: WorkspaceMode) => void;
}

const ICONS: Record<WorkspaceMode, typeof Sparkles> = {
  story: Sparkles,
  photo: Camera,
  poster: FileImage,
  collage: LayoutGrid,
  moodboard: Grid2x2,
  carousel: Columns3,
};

export function WorkspaceLaunchersSection({
  onLaunchWorkspace,
}: WorkspaceLaunchersSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
          Creative Workspaces
        </h2>
        <p className="mt-0.5 text-xs text-neutral-400 sm:text-sm">
          Satu studio terpadu dengan enam ruang kerja khusus untuk setiap format
          karya.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {WORKSPACE_DEFINITIONS.map((ws) => {
          const Icon = ICONS[ws.id];
          return (
            <button
              key={ws.id}
              type="button"
              onClick={() => onLaunchWorkspace(ws.id)}
              className="group flex flex-col justify-between rounded-2xl border border-white/8 bg-[#111114] p-4 text-left transition-all duration-200 hover:border-white/22 hover:bg-[#16161b]"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]"
                  style={{ color: ws.accentColor }}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-medium text-neutral-300">
                  {ws.badge}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-white group-hover:text-neutral-100">
                  {ws.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                  {ws.tagline}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
