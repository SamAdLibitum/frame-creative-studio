import {
  BoundedProceduralCanvasCache,
  buildProceduralCacheKey,
  buildProceduralScene,
  generateSeamlessNoiseTile,
  MAX_PROCEDURAL_CACHE_BYTES,
  MAX_PROCEDURAL_CACHE_ENTRIES,
  sanitizeProceduralConfig,
} from './proceduralCore.ts';
import type { GridCellDescriptor, ProceduralConfig } from './types.ts';

const MAX_RENDER_SIDE = 1920;
const NOISE_TILE_SIZE = 128;

const proceduralCanvasCache = new BoundedProceduralCanvasCache<HTMLCanvasElement>(
  MAX_PROCEDURAL_CACHE_ENTRIES,
  MAX_PROCEDURAL_CACHE_BYTES,
);

const noiseTileCache = new BoundedProceduralCanvasCache<HTMLCanvasElement>(
  12,
  2 * 1024 * 1024,
);

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = Number.parseInt(clean.slice(0, 2), 16) || 0;
  const g = Number.parseInt(clean.slice(2, 4), 16) || 0;
  const b = Number.parseInt(clean.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

function getNoiseTileCanvas(seed: number): HTMLCanvasElement {
  const key = `noise:${seed}:${NOISE_TILE_SIZE}`;
  const cached = noiseTileCache.get(key);
  if (cached) return cached;

  const tile = document.createElement('canvas');
  tile.width = NOISE_TILE_SIZE;
  tile.height = NOISE_TILE_SIZE;
  const ctx = tile.getContext('2d');
  if (ctx) {
    const raw = generateSeamlessNoiseTile(seed, NOISE_TILE_SIZE);
    const imgData = new ImageData(
      new Uint8ClampedArray(raw),
      NOISE_TILE_SIZE,
      NOISE_TILE_SIZE,
    );
    ctx.putImageData(imgData, 0, 0);
  }
  noiseTileCache.set(key, tile);
  return tile;
}

function drawBauhausCell(
  ctx: CanvasRenderingContext2D,
  cell: GridCellDescriptor,
): void {
  const { x, y, size, motif, primaryColor, secondaryColor } = cell;
  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.save();
  // Swiss Editorial Hairline Grid (1px crisp hairlines, opacity 0.25–0.40)
  ctx.strokeStyle = hexToRgba(primaryColor, 0.26);
  ctx.lineWidth = 1;
  ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, size, size);

  // Precision crosshair at cell corner/center for non-empty cells
  if (motif !== 'empty') {
    const cross = Math.min(10, Math.max(4, size * 0.08));
    ctx.strokeStyle = hexToRgba(secondaryColor ?? primaryColor, 0.38);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - cross, cy);
    ctx.lineTo(cx + cross, cy);
    ctx.moveTo(cx, cy - cross);
    ctx.lineTo(cx, cy + cross);
    ctx.stroke();
  }

  ctx.restore();
}

function drawFourPointStar(
  ctx: CanvasRenderingContext2D,
  radius: number,
): void {
  const inner = radius * 0.26;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? radius : inner;
    const angle = (i * Math.PI) / 4;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Synchronously renders a deterministic ProceduralConfig onto a read-only cached HTMLCanvasElement.
 * Callers MUST NOT mutate the returned canvas.
 */
export function renderProceduralToCanvas(
  rawConfig: Partial<ProceduralConfig>,
  targetWidth: number,
  targetHeight: number,
): HTMLCanvasElement {
  const config = sanitizeProceduralConfig(rawConfig);
  const safeTargetW = Math.max(
    1,
    Math.round(Number.isFinite(targetWidth) ? targetWidth : 1080),
  );
  const safeTargetH = Math.max(
    1,
    Math.round(Number.isFinite(targetHeight) ? targetHeight : 1920),
  );

  // Cap internal longest side at 1920px while preserving exact aspect ratio
  const downscale = Math.min(
    1,
    MAX_RENDER_SIDE / Math.max(safeTargetW, safeTargetH),
  );
  const renderW = Math.max(1, Math.round(safeTargetW * downscale));
  const renderH = Math.max(1, Math.round(safeTargetH * downscale));

  const cacheKey = buildProceduralCacheKey(config, renderW, renderH);
  const hit = proceduralCanvasCache.get(cacheKey);
  if (hit) return hit;

  const canvas = document.createElement('canvas');
  canvas.width = renderW;
  canvas.height = renderH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const scene = buildProceduralScene(config, renderW, renderH);
  const { payload, workWidth, workHeight } = scene;

  ctx.clearRect(0, 0, renderW, renderH);
  ctx.save();

  // Only mesh-gradient, layered-waves, and geometric-grid paint a full opaque backdrop.
  // light-leak, bokeh-glow, organic-blobs, halftone-dots, and starfield-confetti keep alpha = 0.
  if (
    payload.generatorType === 'mesh-gradient' ||
    payload.generatorType === 'layered-waves' ||
    payload.generatorType === 'geometric-grid'
  ) {
    ctx.fillStyle = config.palette[0];
    ctx.fillRect(0, 0, renderW, renderH);
  }

  // Apply uniform global composition rotation around element center with bleed
  ctx.translate(renderW / 2, renderH / 2);
  if (config.rotation !== 0) {
    ctx.rotate((config.rotation * Math.PI) / 180);
  }
  ctx.translate(-workWidth / 2, -workHeight / 2);

  switch (payload.generatorType) {
    case 'mesh-gradient': {
      for (const orb of payload.orbs) {
        const grad = ctx.createRadialGradient(
          orb.cx,
          orb.cy,
          0,
          orb.cx,
          orb.cy,
          orb.radius,
        );
        grad.addColorStop(0, hexToRgba(orb.color, orb.alpha));
        grad.addColorStop(0.35, hexToRgba(orb.color, orb.alpha * 0.72));
        grad.addColorStop(0.68, hexToRgba(orb.color, orb.alpha * 0.25));
        grad.addColorStop(1, hexToRgba(orb.color, 0));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, workWidth, workHeight);
      }
      break;
    }

    case 'organic-blobs': {
      // Atmospheric Color Wash: large soft radial washes (opacity 0.25–0.40, zero sharp edges)
      for (const blob of payload.blobs) {
        ctx.save();
        const washRadius = Math.max(40, blob.outerRadius * 1.45);
        const washAlpha = Math.min(0.4, Math.max(0.25, blob.alpha * 0.42));
        const grad = ctx.createRadialGradient(
          blob.cx,
          blob.cy,
          0,
          blob.cx,
          blob.cy,
          washRadius,
        );
        grad.addColorStop(0, hexToRgba(blob.color, washAlpha));
        grad.addColorStop(0.42, hexToRgba(blob.color, washAlpha * 0.58));
        grad.addColorStop(0.76, hexToRgba(blob.color, washAlpha * 0.16));
        grad.addColorStop(1, hexToRgba(blob.color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(blob.cx, blob.cy, washRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case 'layered-waves': {
      for (const wave of payload.waves) {
        if (wave.points.length === 0) continue;
        ctx.save();
        ctx.globalAlpha = wave.alpha;
        ctx.fillStyle = wave.color;
        ctx.beginPath();
        ctx.moveTo(wave.points[0].x, wave.points[0].y);
        for (let i = 1; i < wave.points.length; i++) {
          const prev = wave.points[i - 1];
          const curr = wave.points[i];
          const midX = (prev.x + curr.x) / 2;
          const midY = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }
        const last = wave.points[wave.points.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.lineTo(workWidth, wave.bottomY);
        ctx.lineTo(0, wave.bottomY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case 'geometric-grid': {
      for (const cell of payload.cells) {
        drawBauhausCell(ctx, cell);
      }
      break;
    }

    case 'halftone-dots': {
      // Fine Micro-Dot Matrix: small tight dots, opacity 0.18–0.32
      for (const dot of payload.dots) {
        ctx.save();
        const microRadius = Math.max(0.8, Math.min(3.2, dot.radius * 0.32));
        const microAlpha = Math.min(0.32, Math.max(0.18, dot.alpha * 0.34));
        ctx.globalAlpha = microAlpha;
        ctx.fillStyle = dot.color;
        ctx.beginPath();
        ctx.arc(dot.cx, dot.cy, microRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      break;
    }

    case 'starfield-confetti': {
      // Minimal Film Dust & Micro-Sparkles (1–2.5 px delicate particles)
      for (const p of payload.particles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angleRad);
        const microSize = Math.max(1, Math.min(2.5, 1 + (p.size % 1.5)));
        const microAlpha = Math.min(0.65, p.alpha * 0.68);
        ctx.globalAlpha = microAlpha;
        ctx.fillStyle = p.color;

        if (p.kind === 'star-4') {
          drawFourPointStar(ctx, microSize * 1.4);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, microSize * 0.75, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      break;
    }

    case 'light-leak': {
      // Subtle Analog Film Halation at 1–2 edges/corners, max opacity 0.38, clean center
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (const beam of payload.beams.slice(0, 2)) {
        ctx.save();
        ctx.translate(beam.x, beam.y);
        ctx.rotate(beam.angleRad);
        ctx.scale(1, beam.ry / Math.max(1, beam.rx));
        const peak = Math.min(0.38, Math.max(0.22, beam.alpha * 0.42));
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, beam.rx);
        grad.addColorStop(0, hexToRgba(beam.color, peak));
        grad.addColorStop(0.36, hexToRgba(beam.color, peak * 0.52));
        grad.addColorStop(0.72, hexToRgba(beam.color, peak * 0.14));
        grad.addColorStop(1, hexToRgba(beam.color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, beam.rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      break;
    }

    case 'bokeh-glow': {
      // Ultra-soft multi-stop radial gradients (opacity 0.22–0.35), zero stroke()
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (const b of payload.bokehs) {
        const grad = ctx.createRadialGradient(
          b.cx,
          b.cy,
          0,
          b.cx,
          b.cy,
          b.radius,
        );
        const peak = Math.min(0.35, Math.max(0.22, b.alpha * 0.38));
        grad.addColorStop(0, hexToRgba(b.color, peak));
        grad.addColorStop(0.45, hexToRgba(b.color, peak * 0.62));
        grad.addColorStop(0.78, hexToRgba(b.color, peak * 0.2));
        grad.addColorStop(1, hexToRgba(b.color, 0));

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.cx, b.cy, b.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }
  }

  ctx.restore();

  // Transparency-Safe Grain: source-atop preserves alpha = 0 in negative space!
  if (config.grain > 0) {
    const pattern = ctx.createPattern(getNoiseTileCanvas(config.seed), 'repeat');
    if (pattern) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = (config.grain / 50) * 0.22;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, renderW, renderH);
      ctx.restore();
    }
  }

  proceduralCanvasCache.set(cacheKey, canvas);
  return canvas;
}

export function clearProceduralRenderCache(): void {
  proceduralCanvasCache.clear();
  noiseTileCache.clear();
}
