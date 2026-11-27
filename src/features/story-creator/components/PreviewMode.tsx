import { ArrowLeft, Layers } from 'lucide-react';
import { useCallback } from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import { CanvasDecorative } from '@/features/story-creator/components/CanvasDecorative';
import { CanvasImage } from '@/features/story-creator/components/CanvasImage';
import { CanvasLine } from '@/features/story-creator/components/CanvasLine';
import { CanvasShape } from '@/features/story-creator/components/CanvasShape';
import { CanvasText } from '@/features/story-creator/components/CanvasText';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  type CanvasElement,
  type UploadedPhoto,
} from '@/types/studio';

interface PreviewModeProps {
  projectTitle: string;
  backgroundColor: string;
  elements: CanvasElement[];
  photosById: Record<string, UploadedPhoto>;
  onExitPreview: () => void;
}

const PREVIEW_SCALE = 0.33;

export function PreviewMode({
  projectTitle,
  backgroundColor,
  elements,
  photosById,
  onExitPreview,
}: PreviewModeProps) {
  const stageWidth = Math.round(CANVAS_WIDTH * PREVIEW_SCALE);
  const stageHeight = Math.round(CANVAS_HEIGHT * PREVIEW_SCALE);
  const noop = useCallback(() => {}, []);

  const visibleElements = elements.filter((el) => el.visible);

  return (
    <div className="flex min-h-screen flex-col bg-[#050507] text-neutral-100">
      <header className="flex h-14 items-center justify-between border-b border-white/8 bg-[#0c0c0e] px-4 sm:px-6">
        <button
          type="button"
          onClick={onExitPreview}
          className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-white/25 hover:bg-white/[0.08]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Kembali ke Editor</span>
        </button>

        <div className="text-center">
          <p className="text-xs font-semibold text-white">{projectTitle}</p>
          <p className="text-[10px] text-neutral-500">
            Mode Preview · 1080 × 1920 px (9:16)
          </p>
        </div>

        <div className="w-24 sm:w-32" aria-hidden="true" />
      </header>

      <main className="flex flex-1 items-center justify-center overflow-auto p-6">
        <div
          className="relative shrink-0 overflow-hidden rounded-3xl border border-white/15 shadow-2xl shadow-black"
          style={{ width: stageWidth, height: stageHeight, backgroundColor }}
        >
          {visibleElements.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-neutral-300">
                <Layers className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-4 text-sm font-semibold text-white">
                {projectTitle}
              </p>
              <p className="mt-1.5 max-w-[200px] text-xs leading-relaxed text-neutral-400">
                Pratinjau Instagram Story 9:16. Belum ada objek aktif pada
                kanvas.
              </p>
            </div>
          ) : (
            <Stage
              width={stageWidth}
              height={stageHeight}
              scaleX={PREVIEW_SCALE}
              scaleY={PREVIEW_SCALE}
              listening={false}
            >
              <Layer listening={false}>
                <Rect
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  fill={backgroundColor}
                />
                {visibleElements.map((element) => {
                  switch (element.type) {
                    case 'photo': {
                      const photo = element.photoId
                        ? photosById[element.photoId]
                        : undefined;
                      if (!photo && (!element.frameShape || element.frameShape === 'none')) {
                        return null;
                      }
                      return (
                        <CanvasImage
                          key={element.id}
                          element={{ ...element, locked: true }}
                          objectUrl={photo?.objectUrl}
                          isSelected={false}
                          isPreview
                          onSelect={noop}
                          onChange={noop}
                          registerNode={noop}
                        />
                      );
                    }
                    case 'text':
                      return (
                        <CanvasText
                          key={element.id}
                          element={{ ...element, locked: true }}
                          isSelected={false}
                          onSelect={noop}
                          onChange={noop}
                          registerNode={noop}
                          onDblClick={noop}
                        />
                      );
                    case 'shape':
                      return (
                        <CanvasShape
                          key={element.id}
                          element={{ ...element, locked: true }}
                          isSelected={false}
                          onSelect={noop}
                          onChange={noop}
                          registerNode={noop}
                        />
                      );
                    case 'line':
                      return (
                        <CanvasLine
                          key={element.id}
                          element={{ ...element, locked: true }}
                          isSelected={false}
                          onSelect={noop}
                          onChange={noop}
                          registerNode={noop}
                        />
                      );
                    case 'decorative':
                      return (
                        <CanvasDecorative
                          key={element.id}
                          element={{ ...element, locked: true }}
                          isSelected={false}
                          onSelect={noop}
                          onChange={noop}
                          registerNode={noop}
                        />
                      );
                  }
                })}
              </Layer>
            </Stage>
          )}
        </div>
      </main>
    </div>
  );
}
