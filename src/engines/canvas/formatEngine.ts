import { generateSmartLayoutElements } from '../../features/story-creator/utils/smartLayoutEngine.ts';
import type {
  AppliedSmartLayoutState,
  CanvasElement,
  CanvasPhotoElement,
  CanvasPresetId,
  UploadedPhoto,
} from '../../types/studio.ts';

export interface CanvasPresetDefinition {
  id: CanvasPresetId;
  label: string;
  ratioLabel: string;
  width: number;
  height: number;
}

export const CANVAS_PRESETS: CanvasPresetDefinition[] = [
  {
    id: 'story-9-16',
    label: 'Story 9:16',
    ratioLabel: '9:16',
    width: 1080,
    height: 1920,
  },
  {
    id: 'square-1-1',
    label: 'Square 1:1',
    ratioLabel: '1:1',
    width: 1080,
    height: 1080,
  },
  {
    id: 'portrait-4-5',
    label: 'Portrait 4:5',
    ratioLabel: '4:5',
    width: 1080,
    height: 1350,
  },
  {
    id: 'landscape-16-9',
    label: 'Landscape 16:9',
    ratioLabel: '16:9',
    width: 1920,
    height: 1080,
  },
  {
    id: 'poster-a4',
    label: 'Poster A4',
    ratioLabel: 'A4',
    width: 1240,
    height: 1754,
  },
  {
    id: 'custom',
    label: 'Custom',
    ratioLabel: 'Custom',
    width: 1080,
    height: 1920,
  },
];

export const MIN_CANVAS_DIM = 320;
export const MAX_CANVAS_DIM = 4096;

export function getCanvasPreset(id?: CanvasPresetId): CanvasPresetDefinition {
  return (
    CANVAS_PRESETS.find((p) => p.id === (id ?? 'story-9-16')) ??
    CANVAS_PRESETS[0]
  );
}

export function sanitizeCanvasDimensions(
  width: number,
  height: number,
): { width: number; height: number } {
  const safeW = Number.isFinite(width) && width > 0 ? width : 1080;
  const safeH = Number.isFinite(height) && height > 0 ? height : 1920;
  return {
    width: Math.max(MIN_CANVAS_DIM, Math.min(MAX_CANVAS_DIM, Math.round(safeW))),
    height: Math.max(MIN_CANVAS_DIM, Math.min(MAX_CANVAS_DIM, Math.round(safeH))),
  };
}

function getElementBounds(el: CanvasElement): { w: number; h: number } {
  if (el.type === 'line') {
    return { w: Math.max(1, el.length), h: Math.max(1, el.strokeWidth) };
  }
  if (el.type === 'text') {
    return {
      w: Math.max(1, el.width),
      h: Math.max(1, el.fontSize * (el.lineHeight || 1.3)),
    };
  }
  return { w: Math.max(1, el.width), h: Math.max(1, el.height) };
}

function isFullBleedElement(
  el: CanvasElement,
  oldW: number,
  oldH: number,
): boolean {
  if (el.type === 'line' || el.type === 'text') return false;
  const nearOrigin =
    Math.abs(el.x) <= oldW * 0.03 && Math.abs(el.y) <= oldH * 0.03;
  const areaRatio = (el.width * el.height) / Math.max(1, oldW * oldH);
  return nearOrigin && areaRatio >= 0.95;
}

/**
 * Intelligently adapts canvas elements when changing canvas dimensions/aspect ratio.
 * Handles Full-Bleed elements, Smart Layout slots, and Free elements safely.
 */
export function adaptElementsToCanvasSize(
  elements: CanvasElement[],
  rawOldW: number,
  rawOldH: number,
  rawNewW: number,
  rawNewH: number,
  activeLayoutId?: string,
  activeLayout?: AppliedSmartLayoutState,
  photosById: Record<string, UploadedPhoto> = {},
): CanvasElement[] {
  const { width: oldW, height: oldH } = sanitizeCanvasDimensions(
    rawOldW,
    rawOldH,
  );
  const { width: newW, height: newH } = sanitizeCanvasDimensions(
    rawNewW,
    rawNewH,
  );

  if (oldW === newW && oldH === newH) {
    return elements.map((el) => ({ ...el }));
  }

  const scale = Math.min(newW / oldW, newH / oldH);

  // Pre-compute adapted Smart Layout slots if activeLayoutId is provided
  let adaptedSlotsByIndex: Map<number, CanvasPhotoElement> | null = null;
  if (activeLayoutId) {
    const existingSlots = elements.filter(
      (el): el is CanvasPhotoElement =>
        el.type === 'photo' && el.layoutSlotIndex !== undefined,
    );
    const layoutConfig: AppliedSmartLayoutState = activeLayout ?? {
      layoutId: activeLayoutId,
      photoIds: existingSlots
        .sort((a, b) => (a.layoutSlotIndex ?? 0) - (b.layoutSlotIndex ?? 0))
        .map((s) => s.photoId),
      spacing: 20,
      margin: 56,
      cornerRadius: 20,
    };
    const nextSlots = generateSmartLayoutElements(
      layoutConfig,
      photosById,
      existingSlots,
      newW,
      newH,
    );
    adaptedSlotsByIndex = new Map(
      nextSlots.map((slot) => [slot.layoutSlotIndex ?? 0, slot]),
    );
  }

  return elements.map((el) => {
    // 1. Smart Layout slot
    if (
      adaptedSlotsByIndex &&
      el.type === 'photo' &&
      el.layoutSlotIndex !== undefined
    ) {
      const recalculated = adaptedSlotsByIndex.get(el.layoutSlotIndex);
      if (recalculated) return recalculated;
    }

    // 2. Full-bleed element (>= 95% area & near 0,0)
    if (isFullBleedElement(el, oldW, oldH)) {
      return {
        ...el,
        x: 0,
        y: 0,
        width: newW,
        height: newH,
      } as CanvasElement;
    }

    // 3. Free elements: preserve relative center & proportional scale
    const { w, h } = getElementBounds(el);
    const cxNorm = (el.x + w / 2) / oldW;
    const cyNorm = (el.y + h / 2) / oldH;

    if (el.type === 'line') {
      const nextLength = Math.max(20, Math.round(el.length * scale));
      const nextX = Math.max(
        0,
        Math.min(newW - nextLength, Math.round(cxNorm * newW - nextLength / 2)),
      );
      const nextY = Math.max(
        0,
        Math.min(newH - 4, Math.round(cyNorm * newH)),
      );
      return {
        ...el,
        x: nextX,
        y: nextY,
        length: nextLength,
      };
    }

    if (el.type === 'text') {
      const nextFontSize = Math.max(14, Math.round(el.fontSize * scale));
      const nextWidth = Math.max(
        60,
        Math.min(newW - 24, Math.round(el.width * scale)),
      );
      const estH = nextFontSize * (el.lineHeight || 1.3);
      const nextX = Math.max(
        0,
        Math.min(newW - nextWidth, Math.round(cxNorm * newW - nextWidth / 2)),
      );
      const nextY = Math.max(
        0,
        Math.min(newH - estH, Math.round(cyNorm * newH - estH / 2)),
      );
      return {
        ...el,
        x: nextX,
        y: nextY,
        width: nextWidth,
        fontSize: nextFontSize,
      };
    }

    // Photo / Shape / Decorative / Procedural
    const nextW = Math.max(24, Math.round(el.width * scale));
    const nextH = Math.max(24, Math.round(el.height * scale));
    const clampedW = Math.min(newW, nextW);
    const clampedH = Math.min(newH, nextH);
    const nextX = Math.max(
      0,
      Math.min(newW - clampedW, Math.round(cxNorm * newW - clampedW / 2)),
    );
    const nextY = Math.max(
      0,
      Math.min(newH - clampedH, Math.round(cyNorm * newH - clampedH / 2)),
    );

    return {
      ...el,
      x: nextX,
      y: nextY,
      width: clampedW,
      height: clampedH,
    } as CanvasElement;
  });
}
