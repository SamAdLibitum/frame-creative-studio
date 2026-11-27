import Konva from 'konva';
import {
  adaptElementsToCanvasSize,
  getCanvasPreset,
} from '@/engines/canvas/formatEngine';
import { evaluateElementMotion } from '@/engines/motion/motionEngine';
import { renderProceduralToCanvas } from '@/engines/procedural';
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
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  type CanvasElement,
  type CanvasPresetId,
  type UploadedPhoto,
} from '@/types/studio';

export type ExportFormat = 'png' | 'jpeg';

export interface ExportOptions {
  format: ExportFormat;
  quality: number; // 0.1 – 1.0 for jpeg
  canvasWidth?: number;
  pixelRatio?: number;
}

export async function exportStageToBlob(
  stage: Konva.Stage,
  options: ExportOptions,
): Promise<Blob> {
  const { format, quality, canvasWidth = CANVAS_WIDTH } = options;
  const pixelRatio =
    (options.pixelRatio ?? 1) * (canvasWidth / Math.max(1, stage.width()));

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const overlays = stage.find('.editor-overlay');
  const prevVis = overlays.map((n) => n.visible());
  overlays.forEach((n) => n.visible(false));

  return new Promise((resolve, reject) => {
    try {
      stage.toBlob({
        pixelRatio,
        mimeType: format === 'jpeg' ? 'image/jpeg' : 'image/png',
        quality: format === 'jpeg' ? quality : undefined,
        callback: (blob) => {
          overlays.forEach((n, i) => n.visible(prevVis[i]));
          stage.batchDraw();
          if (blob) resolve(blob);
          else reject(new Error('Export menghasilkan blob kosong.'));
        },
      });
    } catch (err) {
      overlays.forEach((n, i) => n.visible(prevVis[i]));
      stage.batchDraw();
      reject(err);
    }
  });
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateThumbnailDataUrl(stage: Konva.Stage): string {
  const overlays = stage.find('.editor-overlay');
  const prevVis = overlays.map((n) => n.visible());
  overlays.forEach((n) => n.visible(false));
  try {
    const pixelRatio = 240 / Math.max(1, stage.width());
    return stage.toDataURL({
      pixelRatio,
      mimeType: 'image/jpeg',
      quality: 0.65,
    });
  } finally {
    overlays.forEach((n, i) => n.visible(prevVis[i]));
    stage.batchDraw();
  }
}

function loadImageElement(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Renders any snapshot of elements + background at exact target resolution on an
 * offscreen HTML5 Canvas 2D without touching React state or editor history.
 * Used for Multi-Format Batch Export and Carousel Multi-Slide Export.
 */
export async function renderSnapshotOffscreenToBlob(
  elements: CanvasElement[],
  backgroundColor: string,
  width: number,
  height: number,
  photosById: Record<string, UploadedPhoto>,
  format: ExportFormat,
  quality: number,
  timeSec?: number,
): Promise<Blob> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Gagal membuat konteks Canvas 2D untuk ekspor.');
  }

  // Background
  if (backgroundColor && backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  } else if (format === 'jpeg') {
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);
  }

  // Preload photos needed for this snapshot
  const loadedImages: Record<string, HTMLImageElement> = {};
  for (const el of elements) {
    if (el.visible && el.type === 'photo' && el.photoId) {
      const p = photosById[el.photoId];
      if (p && !loadedImages[el.photoId]) {
        const img = await loadImageElement(p.objectUrl);
        if (img) loadedImages[el.photoId] = img;
      }
    }
  }

  for (const el of elements) {
    if (!el.visible) continue;

    const motion =
      timeSec !== undefined
        ? evaluateElementMotion(
            { x: el.x, y: el.y, opacity: el.opacity, rotation: el.rotation },
            el.animation,
            timeSec,
          )
        : {
            x: el.x,
            y: el.y,
            opacity: el.opacity,
            scaleX: 1,
            scaleY: 1,
            rotation: el.rotation,
          };

    ctx.save();
    ctx.globalAlpha = motion.opacity;
    ctx.translate(motion.x, motion.y);
    if (motion.rotation !== 0) {
      ctx.rotate((motion.rotation * Math.PI) / 180);
    }
    if (motion.scaleX !== 1 || motion.scaleY !== 1) {
      ctx.scale(motion.scaleX, motion.scaleY);
    }

    if (el.type === 'procedural') {
      const procCanvas = renderProceduralToCanvas(
        el.procedural,
        el.width,
        el.height,
      );
      ctx.globalCompositeOperation =
        !el.procedural.blendMode || el.procedural.blendMode === 'normal'
          ? 'source-over'
          : el.procedural.blendMode;
      ctx.drawImage(procCanvas, 0, 0, el.width, el.height);
    } else if (el.type === 'photo') {
      const img = el.photoId ? loadedImages[el.photoId] : undefined;
      const effectiveAdj = combinePresetAndAdjustments(
        el.filterPreset,
        el.presetIntensity,
        el.adjustments,
      );
      const source: CanvasImageSource | undefined = img
        ? isIdentityAdjustments(effectiveAdj)
          ? img
          : renderFilteredCanvas(img, effectiveAdj)
        : undefined;

      if (el.frameBackground && el.frameBackground !== 'transparent') {
        ctx.fillStyle = el.frameBackground;
        traceOuterFramePath(
          ctx,
          el.frameShape,
          el.width,
          el.height,
          el.cornerRadius ?? 0,
        );
        ctx.fill();
      }

      if (source && img) {
        ctx.save();
        tracePhotoClipPath(
          ctx,
          el.frameShape,
          el.width,
          el.height,
          el.cornerRadius ?? 0,
        );
        ctx.clip();
        const win = getPhotoWindowRect(el.frameShape, el.width, el.height);
        const draw =
          el.crop || (el.frameShape && el.frameShape !== 'none')
            ? computeCoverImageDraw(
                win,
                img.naturalWidth || el.width,
                img.naturalHeight || el.height,
                el.crop,
              )
            : { x: 0, y: 0, width: el.width, height: el.height };
        ctx.drawImage(source, draw.x, draw.y, draw.width, draw.height);
        ctx.restore();
      }

      if (el.frameStroke && (el.frameStrokeWidth ?? 0) > 0) {
        ctx.strokeStyle = el.frameStroke;
        ctx.lineWidth = el.frameStrokeWidth!;
        traceOuterFramePath(
          ctx,
          el.frameShape,
          el.width,
          el.height,
          el.cornerRadius ?? 0,
        );
        ctx.stroke();
      }
    } else if (el.type === 'text') {
      const fontStyle =
        `${el.fontStyle === 'italic' ? 'italic ' : ''}${el.fontWeight === 'bold' ? 'bold ' : ''}${el.fontSize}px "${el.fontFamily}", sans-serif`;
      ctx.font = fontStyle;
      ctx.textBaseline = 'top';
      const lines = el.text.split('\n');
      const linePx = el.fontSize * (el.lineHeight || 1.3);
      const totalH = lines.length * linePx;

      if (el.backgroundColor && el.backgroundColor !== 'transparent') {
        const pad = el.backgroundPadding || 0;
        ctx.fillStyle = el.backgroundColor;
        ctx.beginPath();
        ctx.roundRect(
          -pad,
          -pad,
          el.width + pad * 2,
          totalH + pad * 2,
          el.backgroundRadius || 0,
        );
        ctx.fill();
      }

      ctx.fillStyle = el.fill;
      ctx.textAlign = el.align;
      const drawX =
        el.align === 'center'
          ? el.width / 2
          : el.align === 'right'
            ? el.width
            : 0;
      lines.forEach((line, i) => {
        ctx.fillText(line, drawX, i * linePx, el.width);
      });
    } else if (el.type === 'shape') {
      ctx.fillStyle = el.fill || 'transparent';
      ctx.strokeStyle = el.stroke || 'transparent';
      ctx.lineWidth = el.strokeWidth;
      ctx.beginPath();
      if (el.shapeType === 'circle') {
        ctx.arc(
          el.width / 2,
          el.height / 2,
          Math.min(el.width, el.height) / 2,
          0,
          Math.PI * 2,
        );
      } else if (el.shapeType === 'ellipse') {
        ctx.ellipse(
          el.width / 2,
          el.height / 2,
          el.width / 2,
          el.height / 2,
          0,
          0,
          Math.PI * 2,
        );
      } else if (el.shapeType === 'rounded-rect') {
        ctx.roundRect(0, 0, el.width, el.height, el.cornerRadius || 16);
      } else {
        ctx.rect(0, 0, el.width, el.height);
      }
      if (el.fill && el.fill !== 'transparent') ctx.fill();
      if (el.stroke && el.strokeWidth > 0) ctx.stroke();
    } else if (el.type === 'line') {
      ctx.strokeStyle = el.stroke;
      ctx.lineWidth = el.strokeWidth;
      if (el.lineType === 'dashed') ctx.setLineDash([12, 6]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(el.length, 0);
      ctx.stroke();
    }

    ctx.restore();
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        canvas.width = 0;
        canvas.height = 0;
        if (blob) resolve(blob);
        else reject(new Error('Gagal menghasilkan gambar offscreen.'));
      },
      format === 'jpeg' ? 'image/jpeg' : 'image/png',
      format === 'jpeg' ? quality : undefined,
    );
  });
}

export async function runMultiFormatBatchExport(params: {
  projectName: string;
  elements: CanvasElement[];
  backgroundColor: string;
  sourceWidth: number;
  sourceHeight: number;
  activeLayoutId?: string;
  photosById: Record<string, UploadedPhoto>;
  presets: CanvasPresetId[];
  format: ExportFormat;
  quality: number;
  slideSuffix?: string;
  onProgress?: (done: number, total: number, label: string) => void;
}): Promise<{ succeeded: number; failed: string[] }> {
  const safeBase =
    params.projectName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-') || 'frame-project';
  const ext = params.format === 'jpeg' ? 'jpg' : 'png';
  const failed: string[] = [];
  let succeeded = 0;

  for (let i = 0; i < params.presets.length; i++) {
    const presetId = params.presets[i];
    const preset = getCanvasPreset(presetId);
    params.onProgress?.(i, params.presets.length, preset.label);

    try {
      const adapted = adaptElementsToCanvasSize(
        params.elements,
        params.sourceWidth,
        params.sourceHeight,
        preset.width,
        preset.height,
        params.activeLayoutId,
        undefined,
        params.photosById,
      );

      const blob = await renderSnapshotOffscreenToBlob(
        adapted,
        params.backgroundColor,
        preset.width,
        preset.height,
        params.photosById,
        params.format,
        params.quality,
      );

      const suffix = params.slideSuffix ? `-${params.slideSuffix}` : '';
      downloadBlob(blob, `${safeBase}${suffix}-${preset.id}.${ext}`);
      succeeded += 1;
      await new Promise((r) => window.setTimeout(r, 180));
    } catch {
      failed.push(preset.label);
    }
  }

  params.onProgress?.(params.presets.length, params.presets.length, 'Selesai');
  return { succeeded, failed };
}

export function isWebMExportSupported(): boolean {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return false;
  }
  const probe = document.createElement('canvas');
  return typeof probe.captureStream === 'function';
}

/**
 * Deterministic WebM Video Export using canvas.captureStream(30) + MediaRecorder.
 */
export async function exportMotionToWebM(params: {
  elements: CanvasElement[];
  backgroundColor: string;
  width: number;
  height: number;
  photosById: Record<string, UploadedPhoto>;
  durationSec?: number;
  onProgress?: (progress01: number) => void;
}): Promise<Blob> {
  if (!isWebMExportSupported()) {
    throw new Error(
      'Browser ini tidak mendukung MediaRecorder atau canvas.captureStream untuk ekspor WebM.',
    );
  }

  const durationSec = Math.max(1, Math.min(5, params.durationSec ?? 5));
  const mimeCandidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  const mimeType =
    mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';

  const canvas = document.createElement('canvas');
  canvas.width = params.width || CANVAS_WIDTH;
  canvas.height = params.height || CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Gagal membuat canvas video.');

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(
    stream,
    mimeType ? { mimeType } : undefined,
  );
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const stopPromise = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      canvas.width = 0;
      canvas.height = 0;
      resolve(new Blob(chunks, { type: mimeType || 'video/webm' }));
    };
    recorder.onerror = () => {
      stream.getTracks().forEach((t) => t.stop());
      canvas.width = 0;
      canvas.height = 0;
      reject(new Error('Perekaman video WebM gagal.'));
    };
  });

  recorder.start();
  const totalFrames = Math.round(durationSec * 30);

  for (let frame = 0; frame <= totalFrames; frame++) {
    const t = (frame / totalFrames) * durationSec;
    const frameBlob = await renderSnapshotOffscreenToBlob(
      params.elements,
      params.backgroundColor,
      canvas.width,
      canvas.height,
      params.photosById,
      'png',
      1,
      t,
    );
    const url = URL.createObjectURL(frameBlob);
    const img = await loadImageElement(url);
    URL.revokeObjectURL(url);
    if (img) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    params.onProgress?.(frame / totalFrames);
    await new Promise((r) => window.setTimeout(r, 30));
  }

  recorder.stop();
  return stopPromise;
}

// Keep Konva imported cleanly for Stage types
export type KonvaStageRef = Konva.Stage;
