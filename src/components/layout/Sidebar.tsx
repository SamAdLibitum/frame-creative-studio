import {
  FolderKanban,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  Settings,
  X,
} from 'lucide-react';
import type { NavItemId } from '@/types/studio';

interface SidebarProps {
  activeNav: NavItemId;
  onSelectNav: (id: NavItemId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{
  id: NavItemId;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'My Projects', icon: FolderKanban },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  activeNav,
  onSelectNav,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const handleSelect = (id: NavItemId) => {
    onSelectNav(id);
    onCloseMobile();
  };

  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/8 bg-[#0c0c0e] transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/8 px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-neutral-950 shadow-sm">
              <Layers className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="text-base font-semibold tracking-[0.18em] text-white">
              FRAME
            </span>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-white/6 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white/10 text-white shadow-xs'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-100'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-neutral-500 group-hover:text-neutral-200'
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/8 p-4">
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
            <p className="text-xs font-medium text-neutral-200">
              Format Kanvas Utama
            </p>
            <p className="mt-1 text-[11px] text-neutral-400">
              Instagram Story · 1080 × 1920 px (9:16)
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
