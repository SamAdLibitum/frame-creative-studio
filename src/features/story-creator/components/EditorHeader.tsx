import {
  ArrowLeft,
  Check,
  Download,
  Eye,
  Loader2,
  Redo2,
  Save,
  SlidersHorizontal,
  Undo2,
} from 'lucide-react';
import type { SaveStatus } from '@/types/studio';

interface EditorHeaderProps {
  projectTitle: string;
  saveStatus: SaveStatus;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onBackToDashboard: () => void;
  onOpenPreview: () => void;
  onOpenExport: () => void;
  onToggleMobileProperties: () => void;
  onRenameProject: (name: string) => void;
}

export function EditorHeader({
  projectTitle,
  saveStatus,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onBackToDashboard,
  onOpenPreview,
  onOpenExport,
  onToggleMobileProperties,
  onRenameProject,
}: EditorHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-[#0c0c0e] px-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <button type="button" onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-white/20 hover:bg-white/[0.07] hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>
        <div className="h-4 w-px bg-white/10" aria-hidden="true" />
        <div className="min-w-0">
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => onRenameProject(e.target.value)}
            className="w-full max-w-[180px] truncate bg-transparent text-sm font-semibold text-white focus:outline-none sm:max-w-[260px]"
          />
          <p className="hidden text-[11px] text-neutral-500 sm:flex sm:items-center sm:gap-1.5">
            {saveStatus === 'saving' && <><Loader2 className="h-3 w-3 animate-spin" />Menyimpan...</>}
            {saveStatus === 'saved' && <><Check className="h-3 w-3 text-emerald-400" />Tersimpan</>}
            {saveStatus === 'unsaved' && <>Draf lokal · Belum disimpan</>}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.02] p-0.5">
          <button type="button" disabled={!canUndo} onClick={onUndo} title="Undo (Ctrl+Z)" aria-label="Undo"
            className="rounded-md p-1.5 text-neutral-300 transition-colors hover:bg-white/6 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-600 disabled:opacity-45">
            <Undo2 className="h-4 w-4" />
          </button>
          <button type="button" disabled={!canRedo} onClick={onRedo} title="Redo (Ctrl+Shift+Z)" aria-label="Redo"
            className="rounded-md p-1.5 text-neutral-300 transition-colors hover:bg-white/6 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-600 disabled:opacity-45">
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
        <button type="button" onClick={onSave} title="Simpan (Ctrl+S)"
          className="rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-neutral-300 transition-colors hover:bg-white/[0.07] hover:text-white hidden sm:flex">
          <Save className="h-4 w-4" />
        </button>
        <button type="button" onClick={onToggleMobileProperties}
          className="rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-neutral-300 transition-colors hover:bg-white/[0.07] hover:text-white lg:hidden" aria-label="Buka panel properti">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
        <button type="button" onClick={onOpenPreview}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-white/25 hover:bg-white/[0.08]">
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Preview</span>
        </button>
        <button type="button" onClick={onOpenExport}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-neutral-200">
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </header>
  );
}
