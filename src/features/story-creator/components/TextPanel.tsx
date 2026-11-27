import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Type,
} from 'lucide-react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, type CanvasTextElement } from '@/types/studio';

interface TextPanelProps {
  onAddText: (preset: Omit<CanvasTextElement, 'id'>) => void;
}

function makePreset(
  name: string,
  text: string,
  fontSize: number,
  fontWeight: 'normal' | 'bold',
  fontFamily: string,
): Omit<CanvasTextElement, 'id'> {
  return {
    type: 'text',
    name,
    text,
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle: 'normal',
    align: 'center',
    fill: '#ffffff',
    lineHeight: 1.3,
    letterSpacing: 0,
    backgroundColor: '',
    backgroundPadding: 0,
    backgroundRadius: 0,
    x: CANVAS_WIDTH / 2 - 250,
    y: CANVAS_HEIGHT / 2 - fontSize,
    width: 500,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
  };
}

const TEXT_PRESETS: Array<{
  label: string;
  icon: typeof Type;
  preset: Omit<CanvasTextElement, 'id'>;
}> = [
  { label: 'Heading', icon: Heading1, preset: makePreset('Heading', 'Tambahkan Judul', 72, 'bold', 'Poppins') },
  { label: 'Subheading', icon: Heading2, preset: makePreset('Subheading', 'Tambahkan Subjudul', 48, 'bold', 'DM Sans') },
  { label: 'Body Text', icon: Heading3, preset: makePreset('Body Text', 'Tulis teks isi di sini.', 32, 'normal', 'Inter') },
  { label: 'Caption', icon: Heading4, preset: makePreset('Caption', 'Tulis caption singkat', 24, 'normal', 'Lora') },
  { label: 'Custom Text', icon: Type, preset: makePreset('Custom Text', 'Teks kustom', 36, 'normal', 'Inter') },
];

export function TextPanel({ onAddText }: TextPanelProps) {
  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
      {TEXT_PRESETS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onAddText(item.preset)}
            className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-3 text-left transition-colors hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-neutral-300">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white">{item.label}</p>
              <p className="mt-0.5 truncate text-[11px] text-neutral-500" style={{ fontFamily: item.preset.fontFamily }}>
                {item.preset.text}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
