import type { FrameMaskKind, PhotoCropParams } from '@/types/studio';

export interface BoxRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameShapeDefinition {
  id: FrameMaskKind;
  label: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultRadius: number;
  defaultBackground: string;
  defaultStroke: string;
  defaultStrokeWidth: number;
}

export const FRAME_SHAPE_DEFINITIONS: FrameShapeDefinition[] = [
  {
    id: 'rect',
    label: 'Rectangle',
    defaultWidth: 680,
    defaultHeight: 860,
    defaultRadius: 0,
    defaultBackground: '#18181b',
    defaultStroke: '#ffffff',
    defaultStrokeWidth: 4,
  },
  {
    id: 'rounded-rect',
    label: 'Rounded Rect',
    defaultWidth: 680,
    defaultHeight: 860,
    defaultRadius: 40,
    defaultBackground: '#18181b',
    defaultStroke: '#ffffff',
    defaultStrokeWidth: 4,
  },
  {
    id: 'circle',
    label: 'Circle',
    defaultWidth: 640,
    defaultHeight: 640,
    defaultRadius: 0,
    defaultBackground: '#18181b',
    defaultStroke: '#ffffff',
    defaultStrokeWidth: 4,
  },
  {
    id: 'oval',
    label: 'Oval',
    defaultWidth: 600,
    defaultHeight: 820,
    defaultRadius: 0,
    defaultBackground: '#18181b',
    defaultStroke: '#ffffff',
    defaultStrokeWidth: 4,
  },
  {
    id: 'arch',
    label: 'Arch',
    defaultWidth: 640,
    defaultHeight: 920,
    defaultRadius: 16,
    defaultBackground: '#18181b',
    defaultStroke: '#ffffff',
    defaultStrokeWidth: 4,
  },
  {
    id: 'polaroid',
    label: 'Polaroid',
    defaultWidth: 680,
    defaultHeight: 860,
    defaultRadius: 12,
    defaultBackground: '#fafaf9',
    defaultStroke: '#e5e5e5',
    defaultStrokeWidth: 2,
  },
  {
    id: 'custom-ratio',
    label: 'Custom Ratio (4:5)',
    defaultWidth: 720,
    defaultHeight: 900,
    defaultRadius: 20,
    defaultBackground: '#18181b',
    defaultStroke: '#ffffff',
    defaultStrokeWidth: 3,
  },
];

export function getPhotoWindowRect(
  frameShape: FrameMaskKind | undefined,
  width: number,
  height: number,
): BoxRect {
  if (frameShape === 'polaroid') {
    const padSide = Math.round(Math.min(width, height) * 0.065);
    const padTop = padSide;
    const padBottom = Math.round(height * 0.2);
    return {
      x: padSide,
      y: padTop,
      width: Math.max(20, width - padSide * 2),
      height: Math.max(20, height - padTop - padBottom),
    };
  }
  return { x: 0, y: 0, width, height };
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  if (radius === 0) {
    ctx.rect(x, y, w, h);
    return;
  }
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Traces the outer frame path (used for frame background & outer border).
 */
export function traceOuterFramePath(
  ctx: CanvasRenderingContext2D,
  frameShape: FrameMaskKind | undefined,
  width: number,
  height: number,
  cornerRadius = 0,
) {
  const shape = frameShape ?? 'none';

  switch (shape) {
    case 'circle': {
      const r = Math.min(width, height) / 2;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
      ctx.closePath();
      break;
    }
    case 'oval': {
      ctx.beginPath();
      ctx.ellipse(
        width / 2,
        height / 2,
        width / 2,
        height / 2,
        0,
        0,
        Math.PI * 2,
      );
      ctx.closePath();
      break;
    }
    case 'arch': {
      const archR = Math.min(width / 2, height * 0.48);
      const cx = width / 2;
      const left = cx - archR;
      const right = cx + archR;
      const bottomR = Math.min(cornerRadius, archR * 0.25, 24);
      ctx.beginPath();
      ctx.arc(cx, archR, archR, Math.PI, 0, false);
      if (bottomR > 0) {
        ctx.lineTo(right, height - bottomR);
        ctx.quadraticCurveTo(right, height, right - bottomR, height);
        ctx.lineTo(left + bottomR, height);
        ctx.quadraticCurveTo(left, height, left, height - bottomR);
      } else {
        ctx.lineTo(right, height);
        ctx.lineTo(left, height);
      }
      ctx.closePath();
      break;
    }
    case 'polaroid': {
      drawRoundedRectPath(ctx, 0, 0, width, height, cornerRadius || 12);
      break;
    }
    case 'rounded-rect': {
      drawRoundedRectPath(ctx, 0, 0, width, height, cornerRadius || 36);
      break;
    }
    case 'custom-ratio':
    case 'rect':
    case 'none':
    default: {
      drawRoundedRectPath(ctx, 0, 0, width, height, cornerRadius);
      break;
    }
  }
}

/**
 * Traces the inner photo clipping path (identical to outer path except for Polaroid).
 */
export function tracePhotoClipPath(
  ctx: CanvasRenderingContext2D,
  frameShape: FrameMaskKind | undefined,
  width: number,
  height: number,
  cornerRadius = 0,
) {
  if (frameShape === 'polaroid') {
    const win = getPhotoWindowRect('polaroid', width, height);
    drawRoundedRectPath(ctx, win.x, win.y, win.width, win.height, 6);
    return;
  }
  traceOuterFramePath(ctx, frameShape, width, height, cornerRadius);
}

/**
 * Non-destructive cover-fit draw calculation inside a window box.
 */
export function computeCoverImageDraw(
  win: BoxRect,
  naturalWidth: number,
  naturalHeight: number,
  crop?: PhotoCropParams,
): BoxRect {
  const safeNatW = Math.max(1, naturalWidth);
  const safeNatH = Math.max(1, naturalHeight);
  const zoom = Math.max(1, crop?.zoom ?? 1);
  const offsetX = Math.max(-1, Math.min(1, crop?.offsetX ?? 0));
  const offsetY = Math.max(-1, Math.min(1, crop?.offsetY ?? 0));

  const coverScale =
    Math.max(win.width / safeNatW, win.height / safeNatH) * zoom;
  const drawW = safeNatW * coverScale;
  const drawH = safeNatH * coverScale;

  const maxPanX = Math.max(0, (drawW - win.width) / 2);
  const maxPanY = Math.max(0, (drawH - win.height) / 2);

  const x = win.x + (win.width - drawW) / 2 + offsetX * maxPanX;
  const y = win.y + (win.height - drawH) / 2 + offsetY * maxPanY;

  return { x, y, width: drawW, height: drawH };
}
