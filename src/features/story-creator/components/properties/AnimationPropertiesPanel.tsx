import { Sparkles } from 'lucide-react';
import type {
  CanvasElement,
  ElementAnimationConfig,
  ElementAnimationPreset,
} from '@/types/studio';

interface AnimationPropertiesPanelProps {
  element: CanvasElement;
  onUpdate: (
    patch: Partial<CanvasElement>,
    options?: { coalesce?: boolean },
  ) => void;
}

const PRESETS: Array<{ value: ElementAnimationPreset; label: string }> = [
  { value: 'none', label: 'None (Statis)' },
  { value: 'fade-in', label: 'Fade In' },
  { value: 'slide-up', label: 'Slide Up' },
  { value: 'float', label: 'Float' },
  { value: 'slow-zoom', label: 'Slow Zoom' },
  { value: 'pulse', label: 'Pulse' },
];

export function AnimationPropertiesPanel({
  element,
  onUpdate,
}: AnimationPropertiesPanelProps) {
  const anim: ElementAnimationConfig = element.animation ?? {
    preset: 'none',
    duration: 1.0,
    delay: 0,
  };

  return (
    <div className="space-y-2.5 border-t border-white/8 pt-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
        <span>Motion & Animasi</span>
      </div>

      <label className="block rounded-xl border border-white/8 bg-white/[0.02] p-2">
        <span className="block text-[10px] text-neutral-500">Preset</span>
        <select
          disabled={element.locked}
          value={anim.preset}
          onChange={(e) =>
            onUpdate({
              animation: {
                ...anim,
                preset: e.target.value as ElementAnimationPreset,
              },
            })
          }
          className="mt-0.5 w-full bg-[#0c0c0e] text-xs text-neutral-200 focus:outline-none"
        >
          {PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      {anim.preset !== 'none' && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>Durasi</span>
              <span className="font-mono">{anim.duration.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={3}
              step={0.1}
              disabled={element.locked}
              value={anim.duration}
              onChange={(e) =>
                onUpdate(
                  { animation: { ...anim, duration: Number(e.target.value) } },
                  { coalesce: true },
                )
              }
              className="h-1.5 w-full accent-amber-400"
            />
          </div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>Delay</span>
              <span className="font-mono">{anim.delay.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              disabled={element.locked}
              value={anim.delay}
              onChange={(e) =>
                onUpdate(
                  { animation: { ...anim, delay: Number(e.target.value) } },
                  { coalesce: true },
                )
              }
              className="h-1.5 w-full accent-amber-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
