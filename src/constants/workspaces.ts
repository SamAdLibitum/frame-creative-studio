import type {
  CanvasPresetId,
  EditorToolCategory,
  WorkspaceMode,
} from '@/types/studio';

export interface WorkspaceDefinition {
  id: WorkspaceMode;
  name: string;
  tagline: string;
  defaultPreset: CanvasPresetId;
  defaultTool: EditorToolCategory;
  badge: string;
  accentColor: string;
}

export const WORKSPACE_DEFINITIONS: WorkspaceDefinition[] = [
  {
    id: 'story',
    name: 'Story Studio',
    tagline: 'Desain Instagram Story 9:16 dengan foto, tipografi, filter, dan optical overlay.',
    defaultPreset: 'story-9-16',
    defaultTool: 'uploads',
    badge: '9:16',
    accentColor: '#D9C2A7',
  },
  {
    id: 'photo',
    name: 'Photo Darkroom',
    tagline: 'Ruang pengolahan foto presisi: filter analog, crop, adjustments, dan light leak.',
    defaultPreset: 'portrait-4-5',
    defaultTool: 'uploads',
    badge: '4:5',
    accentColor: '#C2594B',
  },
  {
    id: 'poster',
    name: 'Poster & Graphic Studio',
    tagline: 'Tipografi editorial, procedural graphics, Swiss grid, dan komposisi poster A4.',
    defaultPreset: 'poster-a4',
    defaultTool: 'procedural',
    badge: 'A4',
    accentColor: '#9EB0C0',
  },
  {
    id: 'collage',
    name: 'Collage Studio',
    tagline: 'Susun 1–6 foto secara otomatis dengan Smart Layout Engine dan frame masking.',
    defaultPreset: 'square-1-1',
    defaultTool: 'layout',
    badge: '1:1',
    accentColor: '#B3BEB0',
  },
  {
    id: 'moodboard',
    name: 'Moodboard Studio',
    tagline: 'Eksplorasi palet warna, referensi visual, dan komposisi kanvas lebar 16:9.',
    defaultPreset: 'landscape-16-9',
    defaultTool: 'elements',
    badge: '16:9',
    accentColor: '#C8A972',
  },
  {
    id: 'carousel',
    name: 'Carousel Studio',
    tagline: 'Alur kerja multi-slide editorial dengan tema global, overview, dan ekspor berurutan.',
    defaultPreset: 'portrait-4-5',
    defaultTool: 'text',
    badge: 'Multi-Slide',
    accentColor: '#D8C2D6',
  },
];

export function getWorkspaceDefinition(
  mode?: WorkspaceMode,
): WorkspaceDefinition {
  return (
    WORKSPACE_DEFINITIONS.find((w) => w.id === (mode ?? 'story')) ??
    WORKSPACE_DEFINITIONS[0]
  );
}
