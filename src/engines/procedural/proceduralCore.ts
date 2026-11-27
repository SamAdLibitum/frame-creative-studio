import { DEFAULT_PROCEDURAL_PALETTE } from './palettes.ts';
import type {
  BauhausMotifKind,
  BokehOrbDescriptor,
  CubicBezierSegment,
  GridCellDescriptor,
  HalftoneDotDescriptor,
  LightLeakBeamDescriptor,
  MeshOrbDescriptor,
  OrganicBlobDescriptor,
  ParticleShapeKind,
  ProceduralBlendMode,
  ProceduralConfig,
  ProceduralGeneratorType,
  ProceduralScene,
  StarfieldParticleDescriptor,
  WaveLayerDescriptor,
} from './types.ts';

const VALID_GENERATORS = new Set<ProceduralGeneratorType>([
  'mesh-gradient',
  'organic-blobs',
  'layered-waves',
  'geometric-grid',
  'halftone-dots',
  'starfield-confetti',
  'light-leak',
  'bokeh-glow',
]);

const VALID_BLEND_MODES = new Set<ProceduralBlendMode>([
  'normal',
  'screen',
  'overlay',
  'soft-light',
  'lighten',
]);

export const MAX_PROCEDURAL_CACHE_ENTRIES = 24;
export const MAX_PROCEDURAL_CACHE_BYTES = 64 * 1024 * 1024; // 67,108,864 bytes (64 MiB)

export const DEFAULT_PROCEDURAL_CONFIG: ProceduralConfig = {
  version: 1,
  generatorType: 'mesh-gradient',
  seed: 4821,
  palette: [...DEFAULT_PROCEDURAL_PALETTE],
  complexity: 55,
  density: 50,
  scale: 100,
  rotation: 0,
  grain: 14,
  blendMode: 'normal',
};

function sanitizeNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, value));
}

export function normalizeHexColor(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return null;
}

export function sanitizeProceduralConfig(
  raw?: Partial<ProceduralConfig> | null,
): ProceduralConfig {
  const safeRaw = raw && typeof raw === 'object' ? raw : {};

  const versionRaw = safeRaw.version;
  const version =
    typeof versionRaw === 'number' &&
    Number.isFinite(versionRaw) &&
    versionRaw >= 1
      ? Math.floor(versionRaw)
      : DEFAULT_PROCEDURAL_CONFIG.version;

  const generatorType: ProceduralGeneratorType =
    typeof safeRaw.generatorType === 'string' &&
    VALID_GENERATORS.has(safeRaw.generatorType as ProceduralGeneratorType)
      ? (safeRaw.generatorType as ProceduralGeneratorType)
      : DEFAULT_PROCEDURAL_CONFIG.generatorType;

  const seed =
    typeof safeRaw.seed === 'number' && Number.isFinite(safeRaw.seed)
      ? Math.abs(Math.floor(safeRaw.seed)) >>> 0
      : DEFAULT_PROCEDURAL_CONFIG.seed;

  const sanitizedColors: string[] = [];
  if (Array.isArray(safeRaw.palette)) {
    for (const entry of safeRaw.palette.slice(0, 8)) {
      const hex = normalizeHexColor(entry);
      if (hex) sanitizedColors.push(hex);
    }
  }
  const palette =
    sanitizedColors.length >= 2
      ? sanitizedColors
      : [...DEFAULT_PROCEDURAL_PALETTE];

  const complexity = Math.round(
    sanitizeNumber(
      safeRaw.complexity,
      DEFAULT_PROCEDURAL_CONFIG.complexity,
      1,
      100,
    ),
  );
  const density = Math.round(
    sanitizeNumber(safeRaw.density, DEFAULT_PROCEDURAL_CONFIG.density, 1, 100),
  );
  const scale = Math.round(
    sanitizeNumber(safeRaw.scale, DEFAULT_PROCEDURAL_CONFIG.scale, 20, 200),
  );
  const rotation = Math.round(
    sanitizeNumber(
      safeRaw.rotation,
      DEFAULT_PROCEDURAL_CONFIG.rotation,
      0,
      360,
    ),
  );
  const grain = Math.round(
    sanitizeNumber(safeRaw.grain, DEFAULT_PROCEDURAL_CONFIG.grain, 0, 50),
  );
  const blendMode: ProceduralBlendMode =
    typeof safeRaw.blendMode === 'string' &&
    VALID_BLEND_MODES.has(safeRaw.blendMode as ProceduralBlendMode)
      ? (safeRaw.blendMode as ProceduralBlendMode)
      : 'normal';

  return {
    version,
    generatorType,
    seed,
    palette,
    complexity,
    density,
    scale,
    rotation,
    grain,
    blendMode,
  };
}

/**
 * Deterministic 32-bit Mulberry32 PRNG.
 */
export function createSeededRandom(seed: number): () => number {
  let state =
    (typeof seed === 'number' && Number.isFinite(seed)
      ? Math.abs(Math.floor(seed))
      : 0) >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Computes expansion factor around center so global rotation never leaves empty corners.
 */
export function computeRotationBleedFactor(
  width: number,
  height: number,
  rotationDeg: number,
): number {
  const rad = ((rotationDeg % 180) * Math.PI) / 180;
  const absCos = Math.abs(Math.cos(rad));
  const absSin = Math.abs(Math.sin(rad));
  if (absSin < 1e-6) return 1;
  const reqW = width * absCos + height * absSin;
  const reqH = width * absSin + height * absCos;
  return Math.max(reqW / Math.max(1, width), reqH / Math.max(1, height));
}

function pickSupportOrAccentColor(
  palette: string[],
  rng: () => number,
  accentProbability = 0.24,
): string {
  if (palette.length <= 2) return palette[palette.length - 1];
  const accent = palette[palette.length - 1];
  const supports = palette.slice(1, -1);
  if (rng() < accentProbability || supports.length === 0) {
    return accent;
  }
  return supports[Math.floor(rng() * supports.length)];
}

function getHexLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = (Number.parseInt(clean.slice(0, 2), 16) || 0) / 255;
  const g = (Number.parseInt(clean.slice(2, 4), 16) || 0) / 255;
  const b = (Number.parseInt(clean.slice(4, 6), 16) || 0) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Selects bright/accent colors from the palette (never the darkest base `palette[0]`)
 * for optical light-leak and bokeh-glow generators.
 */
function pickBrightLightColors(palette: string[]): string[] {
  const candidates = palette.slice(1);
  if (candidates.length === 0) return [palette[0] ?? '#FFFFFF'];
  const sorted = [...candidates].sort(
    (a, b) => getHexLuminance(b) - getHexLuminance(a),
  );
  const bright = sorted.filter((c) => getHexLuminance(c) >= 0.24);
  if (bright.length >= 2) return bright.slice(0, 3);
  return sorted.slice(0, Math.min(2, sorted.length));
}

/**
 * Converts closed polygon points into smooth Catmull-Rom -> Cubic Bezier segments.
 */
function closedPointsToCubicBeziers(
  pts: Array<{ x: number; y: number }>,
  tension = 0.22,
): { startX: number; startY: number; segments: CubicBezierSegment[] } {
  const n = pts.length;
  const segments: CubicBezierSegment[] = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    segments.push({ cp1x, cp1y, cp2x, cp2y, x: p2.x, y: p2.y });
  }
  return { startX: pts[0].x, startY: pts[0].y, segments };
}

export function buildProceduralScene(
  rawConfig: Partial<ProceduralConfig>,
  rawWidth: number,
  rawHeight: number,
): ProceduralScene {
  const config = sanitizeProceduralConfig(rawConfig);
  const width = Math.max(
    1,
    Math.round(
      typeof rawWidth === 'number' && Number.isFinite(rawWidth)
        ? rawWidth
        : 1080,
    ),
  );
  const height = Math.max(
    1,
    Math.round(
      typeof rawHeight === 'number' && Number.isFinite(rawHeight)
        ? rawHeight
        : 1920,
    ),
  );

  const bleedFactor = computeRotationBleedFactor(
    width,
    height,
    config.rotation,
  );
  const workWidth = width * bleedFactor;
  const workHeight = height * bleedFactor;

  const rng = createSeededRandom(config.seed);
  const dNorm = (config.density - 1) / 99; // 0..1
  const cNorm = (config.complexity - 1) / 99; // 0..1
  const sNorm = config.scale / 100; // 0.2..2.0
  const { palette } = config;
  const baseColor = palette[0];

  switch (config.generatorType) {
    case 'mesh-gradient': {
      const orbCount = 3 + Math.round(dNorm * 5); // 3..8
      const maxDim = Math.max(workWidth, workHeight);
      const orbs: MeshOrbDescriptor[] = [];

      for (let i = 0; i < orbCount; i++) {
        const goldenAngle = i * 2.39996 + rng() * 0.9;
        const orbitDist = (0.14 + 0.34 * cNorm) * (0.45 + rng() * 0.65);
        const cx =
          workWidth * 0.5 + Math.cos(goldenAngle) * workWidth * orbitDist;
        const cy =
          workHeight * 0.5 + Math.sin(goldenAngle) * workHeight * orbitDist;
        const radius =
          maxDim * (0.36 + rng() * 0.28) * sNorm * (1 - cNorm * 0.15);
        const isAccent = i === orbCount - 1;
        const color = isAccent
          ? palette[palette.length - 1]
          : palette[1 + (i % Math.max(1, palette.length - 1))];
        const alpha = 0.52 + cNorm * 0.34 - (isAccent ? 0.08 : 0);

        orbs.push({ cx, cy, radius: Math.max(20, radius), color, alpha });
      }

      return {
        config,
        width,
        height,
        bleedFactor,
        workWidth,
        workHeight,
        payload: { generatorType: 'mesh-gradient', baseColor, orbs },
      };
    }

    case 'organic-blobs': {
      const blobCount = 2 + Math.round(dNorm * 7); // 2..9
      const vertexCount = 5 + Math.round(cNorm * 9); // 5..14
      const minDim = Math.min(workWidth, workHeight);
      const blobs: OrganicBlobDescriptor[] = [];

      for (let b = 0; b < blobCount; b++) {
        // Keep central composition balanced with intentional negative space
        const cx = workWidth * (0.18 + rng() * 0.64);
        const cy = workHeight * (0.16 + rng() * 0.68);
        const baseRadius =
          minDim * (0.14 + rng() * 0.2) * sNorm * (1 - dNorm * 0.18);
        const wobbleAmp = 0.06 + cNorm * 0.34;
        const phase1 = rng() * Math.PI * 2;
        const phase2 = rng() * Math.PI * 2;

        const pts: Array<{ x: number; y: number }> = [];
        for (let v = 0; v < vertexCount; v++) {
          const theta = (v / vertexCount) * Math.PI * 2;
          const harmonic =
            Math.sin(theta * 2 + phase1) * 0.55 +
            Math.cos(theta * 3 + phase2) * 0.45;
          const jitter = (rng() - 0.5) * wobbleAmp * 0.7;
          const r = Math.max(
            12,
            baseRadius * (1 + harmonic * wobbleAmp + jitter),
          );
          pts.push({
            x: cx + Math.cos(theta) * r,
            y: cy + Math.sin(theta) * r,
          });
        }

        const curve = closedPointsToCubicBeziers(pts, 0.2 + cNorm * 0.08);
        const color = pickSupportOrAccentColor(palette, rng, 0.28);
        const alpha = 0.68 + rng() * 0.26;
        const outerRadius = baseRadius * (1 + wobbleAmp * 1.15);

        blobs.push({
          cx,
          cy,
          outerRadius,
          startX: curve.startX,
          startY: curve.startY,
          segments: curve.segments,
          color,
          alpha,
        });
      }

      return {
        config,
        width,
        height,
        bleedFactor,
        workWidth,
        workHeight,
        payload: { generatorType: 'organic-blobs', blobs },
      };
    }

    case 'layered-waves': {
      const waveCount = 3 + Math.round(dNorm * 9); // 3..12
      const sampleSteps = 36 + Math.round(cNorm * 28);
      const waves: WaveLayerDescriptor[] = [];

      // Leave airy negative space at top (~22% of workHeight)
      const startTopRatio = 0.24;
      const spanRatio = 0.68;

      for (let w = 0; w < waveCount; w++) {
        const t = waveCount === 1 ? 0.5 : w / (waveCount - 1);
        const baselineY = workHeight * (startTopRatio + t * spanRatio);
        const amp = workHeight * (0.025 + 0.055 * sNorm) * (0.65 + cNorm * 0.7);
        const freq1 = (1.1 + rng() * 1.4) / Math.max(0.4, sNorm * 0.85);
        const freq2 = freq1 * (2.0 + cNorm * 1.6);
        const freq3 = freq1 * (3.2 + cNorm * 2.1);
        const p1 = rng() * Math.PI * 2;
        const p2 = rng() * Math.PI * 2;
        const p3 = rng() * Math.PI * 2;

        const points: Array<{ x: number; y: number }> = [];
        for (let s = 0; s <= sampleSteps; s++) {
          const nx = s / sampleSteps;
          const x = nx * workWidth;
          const y =
            baselineY +
            amp *
              (Math.sin(nx * Math.PI * 2 * freq1 + p1) * 0.62 +
                Math.sin(nx * Math.PI * 2 * freq2 + p2) * (0.26 * cNorm) +
                Math.cos(nx * Math.PI * 2 * freq3 + p3) * (0.16 * cNorm));
          points.push({ x, y });
        }

        const paletteSlice = palette.slice(1);
        const colorIdx = Math.min(
          paletteSlice.length - 1,
          Math.floor(t * paletteSlice.length),
        );
        const color = paletteSlice[colorIdx] ?? palette[palette.length - 1];
        const alpha = 0.78 + t * 0.22;

        waves.push({
          points,
          bottomY: workHeight + 8,
          color,
          alpha,
        });
      }

      return {
        config,
        width,
        height,
        bleedFactor,
        workWidth,
        workHeight,
        payload: { generatorType: 'layered-waves', waves },
      };
    }

    case 'geometric-grid': {
      const cols = 3 + Math.round(dNorm * 7); // 3..10
      const cellSize = workWidth / cols;
      const rows = Math.max(2, Math.ceil(workHeight / cellSize));
      const gridW = cols * cellSize;
      const gridH = rows * cellSize;
      const offsetX = (workWidth - gridW) / 2;
      const offsetY = (workHeight - gridH) / 2;

      const motifPool: BauhausMotifKind[] =
        cNorm < 0.25
          ? ['circle', 'quarter-arc']
          : cNorm < 0.6
            ? ['circle', 'quarter-arc', 'diagonal', 'half-rect']
            : ['circle', 'quarter-arc', 'diagonal', 'half-rect', 'ring'];

      // Preserve aesthetic negative space (22%..42% empty cells)
      const fillProbability = 0.56 + cNorm * 0.24;
      const motifScale = Math.max(0.32, Math.min(1.0, sNorm * 0.82));
      const cells: GridCellDescriptor[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * cellSize;
          const y = offsetY + r * cellSize;
          if (rng() > fillProbability) {
            cells.push({
              x,
              y,
              size: cellSize,
              motif: 'empty',
              motifScale,
              quarterTurn: 0,
              primaryColor: baseColor,
            });
            continue;
          }

          const motif = motifPool[Math.floor(rng() * motifPool.length)];
          const quarterTurn = (Math.floor(rng() * 4) % 4) as 0 | 1 | 2 | 3;
          const primaryColor = pickSupportOrAccentColor(palette, rng, 0.22);
          const secondaryColor =
            cNorm > 0.45 && rng() < 0.35
              ? pickSupportOrAccentColor(palette, rng, 0.4)
              : undefined;

          cells.push({
            x,
            y,
            size: cellSize,
            motif,
            motifScale,
            quarterTurn,
            primaryColor,
            secondaryColor,
          });
        }
      }

      return {
        config,
        width,
        height,
        bleedFactor,
        workWidth,
        workHeight,
        payload: { generatorType: 'geometric-grid', baseColor, cells },
      };
    }

    case 'halftone-dots': {
      const cols = 10 + Math.round(dNorm * 36); // 10..46
      const step = workWidth / cols;
      const rows = Math.max(6, Math.ceil(workHeight / step));
      const offsetX = (workWidth - cols * step) / 2 + step / 2;
      const offsetY = (workHeight - rows * step) / 2 + step / 2;

      const focalX = workWidth * (0.35 + rng() * 0.3);
      const focalY = workHeight * (0.32 + rng() * 0.36);
      const wavePhase = rng() * Math.PI * 2;
      const maxDiag = Math.hypot(workWidth, workHeight) * 0.65;
      const maxDotRadius = step * Math.min(0.54, 0.16 + 0.24 * sNorm);

      const tones = palette.slice(1);
      const dots: HalftoneDotDescriptor[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = offsetX + c * step;
          const cy = offsetY + r * step;
          const distNorm = Math.min(
            1,
            Math.hypot(cx - focalX, cy - focalY) / Math.max(1, maxDiag),
          );
          const waveMod =
            Math.sin((cx / workWidth) * Math.PI * (2 + cNorm * 4) + wavePhase) *
            Math.cos(
              (cy / workHeight) * Math.PI * (2 + cNorm * 3) - wavePhase,
            );
          const field = Math.max(
            0,
            Math.min(1, (1 - distNorm * 0.92) * (1 - cNorm * 0.35) + (waveMod * 0.5 + 0.5) * cNorm * 0.65),
          );

          // Threshold creates natural breathing negative space
          if (field < 0.14) continue;

          const radius = Math.max(0.8, maxDotRadius * field);
          const toneIdx = Math.min(
            tones.length - 1,
            Math.floor((1 - field) * tones.length),
          );
          const color = tones[toneIdx] ?? palette[palette.length - 1];
          const alpha = 0.45 + field * 0.52;

          dots.push({ cx, cy, radius, color, alpha });
        }
      }

      return {
        config,
        width,
        height,
        bleedFactor,
        workWidth,
        workHeight,
        payload: { generatorType: 'halftone-dots', dots },
      };
    }

    case 'starfield-confetti': {
      const count = 20 + Math.round(dNorm * 200); // 20..220
      const minDim = Math.min(workWidth, workHeight);
      const particles: StarfieldParticleDescriptor[] = [];

      for (let i = 0; i < count; i++) {
        const x = rng() * workWidth;
        const y = rng() * workHeight;
        const roll = rng();

        let kind: ParticleShapeKind = 'glow-dot';
        if (roll < 0.18 + cNorm * 0.34) {
          kind = 'star-4';
        } else if (roll < 0.32 + cNorm * 0.52) {
          kind = 'capsule';
        }

        const baseSize =
          minDim *
          (kind === 'star-4'
            ? 0.014 + rng() * 0.028
            : kind === 'capsule'
              ? 0.012 + rng() * 0.022
              : 0.005 + rng() * 0.014) *
          sNorm;

        const aspect = kind === 'capsule' ? 2.1 + cNorm * 1.6 : 1;
        const angleRad = rng() * Math.PI * 2;
        const color = pickSupportOrAccentColor(palette, rng, 0.34);
        const alpha = 0.45 + rng() * 0.52;

        particles.push({
          x,
          y,
          size: Math.max(1.5, baseSize),
          aspect,
          angleRad,
          kind,
          color,
          alpha,
        });
      }

      return {
        config,
        width,
        height,
        bleedFactor,
        workWidth,
        workHeight,
        payload: { generatorType: 'starfield-confetti', particles },
      };
    }

    case 'light-leak': {
      const beamCount = 2 + Math.round(dNorm * 2); // 2..4 edge/corner beams
      const minDim = Math.min(workWidth, workHeight);
      const beams: LightLeakBeamDescriptor[] = [];
      const brightColors = pickBrightLightColors(palette);

      for (let i = 0; i < beamCount; i++) {
        const edge = Math.floor(rng() * 4) % 4; // 0=left, 1=right, 2=top, 3=bottom
        const along = 0.1 + rng() * 0.8;
        const inset = (rng() - 0.5) * minDim * 0.06;
        let x = 0;
        let y = 0;
        if (edge === 0) {
          x = inset;
          y = workHeight * along;
        } else if (edge === 1) {
          x = workWidth - inset;
          y = workHeight * along;
        } else if (edge === 2) {
          x = workWidth * along;
          y = inset;
        } else {
          x = workWidth * along;
          y = workHeight - inset;
        }

        const rx = minDim * (0.3 + rng() * 0.24) * sNorm;
        const ry = rx * (0.42 + (1 - cNorm) * 0.28);
        const angleRad = rng() * Math.PI * 2;
        const color = brightColors[i % brightColors.length];
        const alpha = Math.min(0.95, 0.78 + cNorm * 0.14);

        beams.push({
          x,
          y,
          rx: Math.max(24, rx),
          ry: Math.max(20, ry),
          angleRad,
          color,
          alpha,
        });
      }

      return {
        config,
        width,
        height,
        bleedFactor,
        workWidth,
        workHeight,
        payload: { generatorType: 'light-leak', beams },
      };
    }

    case 'bokeh-glow': {
      const bokehCount = 8 + Math.round(dNorm * 28); // 8..36
      const minDim = Math.min(workWidth, workHeight);
      const bokehs: BokehOrbDescriptor[] = [];
      const brightColors = pickBrightLightColors(palette);

      for (let i = 0; i < bokehCount; i++) {
        const cx = rng() * workWidth;
        const cy = rng() * workHeight;
        const radius = minDim * (0.045 + rng() * 0.13) * sNorm;
        const rimStrength = 0.45 + cNorm * 0.5;
        const color = brightColors[Math.floor(rng() * brightColors.length)];
        const alpha = 0.48 + rng() * 0.42;

        bokehs.push({
          cx,
          cy,
          radius: Math.max(10, radius),
          rimStrength,
          color,
          alpha,
        });
      }

      return {
        config,
        width,
        height,
        bleedFactor,
        workWidth,
        workHeight,
        payload: { generatorType: 'bokeh-glow', bokehs },
      };
    }
  }
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Generates an RGBA (size * size * 4) monochromatic noise tile using toroidal
 * wrap-around interpolation (`(gx + 1) % period`, `(gy + 1) % period`) so tiling
 * produces zero visible seam lines.
 */
export function generateSeamlessNoiseTile(
  seed: number,
  rawSize = 128,
): Uint8ClampedArray {
  const size = Math.max(
    16,
    Math.min(512, Math.floor(Number.isFinite(rawSize) ? rawSize : 128)),
  );
  const rng = createSeededRandom(seed);

  const coarsePeriod = 32;
  const finePeriod = 64;
  const coarseGrid = new Float32Array(coarsePeriod * coarsePeriod);
  const fineGrid = new Float32Array(finePeriod * finePeriod);
  const microGrid = new Float32Array(size * size);

  for (let i = 0; i < coarseGrid.length; i++) coarseGrid[i] = rng();
  for (let i = 0; i < fineGrid.length; i++) fineGrid[i] = rng();
  for (let i = 0; i < microGrid.length; i++) microGrid[i] = rng();

  const sampleToroidal = (
    grid: Float32Array,
    period: number,
    u: number,
    v: number,
  ): number => {
    const fx = u * period;
    const fy = v * period;
    const x0 = Math.floor(fx) % period;
    const y0 = Math.floor(fy) % period;
    const x1 = (x0 + 1) % period;
    const y1 = (y0 + 1) % period;
    const sx = smoothstep(fx - Math.floor(fx));
    const sy = smoothstep(fy - Math.floor(fy));

    const n00 = grid[y0 * period + x0];
    const n10 = grid[y0 * period + x1];
    const n01 = grid[y1 * period + x0];
    const n11 = grid[y1 * period + x1];

    const nx0 = n00 + (n10 - n00) * sx;
    const nx1 = n01 + (n11 - n01) * sx;
    return nx0 + (nx1 - nx0) * sy;
  };

  const out = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) {
    const v = (y % size) / size;
    for (let x = 0; x < size; x++) {
      const u = (x % size) / size;
      const cVal = sampleToroidal(coarseGrid, coarsePeriod, u, v);
      const fVal = sampleToroidal(fineGrid, finePeriod, u, v);
      const mVal = microGrid[(y % size) * size + (x % size)];

      // Balanced organic film grain centered around 128
      const combined = cVal * 0.25 + fVal * 0.35 + mVal * 0.4;
      const lum = Math.max(0, Math.min(255, Math.round(combined * 255)));

      const idx = (y * size + x) * 4;
      out[idx] = lum;
      out[idx + 1] = lum;
      out[idx + 2] = lum;
      out[idx + 3] = 255;
    }
  }

  return out;
}

export function estimateCanvasBytes(width: number, height: number): number {
  const w = Math.max(0, Math.floor(Number.isFinite(width) ? width : 0));
  const h = Math.max(0, Math.floor(Number.isFinite(height) ? height : 0));
  return w * h * 4;
}

export function buildProceduralCacheKey(
  config: ProceduralConfig,
  width: number,
  height: number,
): string {
  return [
    config.version,
    config.generatorType,
    config.seed,
    config.palette.join(','),
    config.complexity,
    config.density,
    config.scale,
    config.rotation,
    config.grain,
    config.blendMode ?? 'normal',
    width,
    height,
  ].join('|');
}

/**
 * Dual-limit LRU cache enforcing maxEntries (default 24) AND maxBytes (default 64 MiB),
 * immediately zeroing evicted canvas dimensions (`width = 0; height = 0`) to free bitmap memory.
 */
export class BoundedProceduralCanvasCache<
  TCanvas extends { width: number; height: number },
> {
  private readonly maxEntries: number;
  private readonly maxBytes: number;
  private readonly map = new Map<string, { canvas: TCanvas; bytes: number }>();
  private currentBytes = 0;

  constructor(
    maxEntries = MAX_PROCEDURAL_CACHE_ENTRIES,
    maxBytes = MAX_PROCEDURAL_CACHE_BYTES,
  ) {
    this.maxEntries = Math.max(1, maxEntries);
    this.maxBytes = Math.max(1024, maxBytes);
  }

  get size(): number {
    return this.map.size;
  }

  get totalBytes(): number {
    return this.currentBytes;
  }

  get(key: string): TCanvas | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    // Promote to most-recently-used
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.canvas;
  }

  set(key: string, canvas: TCanvas): void {
    const existing = this.map.get(key);
    if (existing) {
      this.currentBytes -= existing.bytes;
      if (existing.canvas !== canvas) {
        existing.canvas.width = 0;
        existing.canvas.height = 0;
      }
      this.map.delete(key);
    }

    const bytes = estimateCanvasBytes(canvas.width, canvas.height);

    // Evict oldest entries until inserting `bytes` stays within both limits
    while (
      this.map.size > 0 &&
      (this.map.size >= this.maxEntries ||
        this.currentBytes + bytes > this.maxBytes)
    ) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey === undefined) break;
      const evicted = this.map.get(oldestKey);
      if (evicted) {
        this.currentBytes -= evicted.bytes;
        evicted.canvas.width = 0;
        evicted.canvas.height = 0;
      }
      this.map.delete(oldestKey);
    }

    this.map.set(key, { canvas, bytes });
    this.currentBytes += bytes;
  }

  clear(): void {
    for (const entry of this.map.values()) {
      entry.canvas.width = 0;
      entry.canvas.height = 0;
    }
    this.map.clear();
    this.currentBytes = 0;
  }
}
