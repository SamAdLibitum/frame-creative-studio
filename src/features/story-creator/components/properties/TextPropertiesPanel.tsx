import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
} from 'lucide-react';
import { FONT_OPTIONS, loadFont } from '@/constants/fonts';
import type { CanvasElement, CanvasTextElement } from '@/types/studio';

interface TextPropertiesPanelProps {
  element: CanvasTextElement;
  onUpdate: (
    patch: Partial<CanvasElement>,
    options?: { coalesce?: boolean },
  ) => void;
}

export function TextPropertiesPanel({
  element,
  onUpdate,
}: TextPropertiesPanelProps) {
  return (
    <div className="space-y-3 border-t border-white/8 pt-3">
      <label className="block">
        <span className="text-[10px] text-neutral-500">Konten Teks</span>
        <textarea
          disabled={element.locked}
          value={element.text}
          onChange={(e) =>
            onUpdate({ text: e.target.value } as Partial<CanvasElement>)
          }
          className="mt-1 w-full rounded-lg border border-white/8 bg-white/[0.02] p-2 text-xs text-neutral-200 focus:outline-none"
          rows={3}
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
          <span className="block text-[10px] text-neutral-500">Font</span>
          <select
            disabled={element.locked}
            value={element.fontFamily}
            onChange={(e) => {
              const fontOpt = FONT_OPTIONS.find(
                (f) => f.family === e.target.value,
              );
              if (fontOpt) loadFont(fontOpt);
              onUpdate({ fontFamily: e.target.value } as Partial<CanvasElement>);
            }}
            className="mt-0.5 w-full bg-[#0c0c0e] text-xs text-neutral-200 focus:outline-none"
          >
            {FONT_OPTIONS.map((f) => (
              <option
                key={f.family}
                value={f.family}
                style={{ fontFamily: f.family }}
              >
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
          <span className="block text-[10px] text-neutral-500">Ukuran</span>
          <input
            type="number"
            min={8}
            disabled={element.locked}
            value={element.fontSize}
            onChange={(e) =>
              onUpdate({
                fontSize: Number(e.target.value) || 24,
              } as Partial<CanvasElement>)
            }
            className="mt-0.5 w-full bg-transparent text-xs text-neutral-200 focus:outline-none"
          />
        </label>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          disabled={element.locked}
          onClick={() =>
            onUpdate({
              fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold',
            } as Partial<CanvasElement>)
          }
          className={`flex-1 rounded-lg border p-1.5 text-xs ${
            element.fontWeight === 'bold'
              ? 'border-white/20 bg-white/10 text-white'
              : 'border-white/8 text-neutral-400'
          }`}
        >
          <Bold className="mx-auto h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={element.locked}
          onClick={() =>
            onUpdate({
              fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic',
            } as Partial<CanvasElement>)
          }
          className={`flex-1 rounded-lg border p-1.5 text-xs ${
            element.fontStyle === 'italic'
              ? 'border-white/20 bg-white/10 text-white'
              : 'border-white/8 text-neutral-400'
          }`}
        >
          <Italic className="mx-auto h-4 w-4" />
        </button>
        {(['left', 'center', 'right'] as const).map((alignOpt) => {
          const Icon =
            alignOpt === 'left'
              ? AlignLeft
              : alignOpt === 'center'
                ? AlignCenter
                : AlignRight;
          return (
            <button
              key={alignOpt}
              type="button"
              disabled={element.locked}
              onClick={() =>
                onUpdate({ align: alignOpt } as Partial<CanvasElement>)
              }
              className={`flex-1 rounded-lg border p-1.5 text-xs ${
                element.align === alignOpt
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-white/8 text-neutral-400'
              }`}
            >
              <Icon className="mx-auto h-4 w-4" />
            </button>
          );
        })}
      </div>

      <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-neutral-300">
        <span>Warna Teks</span>
        <input
          type="color"
          disabled={element.locked}
          value={element.fill}
          onChange={(e) =>
            onUpdate(
              { fill: e.target.value } as Partial<CanvasElement>,
              { coalesce: true },
            )
          }
          className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      </label>

      <div className="flex items-center gap-1.5">
        <label className="flex flex-1 items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-neutral-300">
          <span>Background Teks</span>
          <input
            type="color"
            disabled={element.locked}
            value={element.backgroundColor || '#000000'}
            onChange={(e) =>
              onUpdate(
                { backgroundColor: e.target.value } as Partial<CanvasElement>,
                { coalesce: true },
              )
            }
            className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
          />
        </label>
        {element.backgroundColor && (
          <button
            type="button"
            onClick={() =>
              onUpdate({ backgroundColor: '' } as Partial<CanvasElement>)
            }
            className="rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[10px] text-neutral-400 hover:text-white"
          >
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
          <span className="block text-[10px] text-neutral-500">Bg Padding</span>
          <input
            type="number"
            min={0}
            value={element.backgroundPadding}
            onChange={(e) =>
              onUpdate({
                backgroundPadding: Number(e.target.value) || 0,
              } as Partial<CanvasElement>)
            }
            className="mt-0.5 w-full bg-transparent text-xs text-neutral-200 focus:outline-none"
          />
        </label>
        <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
          <span className="block text-[10px] text-neutral-500">Bg Radius</span>
          <input
            type="number"
            min={0}
            value={element.backgroundRadius}
            onChange={(e) =>
              onUpdate({
                backgroundRadius: Number(e.target.value) || 0,
              } as Partial<CanvasElement>)
            }
            className="mt-0.5 w-full bg-transparent text-xs text-neutral-200 focus:outline-none"
          />
        </label>
        <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
          <span className="block text-[10px] text-neutral-500">Line Height</span>
          <input
            type="number"
            min={0.5}
            max={3}
            step={0.1}
            value={element.lineHeight}
            onChange={(e) =>
              onUpdate({
                lineHeight: Number(e.target.value) || 1.3,
              } as Partial<CanvasElement>)
            }
            className="mt-0.5 w-full bg-transparent text-xs text-neutral-200 focus:outline-none"
          />
        </label>
        <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
          <span className="block text-[10px] text-neutral-500">
            Letter Spacing
          </span>
          <input
            type="number"
            min={-5}
            max={30}
            step={0.5}
            value={element.letterSpacing}
            onChange={(e) =>
              onUpdate({
                letterSpacing: Number(e.target.value) || 0,
              } as Partial<CanvasElement>)
            }
            className="mt-0.5 w-full bg-transparent text-xs text-neutral-200 focus:outline-none"
          />
        </label>
      </div>
    </div>
  );
}
