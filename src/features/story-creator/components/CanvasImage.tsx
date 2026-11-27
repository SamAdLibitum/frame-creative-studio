import type Konva from 'konva';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Text as KonvaText, Shape } from 'react-konva';
import {
  computeCoverImageDraw,
  getPhotoWindowRect,
  traceOuterFramePath,
  tracePhotoClipPath,
} from '@/features/story-creator/utils/frameMaskPaths';
import {
  combinePresetAndAdjustments,
  isIdentityAdjustments,
  renderFilteredCanvas,
} from '@/features/story-creator/utils/photoFilters';
import type { CanvasPhotoElement } from '@/types/studio';

interface CanvasImageProps {
  element: CanvasPhotoElement;
  objectUrl?: string;
  isSelected: boolean;
  isPreview?: boolean;
  bypassFilters?: boolean;
  onSelect: () => void;
  onDblClick?: () => void;
  onChange: (updated: Partial<CanvasPhotoElement>) => void;
  registerNode: (id: string, node: Konva.Node | null) => void;
}

export function CanvasImage({
  element,
  objectUrl,
  isPreview = false,
  bypassFilters = false,
  onSelect,
  onDblClick,
  onChange,
  registerNode,
}: CanvasImageProps) {
  const groupRef = useRef<Konva.Group>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!objectUrl) {
      setImageObj(null);
      return;
    }
    let isMounted = true;
    const img = new window.Image();
    img.onload = () => {
      if (isMounted) setImageObj(img);
    };
    img.src = objectUrl;
    return () => {
      isMounted = false;
    };
  }, [objectUrl]);

  useEffect(() => {
    registerNode(element.id, groupRef.current);
    return () => registerNode(element.id, null);
  }, [element.id, registerNode, imageObj]);

  const effectiveAdj = useMemo(
    () =>
      combinePresetAndAdjustments(
        element.filterPreset,
        element.presetIntensity,
        element.adjustments,
      ),
    [element.filterPreset, element.presetIntensity, element.adjustments],
  );

  const renderSource = useMemo<CanvasImageSource | null>(() => {
    if (!imageObj) return null;
    if (bypassFilters || isIdentityAdjustments(effectiveAdj)) {
      return imageObj;
    }
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    return renderFilteredCanvas(
      imageObj,
      effectiveAdj,
      offscreenCanvasRef.current,
    );
  }, [imageObj, effectiveAdj, bypassFilters]);

  if (!element.visible) return null;

  const { width, height, frameShape, cornerRadius = 0 } = element;
  const hasFrame = Boolean(frameShape && frameShape !== 'none');
  const useCoverCrop = Boolean(element.crop || hasFrame);

  const winRect = getPhotoWindowRect(frameShape, width, height);
  const drawRect =
    imageObj && useCoverCrop
      ? computeCoverImageDraw(
          winRect,
          imageObj.naturalWidth || width,
          imageObj.naturalHeight || height,
          element.crop,
        )
      : { x: 0, y: 0, width, height };

  const bgFill =
    element.frameBackground && element.frameBackground !== 'transparent'
      ? element.frameBackground
      : !renderSource
        ? '#18181b'
        : undefined;

  const strokeColor =
    element.frameStroke && (element.frameStrokeWidth ?? 0) > 0
      ? element.frameStroke
      : !renderSource
        ? 'rgba(255,255,255,0.28)'
        : undefined;
  const strokeW =
    element.frameStroke && (element.frameStrokeWidth ?? 0) > 0
      ? element.frameStrokeWidth!
      : !renderSource
        ? 3
        : 0;

  return (
    <Group
      ref={groupRef}
      x={element.x}
      y={element.y}
      width={width}
      height={height}
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
        const sy = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);

        const nextW = Math.max(30, Math.round(width * sx));
        const nextH =
          frameShape === 'circle'
            ? nextW
            : Math.max(30, Math.round(height * sy));

        onChange({
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          width: nextW,
          height: nextH,
          rotation: Math.round(node.rotation()),
        });
      }}
    >
      {/* Frame Background */}
      {bgFill && (
        <Shape
          width={width}
          height={height}
          fill={bgFill}
          sceneFunc={(ctx, shape) => {
            traceOuterFramePath(
              ctx as unknown as CanvasRenderingContext2D,
              frameShape,
              width,
              height,
              cornerRadius,
            );
            ctx.fillStrokeShape(shape);
          }}
        />
      )}

      {/* Clipped Photo Window */}
      {renderSource ? (
        <Group
          clipFunc={(ctx) => {
            tracePhotoClipPath(
              ctx as unknown as CanvasRenderingContext2D,
              frameShape,
              width,
              height,
              cornerRadius,
            );
          }}
        >
          <KonvaImage
            image={renderSource}
            x={drawRect.x}
            y={drawRect.y}
            width={drawRect.width}
            height={drawRect.height}
          />
        </Group>
      ) : (
        <Group
          clipFunc={(ctx) => {
            tracePhotoClipPath(
              ctx as unknown as CanvasRenderingContext2D,
              frameShape,
              width,
              height,
              cornerRadius,
            );
          }}
        >
          <Shape
            width={width}
            height={height}
            fill="rgba(255,255,255,0.03)"
            sceneFunc={(ctx, shape) => {
              ctx.beginPath();
              ctx.rect(winRect.x, winRect.y, winRect.width, winRect.height);
              ctx.fillStrokeShape(shape);
            }}
          />
          {!isPreview && (
            <KonvaText
              name="editor-overlay"
              x={winRect.x + 24}
              y={winRect.y + winRect.height / 2 - 22}
              width={Math.max(40, winRect.width - 48)}
              text="Frame Foto Kosong&#10;Pilih foto untuk mengisi"
              fontSize={24}
              fontFamily="Inter"
              align="center"
              lineHeight={1.35}
              fill="rgba(255,255,255,0.45)"
            />
          )}
        </Group>
      )}

      {/* Frame Outer Border */}
      {strokeColor && strokeW > 0 && (
        <Shape
          width={width}
          height={height}
          stroke={strokeColor}
          strokeWidth={strokeW}
          listening={false}
          sceneFunc={(ctx, shape) => {
            traceOuterFramePath(
              ctx as unknown as CanvasRenderingContext2D,
              frameShape,
              width,
              height,
              cornerRadius,
            );
            ctx.fillStrokeShape(shape);
          }}
        />
      )}
    </Group>
  );
}
