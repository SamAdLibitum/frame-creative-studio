import type Konva from 'konva';
import { useEffect, useRef } from 'react';
import { Group, Line, Circle } from 'react-konva';
import type { CanvasDecorativeElement } from '@/types/studio';

interface CanvasDecorativeProps {
  element: CanvasDecorativeElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: Partial<CanvasDecorativeElement>) => void;
  registerNode: (id: string, node: Konva.Node | null) => void;
}

function starPoints(cx: number, cy: number, outer: number, inner: number, spikes: number): number[] {
  const pts: number[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    pts.push(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  return pts;
}

function heartPoints(w: number, h: number): number[] {
  const pts: number[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    pts.push(w / 2 + (x / 16) * (w / 2), h / 2 + (y / 16) * (h / 2));
  }
  return pts;
}

export function CanvasDecorative({
  element,
  onSelect,
  onChange,
  registerNode,
}: CanvasDecorativeProps) {
  const groupRef = useRef<Konva.Group>(null);

  useEffect(() => {
    registerNode(element.id, groupRef.current);
    return () => registerNode(element.id, null);
  }, [element.id, registerNode]);

  if (!element.visible) return null;

  const { width: w, height: h, fill, stroke, strokeWidth } = element;
  const common = { fill: fill || undefined, stroke: stroke || undefined, strokeWidth };

  const renderDeco = () => {
    switch (element.decoType) {
      case 'star':
        return <Line points={starPoints(w / 2, h / 2, w / 2, w / 5, 5)} closed {...common} />;
      case 'sparkle':
        return <Line points={starPoints(w / 2, h / 2, w / 2, w / 6, 4)} closed {...common} />;
      case 'heart':
        return <Line points={heartPoints(w, h)} closed {...common} />;
      case 'dots':
        return (
          <>
            {[0.2, 0.5, 0.8].map((fx) =>
              [0.2, 0.5, 0.8].map((fy) => (
                <Circle key={`${fx}-${fy}`} x={w * fx} y={h * fy} radius={Math.min(w, h) * 0.08} fill={fill} />
              )),
            )}
          </>
        );
      case 'arrow-deco': {
        const pts = [0, h / 2, w * 0.7, h / 2, w * 0.5, h * 0.2, w * 0.7, h / 2, w * 0.5, h * 0.8];
        return <Line points={pts} {...common} />;
      }
      case 'floral': {
        const petalCount = 6;
        return (
          <>
            {Array.from({ length: petalCount }).map((_, i) => {
              const angle = (360 / petalCount) * i;
              const r = w * 0.3;
              const cx = w / 2 + r * Math.cos((angle * Math.PI) / 180) * 0.5;
              const cy = h / 2 + r * Math.sin((angle * Math.PI) / 180) * 0.5;
              return <Circle key={i} x={cx} y={cy} radius={r * 0.4} fill={fill} opacity={0.6} />;
            })}
            <Circle x={w / 2} y={h / 2} radius={w * 0.1} fill={fill} />
          </>
        );
      }
      case 'geometric': {
        const pts = [w * 0.5, 0, w, h * 0.33, w * 0.75, h, w * 0.25, h, 0, h * 0.33];
        return <Line points={pts} closed {...common} />;
      }
      default:
        return <Line points={starPoints(w / 2, h / 2, w / 2, w / 5, 5)} closed {...common} />;
    }
  };

  return (
    <Group
      ref={groupRef}
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      opacity={element.opacity}
      draggable={!element.locked}
      listening={!element.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({ x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
      }}
      onTransformEnd={() => {
        const node = groupRef.current;
        if (!node) return;
        const sx = node.scaleX();
        const sy = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          width: Math.max(10, Math.round(w * sx)),
          height: Math.max(10, Math.round(h * sy)),
          rotation: Math.round(node.rotation()),
        });
      }}
    >
      {renderDeco()}
    </Group>
  );
}
