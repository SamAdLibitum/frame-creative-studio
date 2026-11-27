import {
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Image,
  Lock,
  Minus,
  Shapes,
  Sparkles,
  Trash2,
  Type,
  Unlock,
  WandSparkles,
} from 'lucide-react';
import { useState } from 'react';
import type { CanvasElement } from '@/types/studio';

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

function typeIcon(el: CanvasElement) {
  switch (el.type) {
    case 'photo':
      return Image;
    case 'text':
      return Type;
    case 'shape':
      return Shapes;
    case 'line':
      return Minus;
    case 'decorative':
      return Sparkles;
    case 'procedural':
      return WandSparkles;
  }
}

export function LayersPanel({
  elements,
  selectedId,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onDuplicate,
  onRename,
  onReorder,
}: LayersPanelProps) {
  const [draggedRealIdx, setDraggedRealIdx] = useState<number | null>(null);
  const [dragOverRealIdx, setDragOverRealIdx] = useState<number | null>(null);

  const reversed = [...elements].reverse();

  return (
    <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
      <p className="mb-1 text-[11px] font-medium text-neutral-500">
        {elements.length} layer (atas = depan)
      </p>
      {reversed.map((el) => {
        const Icon = typeIcon(el);
        const isSelected = el.id === selectedId;
        const realIdx = elements.findIndex((e) => e.id === el.id);
        const isDragOver =
          dragOverRealIdx === realIdx && draggedRealIdx !== realIdx;

        return (
          <div
            key={el.id}
            draggable
            onDragStart={(e) => {
              setDraggedRealIdx(realIdx);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setDragOverRealIdx(realIdx);
            }}
            onDragLeave={() => {
              if (dragOverRealIdx === realIdx) setDragOverRealIdx(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedRealIdx !== null && draggedRealIdx !== realIdx) {
                onReorder(draggedRealIdx, realIdx);
              }
              setDraggedRealIdx(null);
              setDragOverRealIdx(null);
            }}
            onDragEnd={() => {
              setDraggedRealIdx(null);
              setDragOverRealIdx(null);
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors ${
              isDragOver
                ? 'border-sky-400 bg-sky-400/10'
                : isSelected
                  ? 'border-white/25 bg-white/[0.08]'
                  : 'border-transparent hover:bg-white/[0.04]'
            } ${!el.visible ? 'opacity-45' : ''}`}
          >
            <span
              className="cursor-grab text-neutral-500 hover:text-neutral-300"
              title="Seret untuk mengubah urutan layer"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </span>

            <button
              type="button"
              onClick={() => onSelect(el.id)}
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
            >
              <Icon
                className="h-3.5 w-3.5 shrink-0 text-neutral-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={el.name}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(el.id);
                }}
                onChange={(e) => onRename(el.id, e.target.value)}
                className="min-w-0 flex-1 truncate bg-transparent text-[11px] font-medium text-neutral-200 focus:outline-none"
              />
            </button>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onToggleVisibility(el.id)}
                title={el.visible ? 'Sembunyikan' : 'Tampilkan'}
                className="rounded p-0.5 text-neutral-500 hover:text-neutral-200"
              >
                {el.visible ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </button>
              <button
                type="button"
                onClick={() => onToggleLock(el.id)}
                title={el.locked ? 'Buka kunci' : 'Kunci'}
                className="rounded p-0.5 text-neutral-500 hover:text-neutral-200"
              >
                {el.locked ? (
                  <Lock className="h-3 w-3 text-amber-400" />
                ) : (
                  <Unlock className="h-3 w-3" />
                )}
              </button>
              <button
                type="button"
                onClick={() => onDuplicate(el.id)}
                title="Duplikat"
                className="rounded p-0.5 text-neutral-500 hover:text-neutral-200"
              >
                <Copy className="h-3 w-3" />
              </button>
              <button
                type="button"
                disabled={el.locked}
                onClick={() => onDelete(el.id)}
                title={el.locked ? 'Layer terkunci' : 'Hapus'}
                className="rounded p-0.5 text-neutral-500 hover:text-red-400 disabled:opacity-30"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        );
      })}
      {elements.length === 0 && (
        <p className="py-8 text-center text-[11px] text-neutral-500">
          Belum ada layer. Tambahkan foto, teks, atau elemen.
        </p>
      )}
    </div>
  );
}
