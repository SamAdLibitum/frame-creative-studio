import type Konva from 'konva';
import { useEffect, useMemo, useRef } from 'react';
import { Image as KonvaImage } from 'react-konva';
import {
  type ProceduralBlendMode,
  renderProceduralToCanvas,
} from '@/engines/procedural';
import type { CanvasProceduralElement } from '@/types/studio';

interface CanvasProceduralProps {
  element: CanvasProceduralElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: Partial<CanvasProceduralElement>) => void;
  registerNode: (id: string, node: Konva.Node | null) => void;
}

function toKonvaCompositeOp(
  blendMode?: ProceduralBlendMode,
): GlobalCompositeOperation {
  if (!blendMode || blendMode === 'normal') return 'source-over';
  return blendMode;
}

export function CanvasProcedural({
  element,
  onSelect,
  onChange,
  registerNode,
}: CanvasProceduralProps) {
  const imageRef = useRef<Konva.Image>(null);

  // Read-only cached procedural canvas at exact logical element dimensions
  const renderedCanvas = useMemo(
    () =>
      renderProceduralToCanvas(
        element.procedural,
        element.width,
        element.height,
      ),
    [element.procedural, element.width, element.height],
  );

  useEffect(() => {
    registerNode(element.id, imageRef.current);
    return () => registerNode(element.id, null);
  }, [element.id, registerNode, renderedCanvas]);

  useEffect(() => {
    imageRef.current?.getLayer()?.batchDraw();
  }, [renderedCanvas, element.procedural.blendMode]);

  if (!element.visible) return null;

  return (
    <KonvaImage
      ref={imageRef}
      image={renderedCanvas}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      opacity={element.opacity}
      globalCompositeOperation={toKonvaCompositeOp(
        element.procedural.blendMode,
      )}
      draggable={!element.locked}
      listening={!element.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: Math.round(e.target.x()),
          y: Math.round(e.target.y()),
        });
      }}
      onTransformEnd={() => {
        const node = imageRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          width: Math.max(40, Math.round(node.width() * scaleX)),
          height: Math.max(40, Math.round(node.height() * scaleY)),
          rotation: Math.round(node.rotation()),
        });
      }}
    />
  );
}
