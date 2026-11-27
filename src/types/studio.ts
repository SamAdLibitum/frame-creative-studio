export type AppView = 'dashboard' | 'editor';

export type NavItemId = 'dashboard' | 'projects' | 'templates' | 'settings';

export type EditorToolCategory =
  | 'uploads'
  | 'layout'
  | 'templates'
  | 'text'
  | 'elements'
  | 'photos'
  | 'background'
  | 'layers';

export type TemplateCategory =
  | 'Minimalist'
  | 'Editorial'
  | 'Korean Aesthetic'
  | 'Analog Film'
  | 'Polaroid'
  | 'Scrapbook'
  | 'Photo Dump'
  | 'Travel Diary'
  | 'Lifestyle'
  | 'Cinematic'
  | 'Typography Focus'
  | 'Collage';

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1920;

export interface UploadedPhoto {
  id: string;
  name: string;
  objectUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  sizeBytes: number;
}

export type FrameMaskKind =
  | 'none'
  | 'rect'
  | 'rounded-rect'
  | 'circle'
  | 'oval'
  | 'arch'
  | 'polaroid'
  | 'custom-ratio';

export interface PhotoCropParams {
  zoom: number; // 1.0 – 3.0
  offsetX: number; // -1.0 – 1.0
  offsetY: number; // -1.0 – 1.0
}

export type FilterPresetId =
  | 'original'
  | 'clean'
  | 'warm'
  | 'cool'
  | 'vintage'
  | 'film'
  | 'fade'
  | 'monochrome'
  | 'cinematic'
  | 'soft';

export interface PhotoAdjustments {
  brightness: number; // -100 .. 100
  contrast: number; // -100 .. 100
  saturation: number; // -100 .. 100
  warmth: number; // -100 .. 100
  exposure: number; // -100 .. 100
  blur: number; // 0 .. 20
  fade: number; // 0 .. 100
  grain: number; // 0 .. 100
  sepia: number; // 0 .. 100
  grayscale: number; // 0 .. 100
}

export interface BaseCanvasElement {
  id: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
}

export interface CanvasPhotoElement extends BaseCanvasElement {
  type: 'photo';
  photoId: string; // '' when acting as an empty frame waiting for a photo
  width: number;
  height: number;
  keepAspectRatio: boolean;
  crop?: PhotoCropParams;
  frameShape?: FrameMaskKind;
  cornerRadius?: number;
  frameStroke?: string;
  frameStrokeWidth?: number;
  frameBackground?: string;
  filterPreset?: FilterPresetId;
  presetIntensity?: number; // 0 .. 100
  adjustments?: PhotoAdjustments;
  layoutSlotIndex?: number;
}

export interface CanvasTextElement extends BaseCanvasElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  align: 'left' | 'center' | 'right';
  fill: string;
  lineHeight: number;
  letterSpacing: number;
  backgroundColor: string;
  backgroundPadding: number;
  backgroundRadius: number;
  width: number;
}

export type ShapeKind =
  | 'rect'
  | 'rounded-rect'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'polygon';

export interface CanvasShapeElement extends BaseCanvasElement {
  type: 'shape';
  shapeType: ShapeKind;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
}

export type LineKind = 'straight' | 'dashed' | 'arrow' | 'double-arrow';

export interface CanvasLineElement extends BaseCanvasElement {
  type: 'line';
  lineType: LineKind;
  length: number;
  stroke: string;
  strokeWidth: number;
}

export type DecorativeKind =
  | 'star'
  | 'sparkle'
  | 'heart'
  | 'dots'
  | 'arrow-deco'
  | 'floral'
  | 'geometric';

export interface CanvasDecorativeElement extends BaseCanvasElement {
  type: 'decorative';
  decoType: DecorativeKind;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export type CanvasElement =
  | CanvasPhotoElement
  | CanvasTextElement
  | CanvasShapeElement
  | CanvasLineElement
  | CanvasDecorativeElement;

export type TemplateElementBlueprint = CanvasElement extends infer T
  ? T extends CanvasElement
    ? Omit<T, 'id'>
    : never
  : never;

export interface StoryTemplate {
  id: string;
  title: string;
  category: TemplateCategory;
  photoCount: number;
  aspectRatio: '9:16';
  accentColor: string;
  surfaceColor: string;
  badge?: string;
  defaultLayoutId?: string;
  elements?: TemplateElementBlueprint[];
}

export interface StoryProject {
  id: string;
  title: string;
  templateCategory: TemplateCategory;
  photoCount: number;
  updatedAt: string;
  accentColor: string;
  surfaceColor: string;
  thumbnailDataUrl?: string;
}

export interface AppliedSmartLayoutState {
  layoutId: string;
  photoIds: string[];
  spacing: number;
  margin: number;
  cornerRadius: number;
}

export interface CanvasDocumentState {
  backgroundColor: string;
  elements: CanvasElement[];
  smartLayout?: AppliedSmartLayoutState;
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

export interface StoredProject {
  id: string;
  name: string;
  updatedAt: number;
  templateCategory?: TemplateCategory;
  thumbnailDataUrl?: string;
  document: CanvasDocumentState;
}
