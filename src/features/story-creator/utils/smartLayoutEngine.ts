import {
  type AppliedSmartLayoutState,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  type CanvasPhotoElement,
  type FrameMaskKind,
  type UploadedPhoto,
} from '@/types/studio';

export type SmartLayoutCategory = 'Minimal' | 'Grid' | 'Editorial' | 'Collage';

/**
 * Normalized slot inside the active Safe/Content box (0..1 coordinates)
 * so both Canvas generation AND lightweight Gallery SVG previews share the EXACT same geometry!
 */
export interface NormalizedSlot {
  nx: number; // 0..1
  ny: number; // 0..1
  nw: number; // 0..1
  nh: number; // 0..1
  frameShape?: FrameMaskKind;
}

export interface SmartLayoutDefinition {
  id: string;
  name: string;
  photoCount: 1 | 2 | 3 | 4 | 5 | 6;
  category: SmartLayoutCategory;
  fullBleed?: boolean;
  defaultMargin: number;
  defaultSpacing: number;
  defaultCornerRadius: number;
  /**
   * Computes pixel-accurate or normalized slots given fractional gap gx, gy (0..1).
   */
  computeSlots: (gx: number, gy: number) => NormalizedSlot[];
}

const SAFE_TOP_RATIO = 0.14; // 268.8 px
const SAFE_BOTTOM_RATIO = 0.14;

export const SMART_LAYOUTS: SmartLayoutDefinition[] = [
  // ================= 1 PHOTO (3 Variations) =================
  {
    id: 'single-full-bleed',
    name: 'Single Photo Full Bleed',
    photoCount: 1,
    category: 'Minimal',
    fullBleed: true,
    defaultMargin: 0,
    defaultSpacing: 0,
    defaultCornerRadius: 0,
    computeSlots: () => [{ nx: 0, ny: 0, nw: 1, nh: 1, frameShape: 'rect' }],
  },
  {
    id: 'single-framed',
    name: 'Single Photo Framed',
    photoCount: 1,
    category: 'Minimal',
    defaultMargin: 72,
    defaultSpacing: 0,
    defaultCornerRadius: 28,
    computeSlots: () => [
      { nx: 0, ny: 0.04, nw: 1, nh: 0.92, frameShape: 'rounded-rect' },
    ],
  },
  {
    id: 'single-polaroid',
    name: 'Single Photo Polaroid',
    photoCount: 1,
    category: 'Editorial',
    defaultMargin: 110,
    defaultSpacing: 0,
    defaultCornerRadius: 14,
    computeSlots: () => [
      { nx: 0.04, ny: 0.1, nw: 0.92, nh: 0.78, frameShape: 'polaroid' },
    ],
  },

  // ================= 2 PHOTOS (3 Variations) =================
  {
    id: 'two-vertical-split',
    name: 'Two Photo Vertical Split',
    photoCount: 2,
    category: 'Grid',
    defaultMargin: 56,
    defaultSpacing: 20,
    defaultCornerRadius: 24,
    computeSlots: (gx) => {
      const w = (1 - gx) / 2;
      return [
        { nx: 0, ny: 0.06, nw: w, nh: 0.88, frameShape: 'rounded-rect' },
        { nx: w + gx, ny: 0.06, nw: w, nh: 0.88, frameShape: 'rounded-rect' },
      ];
    },
  },
  {
    id: 'two-horizontal-split',
    name: 'Two Photo Horizontal Split',
    photoCount: 2,
    category: 'Grid',
    defaultMargin: 56,
    defaultSpacing: 20,
    defaultCornerRadius: 24,
    computeSlots: (_gx, gy) => {
      const h = (1 - gy) / 2;
      return [
        { nx: 0, ny: 0, nw: 1, nh: h, frameShape: 'rounded-rect' },
        { nx: 0, ny: h + gy, nw: 1, nh: h, frameShape: 'rounded-rect' },
      ];
    },
  },
  {
    id: 'two-editorial',
    name: 'Two Photo Editorial',
    photoCount: 2,
    category: 'Editorial',
    defaultMargin: 64,
    defaultSpacing: 24,
    defaultCornerRadius: 20,
    computeSlots: (_gx, gy) => {
      const topH = 0.62 - gy / 2;
      const botH = 0.38 - gy / 2;
      return [
        { nx: 0, ny: 0, nw: 0.88, nh: topH, frameShape: 'rounded-rect' },
        {
          nx: 0.18,
          ny: topH + gy,
          nw: 0.82,
          nh: botH,
          frameShape: 'rounded-rect',
        },
      ];
    },
  },

  // ================= 3 PHOTOS (3 Variations) =================
  {
    id: 'three-grid',
    name: 'Three Photo Grid',
    photoCount: 3,
    category: 'Grid',
    defaultMargin: 56,
    defaultSpacing: 18,
    defaultCornerRadius: 20,
    computeSlots: (_gx, gy) => {
      const h = (1 - gy * 2) / 3;
      return [
        { nx: 0, ny: 0, nw: 1, nh: h, frameShape: 'rounded-rect' },
        { nx: 0, ny: h + gy, nw: 1, nh: h, frameShape: 'rounded-rect' },
        { nx: 0, ny: (h + gy) * 2, nw: 1, nh: h, frameShape: 'rounded-rect' },
      ];
    },
  },
  {
    id: 'three-editorial',
    name: 'Three Photo Editorial',
    photoCount: 3,
    category: 'Editorial',
    defaultMargin: 56,
    defaultSpacing: 20,
    defaultCornerRadius: 22,
    computeSlots: (gx, gy) => {
      const topH = 0.58 - gy / 2;
      const botH = 0.42 - gy / 2;
      const colW = (1 - gx) / 2;
      return [
        { nx: 0, ny: 0, nw: 1, nh: topH, frameShape: 'rounded-rect' },
        {
          nx: 0,
          ny: topH + gy,
          nw: colW,
          nh: botH,
          frameShape: 'rounded-rect',
        },
        {
          nx: colW + gx,
          ny: topH + gy,
          nw: colW,
          nh: botH,
          frameShape: 'rounded-rect',
        },
      ];
    },
  },
  {
    id: 'three-triptych',
    name: 'Three Photo Asymmetric',
    photoCount: 3,
    category: 'Collage',
    defaultMargin: 56,
    defaultSpacing: 18,
    defaultCornerRadius: 20,
    computeSlots: (gx, gy) => {
      const leftW = 0.54 - gx / 2;
      const rightW = 0.46 - gx / 2;
      const rightH = (1 - gy) / 2;
      return [
        { nx: 0, ny: 0, nw: leftW, nh: 1, frameShape: 'rounded-rect' },
        {
          nx: leftW + gx,
          ny: 0,
          nw: rightW,
          nh: rightH,
          frameShape: 'rounded-rect',
        },
        {
          nx: leftW + gx,
          ny: rightH + gy,
          nw: rightW,
          nh: rightH,
          frameShape: 'rounded-rect',
        },
      ];
    },
  },

  // ================= 4 PHOTOS (3 Variations) =================
  {
    id: 'four-grid',
    name: 'Four Photo Grid',
    photoCount: 4,
    category: 'Grid',
    defaultMargin: 56,
    defaultSpacing: 18,
    defaultCornerRadius: 20,
    computeSlots: (gx, gy) => {
      const w = (1 - gx) / 2;
      const h = (1 - gy) / 2;
      return [
        { nx: 0, ny: 0, nw: w, nh: h, frameShape: 'rounded-rect' },
        { nx: w + gx, ny: 0, nw: w, nh: h, frameShape: 'rounded-rect' },
        { nx: 0, ny: h + gy, nw: w, nh: h, frameShape: 'rounded-rect' },
        { nx: w + gx, ny: h + gy, nw: w, nh: h, frameShape: 'rounded-rect' },
      ];
    },
  },
  {
    id: 'four-asymmetric',
    name: 'Four Photo Asymmetric',
    photoCount: 4,
    category: 'Editorial',
    defaultMargin: 56,
    defaultSpacing: 18,
    defaultCornerRadius: 20,
    computeSlots: (gx, gy) => {
      const topH = 0.52 - gy / 2;
      const botH = 0.48 - gy / 2;
      const colW = (1 - gx * 2) / 3;
      return [
        { nx: 0, ny: 0, nw: 1, nh: topH, frameShape: 'rounded-rect' },
        {
          nx: 0,
          ny: topH + gy,
          nw: colW,
          nh: botH,
          frameShape: 'rounded-rect',
        },
        {
          nx: colW + gx,
          ny: topH + gy,
          nw: colW,
          nh: botH,
          frameShape: 'rounded-rect',
        },
        {
          nx: (colW + gx) * 2,
          ny: topH + gy,
          nw: colW,
          nh: botH,
          frameShape: 'rounded-rect',
        },
      ];
    },
  },
  {
    id: 'four-mosaic',
    name: 'Four Photo Editorial Mosaic',
    photoCount: 4,
    category: 'Collage',
    defaultMargin: 56,
    defaultSpacing: 18,
    defaultCornerRadius: 22,
    computeSlots: (gx, gy) => {
      const w = (1 - gx) / 2;
      const tall = 0.58 - gy / 2;
      const short = 0.42 - gy / 2;
      return [
        { nx: 0, ny: 0, nw: w, nh: tall, frameShape: 'rounded-rect' },
        { nx: w + gx, ny: 0, nw: w, nh: short, frameShape: 'rounded-rect' },
        { nx: 0, ny: tall + gy, nw: w, nh: short, frameShape: 'rounded-rect' },
        {
          nx: w + gx,
          ny: short + gy,
          nw: w,
          nh: tall,
          frameShape: 'rounded-rect',
        },
      ];
    },
  },

  // ================= 5 PHOTOS (3 Variations) =================
  {
    id: 'five-collage',
    name: 'Five Photo Collage',
    photoCount: 5,
    category: 'Collage',
    defaultMargin: 52,
    defaultSpacing: 16,
    defaultCornerRadius: 18,
    computeSlots: (gx, gy) => {
      const colW = (1 - gx) / 2;
      const topH = (1 - gy * 2) * 0.3;
      const midH = (1 - gy * 2) * 0.4;
      const botH = (1 - gy * 2) * 0.3;
      return [
        { nx: 0, ny: 0, nw: colW, nh: topH, frameShape: 'rounded-rect' },
        { nx: colW + gx, ny: 0, nw: colW, nh: topH, frameShape: 'rounded-rect' },
        { nx: 0, ny: topH + gy, nw: 1, nh: midH, frameShape: 'rounded-rect' },
        {
          nx: 0,
          ny: topH + midH + gy * 2,
          nw: colW,
          nh: botH,
          frameShape: 'rounded-rect',
        },
        {
          nx: colW + gx,
          ny: topH + midH + gy * 2,
          nw: colW,
          nh: botH,
          frameShape: 'rounded-rect',
        },
      ];
    },
  },
  {
    id: 'five-editorial',
    name: 'Five Photo Editorial',
    photoCount: 5,
    category: 'Editorial',
    defaultMargin: 52,
    defaultSpacing: 16,
    defaultCornerRadius: 18,
    computeSlots: (gx, gy) => {
      const topH = 0.44 - gy / 2;
      const remH = 0.56 - gy / 2;
      const cellH = (remH - gy) / 2;
      const colW = (1 - gx) / 2;
      const y1 = topH + gy;
      const y2 = y1 + cellH + gy;
      return [
        { nx: 0, ny: 0, nw: 1, nh: topH, frameShape: 'rounded-rect' },
        { nx: 0, ny: y1, nw: colW, nh: cellH, frameShape: 'rounded-rect' },
        {
          nx: colW + gx,
          ny: y1,
          nw: colW,
          nh: cellH,
          frameShape: 'rounded-rect',
        },
        { nx: 0, ny: y2, nw: colW, nh: cellH, frameShape: 'rounded-rect' },
        {
          nx: colW + gx,
          ny: y2,
          nw: colW,
          nh: cellH,
          frameShape: 'rounded-rect',
        },
      ];
    },
  },
  {
    id: 'five-asymmetric',
    name: 'Five Photo Asymmetric',
    photoCount: 5,
    category: 'Grid',
    defaultMargin: 52,
    defaultSpacing: 16,
    defaultCornerRadius: 18,
    computeSlots: (gx, gy) => {
      const colW = (1 - gx) / 2;
      const leftH = (1 - gy) / 2;
      const rightH = (1 - gy * 2) / 3;
      return [
        { nx: 0, ny: 0, nw: colW, nh: leftH, frameShape: 'rounded-rect' },
        {
          nx: 0,
          ny: leftH + gy,
          nw: colW,
          nh: leftH,
          frameShape: 'rounded-rect',
        },
        {
          nx: colW + gx,
          ny: 0,
          nw: colW,
          nh: rightH,
          frameShape: 'rounded-rect',
        },
        {
          nx: colW + gx,
          ny: rightH + gy,
          nw: colW,
          nh: rightH,
          frameShape: 'rounded-rect',
        },
        {
          nx: colW + gx,
          ny: (rightH + gy) * 2,
          nw: colW,
          nh: rightH,
          frameShape: 'rounded-rect',
        },
      ];
    },
  },

  // ================= 6 PHOTOS (3 Variations) =================
  {
    id: 'six-grid',
    name: 'Six Photo Grid',
    photoCount: 6,
    category: 'Grid',
    defaultMargin: 52,
    defaultSpacing: 16,
    defaultCornerRadius: 16,
    computeSlots: (gx, gy) => {
      const colW = (1 - gx) / 2;
      const rowH = (1 - gy * 2) / 3;
      return [0, 1, 2].flatMap((row) => [
        {
          nx: 0,
          ny: row * (rowH + gy),
          nw: colW,
          nh: rowH,
          frameShape: 'rounded-rect' as FrameMaskKind,
        },
        {
          nx: colW + gx,
          ny: row * (rowH + gy),
          nw: colW,
          nh: rowH,
          frameShape: 'rounded-rect' as FrameMaskKind,
        },
      ]);
    },
  },
  {
    id: 'six-editorial-collage',
    name: 'Six Photo Editorial Collage',
    photoCount: 6,
    category: 'Editorial',
    defaultMargin: 52,
    defaultSpacing: 16,
    defaultCornerRadius: 16,
    computeSlots: (gx, gy) => {
      const availH = 1 - gy * 2;
      const h1 = availH * 0.4;
      const h2 = availH * 0.32;
      const h3 = availH * 0.28;
      const w2 = (1 - gx) / 2;
      const w3 = (1 - gx * 2) / 3;
      const y2 = h1 + gy;
      const y3 = y2 + h2 + gy;
      return [
        { nx: 0, ny: 0, nw: 1, nh: h1, frameShape: 'rounded-rect' },
        { nx: 0, ny: y2, nw: w2, nh: h2, frameShape: 'rounded-rect' },
        { nx: w2 + gx, ny: y2, nw: w2, nh: h2, frameShape: 'rounded-rect' },
        { nx: 0, ny: y3, nw: w3, nh: h3, frameShape: 'rounded-rect' },
        { nx: w3 + gx, ny: y3, nw: w3, nh: h3, frameShape: 'rounded-rect' },
        {
          nx: (w3 + gx) * 2,
          ny: y3,
          nw: w3,
          nh: h3,
          frameShape: 'rounded-rect',
        },
      ];
    },
  },
  {
    id: 'six-mosaic',
    name: 'Six Photo Mosaic',
    photoCount: 6,
    category: 'Collage',
    defaultMargin: 52,
    defaultSpacing: 16,
    defaultCornerRadius: 18,
    computeSlots: (gx, gy) => {
      const rowH = (1 - gy * 2) / 3;
      const wide = (1 - gx) * 0.62;
      const narrow = (1 - gx) * 0.38;
      const half = (1 - gx) / 2;
      return [
        { nx: 0, ny: 0, nw: wide, nh: rowH, frameShape: 'rounded-rect' },
        {
          nx: wide + gx,
          ny: 0,
          nw: narrow,
          nh: rowH,
          frameShape: 'rounded-rect',
        },
        {
          nx: 0,
          ny: rowH + gy,
          nw: narrow,
          nh: rowH,
          frameShape: 'rounded-rect',
        },
        {
          nx: narrow + gx,
          ny: rowH + gy,
          nw: wide,
          nh: rowH,
          frameShape: 'rounded-rect',
        },
        {
          nx: 0,
          ny: (rowH + gy) * 2,
          nw: half,
          nh: rowH,
          frameShape: 'rounded-rect',
        },
        {
          nx: half + gx,
          ny: (rowH + gy) * 2,
          nw: half,
          nh: rowH,
          frameShape: 'rounded-rect',
        },
      ];
    },
  },
];

export type PhotoOrientation = 'portrait' | 'landscape' | 'square';

export function getPhotoOrientation(photo: UploadedPhoto): PhotoOrientation {
  const ratio = photo.naturalWidth / Math.max(1, photo.naturalHeight);
  if (ratio < 0.88) return 'portrait';
  if (ratio > 1.12) return 'landscape';
  return 'square';
}

/**
 * Deterministic rule-based layout recommendation score based on photo orientations,
 * aspect ratios, and resolution metadata.
 */
export function scoreLayoutForPhotos(
  layout: SmartLayoutDefinition,
  photos: UploadedPhoto[],
): number {
  if (photos.length === 0 || layout.photoCount !== photos.length) return 0;

  const contentW = CANVAS_WIDTH - layout.defaultMargin * 2;
  const contentH = layout.fullBleed
    ? CANVAS_HEIGHT - layout.defaultMargin * 2
    : CANVAS_HEIGHT * (1 - SAFE_TOP_RATIO - SAFE_BOTTOM_RATIO);

  const gx = layout.defaultSpacing / Math.max(1, contentW);
  const gy = layout.defaultSpacing / Math.max(1, contentH);
  const slots = layout.computeSlots(gx, gy);

  // Pair sorted photo aspect ratios with sorted slot aspect ratios to measure fit harmony
  const photoRatios = photos
    .map((p) => p.naturalWidth / Math.max(1, p.naturalHeight))
    .sort((a, b) => a - b);
  const slotRatios = slots
    .map((s) => (s.nw * contentW) / Math.max(1, s.nh * contentH))
    .sort((a, b) => a - b);

  let totalLogDiff = 0;
  for (let i = 0; i < slots.length; i++) {
    const pr = photoRatios[i] ?? 1;
    const sr = slotRatios[i] ?? 1;
    totalLogDiff += Math.abs(Math.log(pr / sr));
  }

  return 100 - (totalLogDiff / slots.length) * 40;
}

/**
 * Assigns photos to slots so portrait photos prefer tall slots, landscape photos prefer wide slots,
 * and higher-resolution photos prefer larger hero slots.
 */
export function matchPhotosToLayoutSlots(
  layout: SmartLayoutDefinition,
  photos: UploadedPhoto[],
): string[] {
  const selected = photos.slice(0, layout.photoCount);
  if (selected.length <= 1) return selected.map((p) => p.id);

  const contentW = CANVAS_WIDTH - layout.defaultMargin * 2;
  const contentH = layout.fullBleed
    ? CANVAS_HEIGHT - layout.defaultMargin * 2
    : CANVAS_HEIGHT * (1 - SAFE_TOP_RATIO - SAFE_BOTTOM_RATIO);
  const gx = layout.defaultSpacing / Math.max(1, contentW);
  const gy = layout.defaultSpacing / Math.max(1, contentH);
  const slots = layout.computeSlots(gx, gy);

  const remaining = [...selected];
  const result: string[] = new Array(slots.length).fill('');

  // Fill slots largest-area first so hero slots get high-res, matching-orientation photos
  const slotOrder = slots
    .map((s, idx) => ({ idx, area: s.nw * s.nh, ratio: (s.nw * contentW) / Math.max(1, s.nh * contentH) }))
    .sort((a, b) => b.area - a.area);

  for (const slot of slotOrder) {
    let bestIdx = 0;
    let bestCost = Number.POSITIVE_INFINITY;
    for (let i = 0; i < remaining.length; i++) {
      const p = remaining[i];
      const pr = p.naturalWidth / Math.max(1, p.naturalHeight);
      const ratioDiff = Math.abs(Math.log(pr / slot.ratio));
      const resBonus = (p.naturalWidth * p.naturalHeight) / 20_000_000;
      const cost = ratioDiff - slot.area * resBonus * 0.15;
      if (cost < bestCost) {
        bestCost = cost;
        bestIdx = i;
      }
    }
    const [picked] = remaining.splice(bestIdx, 1);
    if (picked) result[slot.idx] = picked.id;
  }

  return result;
}

/**
 * Generates pixel-accurate CanvasPhotoElement[] for an AppliedSmartLayoutState.
 */
export function generateSmartLayoutElements(
  config: AppliedSmartLayoutState,
  photosById: Record<string, UploadedPhoto>,
  existingSlotElements?: CanvasPhotoElement[],
  canvasWidth = CANVAS_WIDTH,
  canvasHeight = CANVAS_HEIGHT,
): CanvasPhotoElement[] {
  const layout =
    SMART_LAYOUTS.find((l) => l.id === config.layoutId) ?? SMART_LAYOUTS[0];

  const safeW = Math.max(320, Math.round(Number.isFinite(canvasWidth) ? canvasWidth : CANVAS_WIDTH));
  const safeH = Math.max(320, Math.round(Number.isFinite(canvasHeight) ? canvasHeight : CANVAS_HEIGHT));

  const margin = Math.max(0, Math.min(160, config.margin));
  const spacing = Math.max(0, Math.min(80, config.spacing));
  const cornerRadius = Math.max(0, Math.min(100, config.cornerRadius));

  const isPortraitStory = safeH / safeW > 1.5;
  const topInset = layout.fullBleed
    ? margin
    : isPortraitStory
      ? Math.max(margin, Math.round(safeH * SAFE_TOP_RATIO))
      : margin;
  const bottomInset = layout.fullBleed
    ? margin
    : isPortraitStory
      ? Math.max(margin, Math.round(safeH * SAFE_BOTTOM_RATIO))
      : margin;

  const boxX = margin;
  const boxY = topInset;
  const boxW = Math.max(200, safeW - margin * 2);
  const boxH = Math.max(200, safeH - topInset - bottomInset);

  const gx = spacing / boxW;
  const gy = spacing / boxH;
  const slots = layout.computeSlots(gx, gy);

  return slots.map((slot, index) => {
    const photoId = config.photoIds[index] ?? '';
    const photo = photoId ? photosById[photoId] : undefined;
    const prevEl = existingSlotElements?.find(
      (el) => el.layoutSlotIndex === index,
    );

    const x = Math.round(boxX + slot.nx * boxW);
    const y = Math.round(boxY + slot.ny * boxH);
    const width = Math.max(40, Math.round(slot.nw * boxW));
    const height = Math.max(40, Math.round(slot.nh * boxH));

    const shape: FrameMaskKind =
      slot.frameShape === 'polaroid'
        ? 'polaroid'
        : cornerRadius > 0
          ? 'rounded-rect'
          : 'rect';

    return {
      id:
        prevEl?.id ??
        `slot-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'photo',
      name: photo ? `Slot ${index + 1} · ${photo.name}` : `Slot Foto ${index + 1}`,
      photoId,
      x,
      y,
      width,
      height,
      rotation: 0,
      opacity: prevEl?.opacity ?? 1,
      visible: prevEl?.visible ?? true,
      locked: false,
      keepAspectRatio: false,
      crop:
        prevEl && prevEl.photoId === photoId
          ? prevEl.crop ?? { zoom: 1, offsetX: 0, offsetY: 0 }
          : { zoom: 1, offsetX: 0, offsetY: 0 },
      frameShape: shape,
      cornerRadius,
      frameBackground: shape === 'polaroid' ? '#fafaf9' : '#18181b',
      frameStroke: prevEl?.frameStroke ?? '',
      frameStrokeWidth: prevEl?.frameStrokeWidth ?? 0,
      filterPreset: prevEl?.filterPreset ?? 'original',
      presetIntensity: prevEl?.presetIntensity ?? 100,
      adjustments: prevEl?.adjustments,
      layoutSlotIndex: index,
    };
  });
}
