import type Konva from 'konva';
import { useEffect, useRef } from 'react';
import { Arrow, Group, Line } from 'react-konva';
import type { CanvasLineElement } from '@/types/studio';

interface CanvasLineProps {
  element: CanvasLineElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: Partial<CanvasLineElement>) => void;
  registerNode: (id: string, node: Konva.Node | null) => void;
}

export function CanvasLine({
  element,
  onSelect,
  onChange,
  registerNode,
}: CanvasLineProps) {
  const groupRef = useRef<Konva.Group>(null);

  useEffect(() => {
    registerNode(element.id, groupRef.current);
    return () => registerNode(element.id, null);
  }, [element.id, registerNode]);

  if (!element.visible) return null;

  const pts = [0, 0, element.length, 0];
  const common = {
    stroke: element.stroke,
    strokeWidth: element.strokeWidth,
  };

  const renderLine = () => {
    switch (element.lineType) {
      case 'dashed':
        return <Line points={pts} dash={[12, 6]} {...common} />;
      case 'arrow':
        return <Arrow points={pts} pointerLength={12} pointerWidth={10} fill={element.stroke} {...common} />;
      case 'double-arrow':
        return (
          <>
            <Arrow points={pts} pointerLength={12} pointerWidth={10} fill={element.stroke} {...common} />
            <Arrow points={[element.length, 0, 0, 0]} pointerLength={12} pointerWidth={10} fill={element.stroke} {...common} />
          </>
        );
      default:
        return <Line points={pts} {...common} />;
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
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          length: Math.max(20, Math.round(element.length * sx)),
          rotation: Math.round(node.rotation()),
        });
      }}
    >
      {renderLine()}
    </Group>
  );
}
