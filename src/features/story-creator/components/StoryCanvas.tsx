import type Konva from 'konva';
import { ImagePlus, Layers } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Layer, Line, Rect, Stage, Transformer } from 'react-konva';
import { CanvasDecorative } from '@/features/story-creator/components/CanvasDecorative';
import { CanvasImage } from '@/features/story-creator/components/CanvasImage';
import { CanvasLine } from '@/features/story-creator/components/CanvasLine';
import { CanvasProcedural } from '@/features/story-creator/components/CanvasProcedural';
import { CanvasShape } from '@/features/story-creator/components/CanvasShape';
import { CanvasText } from '@/features/story-creator/components/CanvasText';
import type {
  CanvasElement,
  CanvasTextElement,
  UploadedPhoto,
} from '@/types/studio';

interface StoryCanvasProps {
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
  showSafeArea: boolean;
  isComparingOriginal?: boolean;
  hideOverlays?: boolean;
  backgroundColor: string;
  elements: CanvasElement[];
  photosById: Record<string, UploadedPhoto>;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updated: Partial<CanvasElement>) => void;
  onOpenCrop?: (id: string) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
}

const SNAP_THRESHOLD = 14;

export function StoryCanvas({
  zoom,
  canvasWidth,
  canvasHeight,
  showSafeArea,
  isComparingOriginal = false,
  hideOverlays = false,
  backgroundColor,
  elements,
  photosById,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onOpenCrop,
  stageRef,
}: StoryCanvasProps) {
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeMapRef = useRef<Record<string, Konva.Node | null>>({});
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [snapGuide, setSnapGuide] = useState<{ v: boolean; h: boolean }>({
    v: false,
    h: false,
  });

  const baseScale = Math.min(520 / Math.max(1, canvasWidth), 560 / Math.max(1, canvasHeight));
  const displayScale = baseScale * (zoom / 100);
  const stageWidth = Math.round(canvasWidth * displayScale);
  const stageHeight = Math.round(canvasHeight * displayScale);

  const registerNode = useCallback((id: string, node: Konva.Node | null) => {
    nodeMapRef.current[id] = node;
  }, []);

  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    if (hideOverlays || editingTextId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }
    const selectedNode = selectedElementId
      ? nodeMapRef.current[selectedElementId]
      : null;
    const selectedEl = elements.find((e) => e.id === selectedElementId);
    if (selectedNode && selectedEl && !selectedEl.locked && selectedEl.visible) {
      tr.nodes([selectedNode]);
    } else {
      tr.nodes([]);
    }
    tr.getLayer()?.batchDraw();
  }, [selectedElementId, elements, hideOverlays, editingTextId]);

  const selectedElement = elements.find((el) => el.id === selectedElementId);
  const editingTextEl = elements.find(
    (el): el is CanvasTextElement =>
      el.id === editingTextId && el.type === 'text',
  );

  const centerH = canvasWidth / 2;
  const centerV = canvasHeight / 2;

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-auto bg-[#070709] p-4 sm:p-8">
      <div
        className="relative shrink-0 overflow-hidden rounded-2xl border border-white/12 shadow-2xl shadow-black/80"
        style={{ width: stageWidth, height: stageHeight }}
      >
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          scaleX={displayScale}
          scaleY={displayScale}
          onDragMove={(e) => {
            const node = e.target;
            if (node === e.target.getStage()) return;
            const box = node.getClientRect({ relativeTo: node.getLayer() ?? undefined });
            const nodeCenterX = box.x + box.width / 2;
            const nodeCenterY = box.y + box.height / 2;
            const nearV = Math.abs(nodeCenterX - centerH) < SNAP_THRESHOLD;
            const nearH = Math.abs(nodeCenterY - centerV) < SNAP_THRESHOLD;
            if (nearV) {
              node.x(Math.round(node.x() + (centerH - nodeCenterX)));
            }
            if (nearH) {
              node.y(Math.round(node.y() + (centerV - nodeCenterY)));
            }
            setSnapGuide({ v: nearV, h: nearH });
          }}
          onDragEnd={() => {
            setSnapGuide({ v: false, h: false });
          }}
          onMouseDown={(e) => {
            if (
              e.target === e.target.getStage() ||
              e.target.name() === 'bg-rect'
            ) {
              onSelectElement(null);
              setEditingTextId(null);
            }
          }}
          onTouchStart={(e) => {
            if (
              e.target === e.target.getStage() ||
              e.target.name() === 'bg-rect'
            ) {
              onSelectElement(null);
              setEditingTextId(null);
            }
          }}
        >
          <Layer>
            {backgroundColor !== 'transparent' && (
              <Rect
                name="bg-rect"
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fill={backgroundColor}
              />
            )}

            {elements.map((element) => {
              if (!element.visible) return null;
              if (isComparingOriginal && element.type === 'procedural') {
                return null;
              }

              switch (element.type) {
                case 'photo': {
                  const photo = element.photoId
                    ? photosById[element.photoId]
                    : undefined;
                  return (
                    <CanvasImage
                      key={element.id}
                      element={element}
                      objectUrl={photo?.objectUrl}
                      isSelected={element.id === selectedElementId}
                      bypassFilters={isComparingOriginal}
                      onSelect={() => onSelectElement(element.id)}
                      onDblClick={() => {
                        if (!element.locked && element.photoId && onOpenCrop) {
                          onOpenCrop(element.id);
                        }
                      }}
                      onChange={(u) => onUpdateElement(element.id, u)}
                      registerNode={registerNode}
                    />
                  );
                }
                case 'text':
                  return (
                    <CanvasText
                      key={element.id}
                      element={element}
                      isSelected={element.id === selectedElementId}
                      onSelect={() => onSelectElement(element.id)}
                      onChange={(u) => onUpdateElement(element.id, u)}
                      registerNode={registerNode}
                      onDblClick={() => {
                        if (!element.locked) {
                          onSelectElement(element.id);
                          setEditingTextId(element.id);
                        }
                      }}
                    />
                  );
                case 'shape':
                  return (
                    <CanvasShape
                      key={element.id}
                      element={element}
                      isSelected={element.id === selectedElementId}
                      onSelect={() => onSelectElement(element.id)}
                      onChange={(u) => onUpdateElement(element.id, u)}
                      registerNode={registerNode}
                    />
                  );
                case 'line':
                  return (
                    <CanvasLine
                      key={element.id}
                      element={element}
                      isSelected={element.id === selectedElementId}
                      onSelect={() => onSelectElement(element.id)}
                      onChange={(u) => onUpdateElement(element.id, u)}
                      registerNode={registerNode}
                    />
                  );
                case 'decorative':
                  return (
                    <CanvasDecorative
                      key={element.id}
                      element={element}
                      isSelected={element.id === selectedElementId}
                      onSelect={() => onSelectElement(element.id)}
                      onChange={(u) => onUpdateElement(element.id, u)}
                      registerNode={registerNode}
                    />
                  );
                case 'procedural':
                  return (
                    <CanvasProcedural
                      key={element.id}
                      element={element}
                      isSelected={element.id === selectedElementId}
                      onSelect={() => onSelectElement(element.id)}
                      onChange={(u) => onUpdateElement(element.id, u)}
                      registerNode={registerNode}
                    />
                  );
              }
            })}

            {!hideOverlays && (
              <Transformer
                name="editor-overlay"
                ref={transformerRef}
                keepRatio={
                  selectedElement?.type === 'photo'
                    ? selectedElement.keepAspectRatio
                    : false
                }
                borderStroke="#38bdf8"
                borderStrokeWidth={2}
                anchorStroke="#38bdf8"
                anchorFill="#09090b"
                anchorSize={10}
                anchorCornerRadius={3}
                rotateAnchorOffset={28}
                boundBoxFunc={(oldBox, newBox) =>
                  newBox.width < 10 || newBox.height < 10 ? oldBox : newBox
                }
              />
            )}

            {!hideOverlays && showSafeArea && (
              <>
                <Line
                  name="editor-overlay"
                  points={[0, canvasHeight * 0.14, canvasWidth, canvasHeight * 0.14]}
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dash={[12, 8]}
                  opacity={0.45}
                  listening={false}
                />
                <Line
                  name="editor-overlay"
                  points={[0, canvasHeight * 0.86, canvasWidth, canvasHeight * 0.86]}
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dash={[12, 8]}
                  opacity={0.45}
                  listening={false}
                />
              </>
            )}

            {!hideOverlays && snapGuide.v && (
              <Line
                name="editor-overlay"
                points={[centerH, 0, centerH, canvasHeight]}
                stroke="#f472b6"
                strokeWidth={2}
                dash={[8, 6]}
                opacity={0.85}
                listening={false}
              />
            )}

            {!hideOverlays && snapGuide.h && (
              <Line
                name="editor-overlay"
                points={[0, centerV, canvasWidth, centerV]}
                stroke="#f472b6"
                strokeWidth={2}
                dash={[8, 6]}
                opacity={0.85}
                listening={false}
              />
            )}
          </Layer>
        </Stage>

        {/* Inline Double-Click Text Editor Overlay */}
        {editingTextEl && !hideOverlays && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
            <div className="w-full max-w-[260px] space-y-2.5 rounded-2xl border border-white/15 bg-[#111114] p-3.5 shadow-2xl">
              <p className="text-[11px] font-semibold text-neutral-200">
                Edit Teks
              </p>
              <textarea
                autoFocus
                rows={4}
                value={editingTextEl.text}
                onChange={(e) =>
                  onUpdateElement(editingTextEl.id, {
                    text: e.target.value,
                  } as Partial<CanvasElement>)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditingTextId(null);
                  }
                }}
                className="w-full rounded-xl border border-white/12 bg-white/[0.04] p-2.5 text-xs text-white focus:border-sky-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setEditingTextId(null)}
                className="w-full rounded-lg bg-white py-1.5 text-xs font-semibold text-neutral-950 hover:bg-neutral-200"
              >
                Selesai
              </button>
            </div>
          </div>
        )}

        {elements.length === 0 && !hideOverlays && (
          <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-neutral-300">
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-4 text-xs font-semibold tracking-wide text-neutral-200">
              Kanvas Story 9:16
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-500">
              Tambahkan foto, template, teks, atau elemen dari toolbar.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[10px] text-neutral-400">
              <Layers className="h-3 w-3" aria-hidden="true" />
              <span>
                {canvasWidth} × {canvasHeight} px
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
