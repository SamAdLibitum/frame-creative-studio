import { ArrowLeft, Film, Layers, Pause, Play, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Group, Layer, Rect, Stage } from 'react-konva';
import { evaluateElementMotion } from '@/engines/motion/motionEngine';
import { CanvasDecorative } from '@/features/story-creator/components/CanvasDecorative';
import { CanvasImage } from '@/features/story-creator/components/CanvasImage';
import { CanvasLine } from '@/features/story-creator/components/CanvasLine';
import { CanvasProcedural } from '@/features/story-creator/components/CanvasProcedural';
import { CanvasShape } from '@/features/story-creator/components/CanvasShape';
import { CanvasText } from '@/features/story-creator/components/CanvasText';
import type { CanvasElement, UploadedPhoto } from '@/types/studio';
import {
  downloadBlob,
  exportMotionToWebM,
  isWebMExportSupported,
} from '@/utils/exportEngine';

interface PreviewModeProps {
  projectTitle: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  elements: CanvasElement[];
  photosById: Record<string, UploadedPhoto>;
  onExitPreview: () => void;
}

const MAX_TIME = 5.0;

export function PreviewMode({
  projectTitle,
  canvasWidth,
  canvasHeight,
  backgroundColor,
  elements,
  photosById,
  onExitPreview,
}: PreviewModeProps) {
  const [timeSec, setTimeSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  const previewScale = Math.min(
    420 / Math.max(1, canvasWidth),
    600 / Math.max(1, canvasHeight),
  );
  const stageWidth = Math.round(canvasWidth * previewScale);
  const stageHeight = Math.round(canvasHeight * previewScale);
  const noop = useCallback(() => {}, []);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastFrameRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (lastFrameRef.current !== null) {
        const dt = (now - lastFrameRef.current) / 1000;
        setTimeSec((prev) => {
          const next = prev + dt;
          if (next >= MAX_TIME) {
            setIsPlaying(false);
            return MAX_TIME;
          }
          return next;
        });
      }
      lastFrameRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastFrameRef.current = null;
    };
  }, [isPlaying]);

  const handleExportWebM = async () => {
    setVideoError(null);
    if (!isWebMExportSupported()) {
      setVideoError(
        'Browser ini tidak mendukung ekspor video WebM (MediaRecorder / captureStream).',
      );
      return;
    }
    setIsPlaying(false);
    setIsRecording(true);
    setRecordProgress(0);
    try {
      const blob = await exportMotionToWebM({
        elements,
        backgroundColor,
        width: canvasWidth,
        height: canvasHeight,
        photosById,
        durationSec: 5,
        onProgress: setRecordProgress,
      });
      const safeName =
        projectTitle
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/g, '-') || 'frame-motion';
      downloadBlob(blob, `${safeName}.webm`);
    } catch (err) {
      setVideoError(
        err instanceof Error ? err.message : 'Gagal mengekspor video WebM.',
      );
    } finally {
      setIsRecording(false);
    }
  };

  const visibleElements = elements.filter((el) => el.visible);
  const webmSupported = isWebMExportSupported();

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
            Preview · {canvasWidth} × {canvasHeight} px
          </p>
        </div>

        <button
          type="button"
          disabled={isRecording || !webmSupported}
          onClick={() => void handleExportWebM()}
          title={
            webmSupported
              ? 'Ekspor animasi 5 detik ke WebM'
              : 'Browser tidak mendukung ekspor WebM'
          }
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Film className="h-3.5 w-3.5" />
          <span>
            {isRecording
              ? `Merekam ${Math.round(recordProgress * 100)}%`
              : 'Export Video (WebM)'}
          </span>
        </button>
      </header>

      {videoError && (
        <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-xs text-red-200">
          {videoError}
        </div>
      )}

      <main className="flex flex-1 flex-col items-center justify-center gap-5 overflow-auto p-6">
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
                Pratinjau kanvas. Belum ada objek aktif.
              </p>
            </div>
          ) : (
            <Stage
              width={stageWidth}
              height={stageHeight}
              scaleX={previewScale}
              scaleY={previewScale}
              listening={false}
            >
              <Layer listening={false}>
                {backgroundColor !== 'transparent' && (
                  <Rect
                    x={0}
                    y={0}
                    width={canvasWidth}
                    height={canvasHeight}
                    fill={backgroundColor}
                  />
                )}
                {visibleElements.map((element) => {
                  const m = evaluateElementMotion(
                    {
                      x: element.x,
                      y: element.y,
                      opacity: element.opacity,
                      rotation: element.rotation,
                    },
                    element.animation,
                    timeSec,
                  );
                  const animatedEl = {
                    ...element,
                    x: m.x,
                    y: m.y,
                    opacity: m.opacity,
                    rotation: m.rotation,
                    locked: true,
                  };

                  const renderNode = () => {
                    switch (animatedEl.type) {
                      case 'photo': {
                        const photo = animatedEl.photoId
                          ? photosById[animatedEl.photoId]
                          : undefined;
                        if (
                          !photo &&
                          (!animatedEl.frameShape ||
                            animatedEl.frameShape === 'none')
                        ) {
                          return null;
                        }
                        return (
                          <CanvasImage
                            element={animatedEl}
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
                            element={animatedEl}
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
                            element={animatedEl}
                            isSelected={false}
                            onSelect={noop}
                            onChange={noop}
                            registerNode={noop}
                          />
                        );
                      case 'line':
                        return (
                          <CanvasLine
                            element={animatedEl}
                            isSelected={false}
                            onSelect={noop}
                            onChange={noop}
                            registerNode={noop}
                          />
                        );
                      case 'decorative':
                        return (
                          <CanvasDecorative
                            element={animatedEl}
                            isSelected={false}
                            onSelect={noop}
                            onChange={noop}
                            registerNode={noop}
                          />
                        );
                      case 'procedural':
                        return (
                          <CanvasProcedural
                            element={animatedEl}
                            isSelected={false}
                            onSelect={noop}
                            onChange={noop}
                            registerNode={noop}
                          />
                        );
                    }
                  };

                  return (
                    <Group
                      key={element.id}
                      scaleX={m.scaleX}
                      scaleY={m.scaleY}
                    >
                      {renderNode()}
                    </Group>
                  );
                })}
              </Layer>
            </Stage>
          )}
        </div>

        {/* Motion Timeline Scrubber (0.0 – 5.0s) */}
        <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-[#111114] px-4 py-2.5">
          <button
            type="button"
            onClick={() => {
              if (timeSec >= MAX_TIME) setTimeSec(0);
              setIsPlaying((prev) => !prev);
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-neutral-950 hover:bg-neutral-200"
            aria-label={isPlaying ? 'Jeda' : 'Putar'}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setTimeSec(0);
            }}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/8 hover:text-white"
            aria-label="Reset timeline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <input
            type="range"
            min={0}
            max={MAX_TIME}
            step={0.05}
            value={timeSec}
            onChange={(e) => {
              setIsPlaying(false);
              setTimeSec(Number(e.target.value));
            }}
            className="h-1.5 flex-1 accent-sky-400"
            aria-label="Timeline animasi"
          />

          <span className="w-16 shrink-0 text-right font-mono text-[11px] text-neutral-300">
            {timeSec.toFixed(1)}s / 5.0s
          </span>
        </div>
      </main>
    </div>
  );
}
