import type Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import { Group, Text as KonvaText, Rect } from 'react-konva';
import type { CanvasTextElement } from '@/types/studio';

interface CanvasTextProps {
  element: CanvasTextElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: Partial<CanvasTextElement>) => void;
  registerNode: (id: string, node: Konva.Node | null) => void;
  onDblClick: () => void;
}

export function CanvasText({
  element,
  onSelect,
  onChange,
  registerNode,
  onDblClick,
}: CanvasTextProps) {
  const groupRef = useRef<Konva.Group>(null);
  const textRef = useRef<Konva.Text>(null);
  const [textHeight, setTextHeight] = useState(element.fontSize * 1.4);

  useEffect(() => {
    registerNode(element.id, groupRef.current);
    return () => registerNode(element.id, null);
  }, [element.id, registerNode]);

  useEffect(() => {
    if (textRef.current) {
      setTextHeight(textRef.current.height());
    }
  }, [
    element.text,
    element.fontFamily,
    element.fontSize,
    element.fontWeight,
    element.fontStyle,
    element.lineHeight,
    element.letterSpacing,
    element.width,
  ]);

  if (!element.visible) return null;

  const hasBg =
    Boolean(element.backgroundColor) &&
    element.backgroundColor !== 'transparent';

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
      onDblClick={onDblClick}
      onDblTap={onDblClick}
      onDragEnd={(e) => {
        onChange({
          x: Math.round(e.target.x()),
          y: Math.round(e.target.y()),
        });
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
          width: Math.max(40, Math.round(element.width * sx)),
          rotation: Math.round(node.rotation()),
        });
      }}
    >
      {hasBg && (
        <Rect
          x={-element.backgroundPadding}
          y={-element.backgroundPadding}
          width={element.width + element.backgroundPadding * 2}
          height={textHeight + element.backgroundPadding * 2}
          fill={element.backgroundColor}
          cornerRadius={element.backgroundRadius}
        />
      )}
      <KonvaText
        ref={textRef}
        text={element.text}
        fontFamily={element.fontFamily}
        fontSize={element.fontSize}
        fontStyle={
          `${element.fontWeight === 'bold' ? 'bold' : ''} ${element.fontStyle === 'italic' ? 'italic' : ''}`.trim() ||
          'normal'
        }
        align={element.align}
        fill={element.fill}
        lineHeight={element.lineHeight}
        letterSpacing={element.letterSpacing}
        width={element.width}
        wrap="word"
      />
    </Group>
  );
}
