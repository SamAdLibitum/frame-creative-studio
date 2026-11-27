import type { FilterPresetId, PhotoAdjustments } from '@/types/studio';

export const DEFAULT_ADJUSTMENTS: PhotoAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  exposure: 0,
  blur: 0,
  fade: 0,
  grain: 0,
  sepia: 0,
  grayscale: 0,
};

export interface FilterPresetDefinition {
  id: FilterPresetId;
  label: string;
  swatchGradient: string;
  adjustments: PhotoAdjustments;
}

export const FILTER_PRESETS: FilterPresetDefinition[] = [
  {
    id: 'original',
    label: 'Original',
    swatchGradient: 'linear-gradient(135deg, #52525b, #27272a)',
    adjustments: { ...DEFAULT_ADJUSTMENTS },
  },
  {
    id: 'clean',
    label: 'Clean',
    swatchGradient: 'linear-gradient(135deg, #f8fafc, #94a3b8)',
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      exposure: 8,
      contrast: 12,
      saturation: 8,
      warmth: 4,
    },
  },
  {
    id: 'warm',
    label: 'Warm',
    swatchGradient: 'linear-gradient(135deg, #fb923c, #b45309)',
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      warmth: 42,
      brightness: 5,
      saturation: 12,
      contrast: 6,
    },
  },
  {
    id: 'cool',
    label: 'Cool',
    swatchGradient: 'linear-gradient(135deg, #38bdf8, #1d4ed8)',
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      warmth: -40,
      contrast: 10,
      saturation: -6,
      brightness: 3,
    },
  },
  {
    id: 'vintage',
    label: 'Vintage',
    swatchGradient: 'linear-gradient(135deg, #d97706, #78350f)',
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      sepia: 36,
      warmth: 24,
      fade: 28,
      contrast: -8,
      saturation: -16,
      grain: 26,
    },
  },
  {
    id: 'film',
    label: 'Film',
    swatchGradient: 'linear-gradient(135deg, #ea580c, #3f3f46)',
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      contrast: 18,
      fade: 18,
      grain: 38,
      warmth: 12,
      saturation: 8,
    },
  },
  {
    id: 'fade',
    label: 'Fade',
    swatchGradient: 'linear-gradient(135deg, #a1a1aa, #52525b)',
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      fade: 50,
      contrast: -14,
      brightness: 6,
      saturation: -14,
    },
  },
  {
    id: 'monochrome',
    label: 'Monochrome',
    swatchGradient: 'linear-gradient(135deg, #e4e4e7, #18181b)',
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      grayscale: 100,
      contrast: 24,
      exposure: 4,
      grain: 18,
    },
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    swatchGradient: 'linear-gradient(135deg, #0ea5e9, #0f172a)',
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      contrast: 26,
      exposure: -6,
      saturation: -12,
      warmth: -16,
      fade: 14,
      grain: 16,
    },
  },
  {
    id: 'soft',
    label: 'Soft',
    swatchGradient: 'linear-gradient(135deg, #fbcfe8, #a78bfa)',
    adjustments: {
      ...DEFAULT_ADJUSTMENTS,
      brightness: 8,
      contrast: -16,
      saturation: -8,
      warmth: 10,
      fade: 22,
      blur: 0.7,
    },
  },
];

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function combinePresetAndAdjustments(
  presetId: FilterPresetId | undefined,
  presetIntensity: number | undefined,
  manual: PhotoAdjustments | undefined,
): PhotoAdjustments {
  const preset =
    FILTER_PRESETS.find((p) => p.id === (presetId ?? 'original')) ??
    FILTER_PRESETS[0];
  const scale = clamp((presetIntensity ?? 100) / 100, 0, 1);
  const m = manual ?? DEFAULT_ADJUSTMENTS;
  const p = preset.adjustments;

  return {
    brightness: clamp(p.brightness * scale + m.brightness, -100, 100),
    contrast: clamp(p.contrast * scale + m.contrast, -100, 100),
    saturation: clamp(p.saturation * scale + m.saturation, -100, 100),
    warmth: clamp(p.warmth * scale + m.warmth, -100, 100),
    exposure: clamp(p.exposure * scale + m.exposure, -100, 100),
    blur: clamp(p.blur * scale + m.blur, 0, 20),
    fade: clamp(p.fade * scale + m.fade, 0, 100),
    grain: clamp(p.grain * scale + m.grain, 0, 100),
    sepia: clamp(p.sepia * scale + m.sepia, 0, 100),
    grayscale: clamp(p.grayscale * scale + m.grayscale, 0, 100),
  };
}

export function isIdentityAdjustments(adj: PhotoAdjustments): boolean {
  return (
    Math.abs(adj.brightness) < 0.5 &&
    Math.abs(adj.contrast) < 0.5 &&
    Math.abs(adj.saturation) < 0.5 &&
    Math.abs(adj.warmth) < 0.5 &&
    Math.abs(adj.exposure) < 0.5 &&
    adj.blur < 0.1 &&
    adj.fade < 0.5 &&
    adj.grain < 0.5 &&
    adj.sepia < 0.5 &&
    adj.grayscale < 0.5
  );
}

let cachedGrainTile: HTMLCanvasElement | null = null;

function getGrainTile(): HTMLCanvasElement {
  if (cachedGrainTile) return cachedGrainTile;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;
    // Deterministic PRNG so grain doesn't flicker across re-renders
    let seed = 1337;
    for (let i = 0; i < data.length; i += 4) {
      seed = (seed * 16807) % 2147483647;
      const v = (seed & 255);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
  }
  cachedGrainTile = canvas;
  return canvas;
}

const MAX_PROCESSING_DIMENSION = 1600;

let cachedCtxFilterSupport: boolean | null = null;

/**
 * Detects whether CanvasRenderingContext2D.filter is supported and active
 * (returns false on older Safari/iOS WebKit versions).
 */
export function supportsContext2DFilter(): boolean {
  if (cachedCtxFilterSupport !== null) return cachedCtxFilterSupport;
  if (typeof document === 'undefined') return false;
  const probe = document.createElement('canvas');
  const ctx = probe.getContext('2d');
  if (!ctx || typeof ctx.filter !== 'string') {
    cachedCtxFilterSupport = false;
    return false;
  }
  ctx.filter = 'brightness(150%)';
  cachedCtxFilterSupport = ctx.filter === 'brightness(150%)';
  return cachedCtxFilterSupport;
}

function applyPixelFilterFallback(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  brightFactor: number,
  contrastFactor: number,
  satFactor: number,
  sepiaPct: number,
  grayscalePct: number,
): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const sepiaAmt = clamp(sepiaPct / 100, 0, 1);
  const grayAmt = clamp(grayscalePct / 100, 0, 1);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] * brightFactor;
    let g = data[i + 1] * brightFactor;
    let b = data[i + 2] * brightFactor;

    // Contrast around mid-gray (128)
    r = (r - 128) * contrastFactor + 128;
    g = (g - 128) * contrastFactor + 128;
    b = (b - 128) * contrastFactor + 128;

    // Saturation (Rec. 709 luminance)
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = lum + (r - lum) * satFactor;
    g = lum + (g - lum) * satFactor;
    b = lum + (b - lum) * satFactor;

    // Sepia
    if (sepiaAmt > 0) {
      const sr = r * 0.393 + g * 0.769 + b * 0.189;
      const sg = r * 0.349 + g * 0.686 + b * 0.168;
      const sb = r * 0.272 + g * 0.534 + b * 0.131;
      r = r * (1 - sepiaAmt) + sr * sepiaAmt;
      g = g * (1 - sepiaAmt) + sg * sepiaAmt;
      b = b * (1 - sepiaAmt) + sb * sepiaAmt;
    }

    // Grayscale
    if (grayAmt > 0) {
      const gl = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = r * (1 - grayAmt) + gl * grayAmt;
      g = g * (1 - grayAmt) + gl * grayAmt;
      b = b * (1 - grayAmt) + gl * grayAmt;
    }

    data[i] = r < 0 ? 0 : r > 255 ? 255 : r;
    data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
    data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Renders non-destructive adjustments & presets onto a canvas at export-grade resolution.
 */
export function renderFilteredCanvas(
  img: HTMLImageElement,
  adj: PhotoAdjustments,
  targetCanvas?: HTMLCanvasElement,
): HTMLCanvasElement {
  const natW = Math.max(1, img.naturalWidth || img.width);
  const natH = Math.max(1, img.naturalHeight || img.height);
  const downscale = Math.min(
    1,
    MAX_PROCESSING_DIMENSION / Math.max(natW, natH),
  );
  const w = Math.max(1, Math.round(natW * downscale));
  const h = Math.max(1, Math.round(natH * downscale));

  const canvas = targetCanvas ?? document.createElement('canvas');
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, w, h);

  // Combine brightness (-100..100) and exposure (-100..100) into CSS filter
  const brightFactor = Math.max(
    0.1,
    (1 + adj.brightness / 100) * Math.pow(2, adj.exposure / 100),
  );
  const contrastFactor = Math.max(0.15, 1 + adj.contrast / 100);
  const satFactor = Math.max(0, 1 + adj.saturation / 100);

  if (supportsContext2DFilter()) {
    const filterParts: string[] = [
      `brightness(${Math.round(brightFactor * 100)}%)`,
      `contrast(${Math.round(contrastFactor * 100)}%)`,
      `saturate(${Math.round(satFactor * 100)}%)`,
    ];
    if (adj.sepia > 0) filterParts.push(`sepia(${Math.round(adj.sepia)}%)`);
    if (adj.grayscale > 0) {
      filterParts.push(`grayscale(${Math.round(adj.grayscale)}%)`);
    }
    if (adj.blur > 0) {
      filterParts.push(`blur(${(adj.blur * downscale).toFixed(1)}px)`);
    }

    ctx.save();
    ctx.filter = filterParts.join(' ');
    ctx.drawImage(img, 0, 0, w, h);
    ctx.restore();
  } else {
    ctx.drawImage(img, 0, 0, w, h);
    applyPixelFilterFallback(
      ctx,
      w,
      h,
      brightFactor,
      contrastFactor,
      satFactor,
      adj.sepia,
      adj.grayscale,
    );
  }

  // Warmth color temperature overlay
  if (Math.abs(adj.warmth) >= 1) {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    const alpha = Math.min(0.45, (Math.abs(adj.warmth) / 100) * 0.42);
    ctx.fillStyle =
      adj.warmth > 0
        ? `rgba(255, 156, 64, ${alpha})`
        : `rgba(64, 156, 255, ${alpha})`;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Matte Fade (lifted blacks)
  if (adj.fade >= 1) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighten';
    const lift = Math.round((adj.fade / 100) * 58);
    ctx.fillStyle = `rgb(${lift}, ${lift}, ${Math.round(lift * 1.04)})`;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Monochromatic Film Grain
  if (adj.grain >= 1) {
    const pattern = ctx.createPattern(getGrainTile(), 'repeat');
    if (pattern) {
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = Math.min(0.36, (adj.grain / 100) * 0.34);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }

  return canvas;
}
