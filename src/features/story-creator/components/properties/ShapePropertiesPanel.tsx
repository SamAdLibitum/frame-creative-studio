import type {
  CanvasDecorativeElement,
  CanvasElement,
  CanvasLineElement,
  CanvasShapeElement,
} from '@/types/studio';

interface ShapePropertiesPanelProps {
  element: CanvasShapeElement | CanvasLineElement | CanvasDecorativeElement;
  onUpdate: (
    patch: Partial<CanvasElement>,
    options?: { coalesce?: boolean },
  ) => void;
}

export function ShapePropertiesPanel({
  element,
  onUpdate,
}: ShapePropertiesPanelProps) {
  if (element.type === 'line') {
    return (
      <div className="space-y-2 border-t border-white/8 pt-3">
        <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-neutral-300">
          <span>Stroke</span>
          <input
            type="color"
            value={element.stroke || '#ffffff'}
            onChange={(e) =>
              onUpdate(
                { stroke: e.target.value } as Partial<CanvasElement>,
                { coalesce: true },
              )
            }
            className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
          />
        </label>
        <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
          <span className="block text-[10px] text-neutral-500">
            Stroke Width
          </span>
          <input
            type="number"
            min={1}
            max={20}
            value={element.strokeWidth}
            onChange={(e) =>
              onUpdate({
                strokeWidth: Number(e.target.value) || 2,
              } as Partial<CanvasElement>)
            }
            className="mt-0.5 w-full bg-transparent text-xs text-neutral-200 focus:outline-none"
          />
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-2 border-t border-white/8 pt-3">
      <div className="flex items-center gap-1.5">
        <label className="flex flex-1 items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-neutral-300">
          <span>Fill</span>
          <input
            type="color"
            value={
              element.fill && element.fill !== 'transparent'
                ? element.fill
                : '#ffffff'
            }
            onChange={(e) =>
              onUpdate(
                { fill: e.target.value } as Partial<CanvasElement>,
                { coalesce: true },
              )
            }
            className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
          />
        </label>
        <button
          type="button"
          onClick={() =>
            onUpdate({ fill: 'transparent' } as Partial<CanvasElement>)
          }
          className="rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[10px] text-neutral-400 hover:text-white"
        >
          Kosong
        </button>
      </div>
      <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-neutral-300">
        <span>Stroke</span>
        <input
          type="color"
          value={element.stroke || '#ffffff'}
          onChange={(e) =>
            onUpdate(
              { stroke: e.target.value } as Partial<CanvasElement>,
              { coalesce: true },
            )
          }
          className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
          <span className="block text-[10px] text-neutral-500">
            Stroke Width
          </span>
          <input
            type="number"
            min={0}
            max={30}
            value={element.strokeWidth}
            onChange={(e) =>
              onUpdate({
                strokeWidth: Number(e.target.value) || 0,
              } as Partial<CanvasElement>)
            }
            className="mt-0.5 w-full bg-transparent text-xs text-neutral-200 focus:outline-none"
          />
        </label>
        {element.type === 'shape' &&
          (element.shapeType === 'rect' ||
            element.shapeType === 'rounded-rect') && (
            <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
              <span className="block text-[10px] text-neutral-500">
                Corner Radius
              </span>
              <input
                type="number"
                min={0}
                max={200}
                value={element.cornerRadius}
                onChange={(e) =>
                  onUpdate({
                    cornerRadius: Number(e.target.value) || 0,
                  } as Partial<CanvasElement>)
                }
                className="mt-0.5 w-full bg-transparent text-xs text-neutral-200 focus:outline-none"
              />
            </label>
          )}
      </div>
    </div>
  );
}
