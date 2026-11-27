import { DEFAULT_PROCEDURAL_PALETTE } from './palettes.ts';

const SAMPLE_SIZE = 64;

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getSaturationAndLuminance(
  r: number,
  g: number,
  b: number,
): { sat: number; lum: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lum = (max + min) / 2;
  if (max === min) return { sat: 0, lum };
  const d = max - min;
  const sat = lum > 0.5 ? d / (2 - max - min) : d / (max + min);
  return { sat, lum };
}

function colorDistanceSq(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

/**
 * Downsamples an image/canvas to <= 64x64 on an offscreen canvas, samples
 * non-transparent pixels by color quantization & saturation, and returns 5
 * harmonious hex colors ordered from base -> support -> accent.
 * Falls back safely to DEFAULT_PROCEDURAL_PALETTE if extraction fails.
 */
export function extractHarmoniousPaletteFromImage(
  source: HTMLImageElement | HTMLCanvasElement,
): string[] {
  if (typeof document === 'undefined') {
    return [...DEFAULT_PROCEDURAL_PALETTE];
  }

  try {
    const srcW =
      source instanceof HTMLImageElement
        ? source.naturalWidth || source.width
        : source.width;
    const srcH =
      source instanceof HTMLImageElement
        ? source.naturalHeight || source.height
        : source.height;

    if (!srcW || !srcH) return [...DEFAULT_PROCEDURAL_PALETTE];

    const scale = Math.min(1, SAMPLE_SIZE / Math.max(srcW, srcH));
    const w = Math.max(1, Math.round(srcW * scale));
    const h = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [...DEFAULT_PROCEDURAL_PALETTE];

    ctx.drawImage(source, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h).data;

    // 4-bit per channel quantization (4096 buckets)
    const buckets = new Map<
      number,
      { sumR: number; sumG: number; sumB: number; count: number }
    >();

    for (let i = 0; i < imgData.length; i += 4) {
      const a = imgData[i + 3];
      if (a < 128) continue;
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.sumR += r;
        bucket.sumG += g;
        bucket.sumB += b;
        bucket.count += 1;
      } else {
        buckets.set(key, { sumR: r, sumG: g, sumB: b, count: 1 });
      }
    }

    canvas.width = 0;
    canvas.height = 0;

    if (buckets.size === 0) return [...DEFAULT_PROCEDURAL_PALETTE];

    const candidates = Array.from(buckets.values()).map((b) => {
      const avgR = b.sumR / b.count;
      const avgG = b.sumG / b.count;
      const avgB = b.sumB / b.count;
      const { sat, lum } = getSaturationAndLuminance(avgR, avgG, avgB);
      // Score balances pixel frequency and chromatic richness
      const score = b.count * (0.65 + sat * 1.35);
      return { r: avgR, g: avgG, b: avgB, sat, lum, score };
    });

    candidates.sort((a, b) => b.score - a.score);

    const picked: typeof candidates = [];
    const minDistSq = 48 * 48;

    for (const c of candidates) {
      if (picked.length >= 5) break;
      if (picked.every((p) => colorDistanceSq(p, c) >= minDistSq)) {
        picked.push(c);
      }
    }

    // Relax distance if photo is monochromatic/low-variance
    if (picked.length < 5) {
      for (const c of candidates) {
        if (picked.length >= 5) break;
        if (!picked.includes(c)) picked.push(c);
      }
    }

    if (picked.length === 0) return [...DEFAULT_PROCEDURAL_PALETTE];

    // Order harmoniously: darkest/dominant base -> support tones -> most vibrant/bright accent
    const ordered = [...picked].sort((a, b) => {
      const aWeight = a.lum * 0.7 + a.sat * 0.3;
      const bWeight = b.lum * 0.7 + b.sat * 0.3;
      return aWeight - bWeight;
    });

    const hexes = ordered.map((c) => rgbToHex(c.r, c.g, c.b));
    while (hexes.length < 5) {
      hexes.push(DEFAULT_PROCEDURAL_PALETTE[hexes.length]);
    }
    return hexes.slice(0, 5);
  } catch {
    return [...DEFAULT_PROCEDURAL_PALETTE];
  }
}
