import type Konva from 'konva';
import { useEffect, useRef } from 'react';
import { Circle, Ellipse, Group, Line, Rect, RegularPolygon } from 'react-konva';
import type { CanvasShapeElement } from '@/types/studio';

interface CanvasShapeProps {
  element: CanvasShapeElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: Partial<CanvasShapeElement>) => void;
  registerNode: (id: string, node: Konva.Node | null) => void;
}

export function CanvasShape({
  element,
  onSelect,
  onChange,
  registerNode,
}: CanvasShapeProps) {
  const groupRef = useRef<Konva.Group>(null);

  useEffect(() => {
    registerNode(element.id, groupRef.current);
    return () => registerNode(element.id, null);
  }, [element.id, registerNode]);

  if (!element.visible) return null;

  const common = {
    fill: element.fill || undefined,
    stroke: element.stroke || undefined,
    strokeWidth: element.strokeWidth,
  };

  const renderShape = () => {
    switch (element.shapeType) {
      case 'rect':
        return <Rect width={element.width} height={element.height} {...common} />;
      case 'rounded-rect':
        return <Rect width={element.width} height={element.height} cornerRadius={element.cornerRadius || 16} {...common} />;
      case 'circle':
        return <Circle x={element.width / 2} y={element.height / 2} radius={Math.min(element.width, element.height) / 2} {...common} />;
      case 'ellipse':
        return <Ellipse x={element.width / 2} y={element.height / 2} radiusX={element.width / 2} radiusY={element.height / 2} {...common} />;
      case 'triangle': {
        const pts = [element.width / 2, 0, element.width, element.height, 0, element.height];
        return <Line points={pts} closed {...common} />;
      }
      case 'polygon':
        return <RegularPolygon x={element.width / 2} y={element.height / 2} sides={6} radius={Math.min(element.width, element.height) / 2} {...common} />;
      default:
        return <Rect width={element.width} height={element.height} {...common} />;
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
          width: Math.max(10, Math.round(element.width * sx)),
          height: Math.max(10, Math.round(element.height * sy)),
          rotation: Math.round(node.rotation()),
        });
      }}
    >
      {renderShape()}
    </Group>
  );
}
