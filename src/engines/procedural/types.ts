export type ProceduralGeneratorType =
  | 'mesh-gradient'
  | 'organic-blobs'
  | 'layered-waves'
  | 'geometric-grid'
  | 'halftone-dots'
  | 'starfield-confetti'
  | 'light-leak'
  | 'bokeh-glow';

export type ProceduralBlendMode =
  | 'normal'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'lighten';

export interface ProceduralConfig {
  version: number;
  generatorType: ProceduralGeneratorType;
  seed: number;
  palette: string[];
  complexity: number; // 1–100
  density: number; // 1–100
  scale: number; // 20–200
  rotation: number; // 0–360
  grain: number; // 0–50
  blendMode?: ProceduralBlendMode;
}

export interface ProceduralGeneratorMeta {
  id: ProceduralGeneratorType;
  label: string;
  shortLabel: string;
  description: string;
  hasTransparentNegativeSpace: boolean;
}

export const PROCEDURAL_GENERATORS: ProceduralGeneratorMeta[] = [
  {
    id: 'mesh-gradient',
    label: 'Mesh Gradient',
    shortLabel: 'Mesh',
    description: 'Gradasi atmosferik berlapis dengan sebaran cahaya lembut.',
    hasTransparentNegativeSpace: false,
  },
  {
    id: 'organic-blobs',
    label: 'Organic Blobs',
    shortLabel: 'Blobs',
    description: 'Bentuk kurva Bezier organik mengambang dengan ruang negatif transparan.',
    hasTransparentNegativeSpace: true,
  },
  {
    id: 'layered-waves',
    label: 'Layered Waves',
    shortLabel: 'Waves',
    description: 'Lapisan gelombang multi-harmonik dengan kedalaman ritmis.',
    hasTransparentNegativeSpace: true,
  },
  {
    id: 'geometric-grid',
    label: 'Geometric Grid',
    shortLabel: 'Bauhaus',
    description: 'Komposisi sel modular bergaya Bauhaus dengan keseimbangan ruang.',
    hasTransparentNegativeSpace: false,
  },
  {
    id: 'halftone-dots',
    label: 'Halftone Dots',
    shortLabel: 'Halftone',
    description: 'Matriks titik editorial bermodulasi gelombang dengan latar transparan.',
    hasTransparentNegativeSpace: true,
  },
  {
    id: 'starfield-confetti',
    label: 'Starfield & Confetti',
    shortLabel: 'Starfield',
    description: 'Sebaran bintang 4-sudut, kapsul konfeti, dan partikel cahaya.',
    hasTransparentNegativeSpace: true,
  },
  {
    id: 'light-leak',
    label: 'Light Leak',
    shortLabel: 'Light Leak',
    description: 'Pendar cahaya analog hangat di tepi dan sudut dengan tengah transparan.',
    hasTransparentNegativeSpace: true,
  },
  {
    id: 'bokeh-glow',
    label: 'Bokeh Glow',
    shortLabel: 'Bokeh',
    description: 'Lingkaran cahaya buram berlapis dengan tepian lembut dan rim tipis.',
    hasTransparentNegativeSpace: true,
  },
];

export interface MeshOrbDescriptor {
  cx: number;
  cy: number;
  radius: number;
  color: string;
  alpha: number;
}

export interface CubicBezierSegment {
  cp1x: number;
  cp1y: number;
  cp2x: number;
  cp2y: number;
  x: number;
  y: number;
}

export interface OrganicBlobDescriptor {
  cx: number;
  cy: number;
  outerRadius: number;
  startX: number;
  startY: number;
  segments: CubicBezierSegment[];
  color: string;
  alpha: number;
}

export interface WaveLayerDescriptor {
  points: Array<{ x: number; y: number }>;
  bottomY: number;
  color: string;
  alpha: number;
}

export type BauhausMotifKind =
  | 'empty'
  | 'circle'
  | 'quarter-arc'
  | 'diagonal'
  | 'half-rect'
  | 'ring';

export interface GridCellDescriptor {
  x: number;
  y: number;
  size: number;
  motif: BauhausMotifKind;
  motifScale: number;
  quarterTurn: 0 | 1 | 2 | 3;
  primaryColor: string;
  secondaryColor?: string;
}

export interface HalftoneDotDescriptor {
  cx: number;
  cy: number;
  radius: number;
  color: string;
  alpha: number;
}

export type ParticleShapeKind = 'glow-dot' | 'capsule' | 'star-4';

export interface StarfieldParticleDescriptor {
  x: number;
  y: number;
  size: number;
  aspect: number;
  angleRad: number;
  kind: ParticleShapeKind;
  color: string;
  alpha: number;
}

export interface LightLeakBeamDescriptor {
  x: number;
  y: number;
  rx: number;
  ry: number;
  angleRad: number;
  color: string;
  alpha: number;
}

export interface BokehOrbDescriptor {
  cx: number;
  cy: number;
  radius: number;
  rimStrength: number;
  color: string;
  alpha: number;
}

export type ProceduralScenePayload =
  | {
      generatorType: 'mesh-gradient';
      baseColor: string;
      orbs: MeshOrbDescriptor[];
    }
  | {
      generatorType: 'organic-blobs';
      blobs: OrganicBlobDescriptor[];
    }
  | {
      generatorType: 'layered-waves';
      waves: WaveLayerDescriptor[];
    }
  | {
      generatorType: 'geometric-grid';
      baseColor: string;
      cells: GridCellDescriptor[];
    }
  | {
      generatorType: 'halftone-dots';
      dots: HalftoneDotDescriptor[];
    }
  | {
      generatorType: 'starfield-confetti';
      particles: StarfieldParticleDescriptor[];
    }
  | {
      generatorType: 'light-leak';
      beams: LightLeakBeamDescriptor[];
    }
  | {
      generatorType: 'bokeh-glow';
      bokehs: BokehOrbDescriptor[];
    };

export interface ProceduralScene {
  config: ProceduralConfig;
  width: number;
  height: number;
  bleedFactor: number;
  workWidth: number;
  workHeight: number;
  payload: ProceduralScenePayload;
}
