import {
  ArrowRight,
  Circle,
  Diamond,
  Frame,
  Heart,
  Hexagon,
  Minus,
  MoveRight,
  Smile,
  Sparkles,
  Square,
  Star,
  Triangle,
} from 'lucide-react';
import { useState } from 'react';
import { FRAME_SHAPE_DEFINITIONS } from '@/features/story-creator/utils/frameMaskPaths';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  type CanvasDecorativeElement,
  type CanvasLineElement,
  type CanvasPhotoElement,
  type CanvasShapeElement,
  type DecorativeKind,
  type LineKind,
  type ShapeKind,
} from '@/types/studio';

interface ElementsPanelProps {
  onAddShape: (preset: Omit<CanvasShapeElement, 'id'>) => void;
  onAddLine: (preset: Omit<CanvasLineElement, 'id'>) => void;
  onAddDecorative: (preset: Omit<CanvasDecorativeElement, 'id'>) => void;
  onAddPhotoFrame: (preset: Omit<CanvasPhotoElement, 'id'>) => void;
}

type SubTab = 'frames' | 'shapes' | 'lines' | 'stickers' | 'decorative';

function shapePreset(
  shapeType: ShapeKind,
  name: string,
): Omit<CanvasShapeElement, 'id'> {
  return {
    type: 'shape',
    name,
    shapeType,
    x: CANVAS_WIDTH / 2 - 120,
    y: CANVAS_HEIGHT / 2 - 120,
    width: 240,
    height: 240,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    fill: '#ffffff',
    stroke: '',
    strokeWidth: 0,
    cornerRadius: shapeType === 'rounded-rect' ? 28 : 0,
  };
}

function linePreset(
  lineType: LineKind,
  name: string,
): Omit<CanvasLineElement, 'id'> {
  return {
    type: 'line',
    name,
    lineType,
    x: CANVAS_WIDTH / 2 - 180,
    y: CANVAS_HEIGHT / 2,
    length: 360,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    stroke: '#ffffff',
    strokeWidth: 4,
  };
}

function decoPreset(
  decoType: DecorativeKind,
  name: string,
  fill = '#ffffff',
  size = 110,
): Omit<CanvasDecorativeElement, 'id'> {
  return {
    type: 'decorative',
    name,
    decoType,
    x: CANVAS_WIDTH / 2 - size / 2,
    y: CANVAS_HEIGHT / 2 - size / 2,
    width: size,
    height: size,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    fill,
    stroke: '',
    strokeWidth: 0,
  };
}

const PHOTO_MASK_FRAMES: Array<{
  label: string;
  preset: Omit<CanvasPhotoElement, 'id'>;
}> = FRAME_SHAPE_DEFINITIONS.map((def) => ({
  label: `Mask · ${def.label}`,
  preset: {
    type: 'photo',
    name: `Frame ${def.label}`,
    photoId: '',
    x: Math.round((CANVAS_WIDTH - def.defaultWidth) / 2),
    y: Math.round((CANVAS_HEIGHT - def.defaultHeight) / 2),
    width: def.defaultWidth,
    height: def.defaultHeight,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    keepAspectRatio: def.id === 'circle',
    crop: { zoom: 1, offsetX: 0, offsetY: 0 },
    frameShape: def.id,
    cornerRadius: def.defaultRadius,
    frameBackground: def.defaultBackground,
    frameStroke: def.defaultStroke,
    frameStrokeWidth: def.defaultStrokeWidth,
  },
}));

const SHAPES: Array<{
  label: string;
  icon: typeof Square;
  preset: Omit<CanvasShapeElement, 'id'>;
}> = [
  { label: 'Rectangle', icon: Square, preset: shapePreset('rect', 'Rectangle') },
  {
    label: 'Rounded Rect',
    icon: Square,
    preset: shapePreset('rounded-rect', 'Rounded Rect'),
  },
  { label: 'Circle', icon: Circle, preset: shapePreset('circle', 'Circle') },
  {
    label: 'Ellipse',
    icon: Circle,
    preset: { ...shapePreset('ellipse', 'Ellipse'), width: 280, height: 180 },
  },
  {
    label: 'Triangle',
    icon: Triangle,
    preset: shapePreset('triangle', 'Triangle'),
  },
  {
    label: 'Polygon',
    icon: Hexagon,
    preset: shapePreset('polygon', 'Polygon'),
  },
];

const LINES: Array<{
  label: string;
  icon: typeof Minus;
  preset: Omit<CanvasLineElement, 'id'>;
}> = [
  { label: 'Straight', icon: Minus, preset: linePreset('straight', 'Line') },
  { label: 'Dashed', icon: Minus, preset: linePreset('dashed', 'Dashed Line') },
  { label: 'Arrow', icon: MoveRight, preset: linePreset('arrow', 'Arrow') },
  {
    label: 'Double Arrow',
    icon: ArrowRight,
    preset: linePreset('double-arrow', 'Double Arrow'),
  },
];

const STICKERS: Array<{
  label: string;
  icon: typeof Smile;
  preset: Omit<CanvasDecorativeElement, 'id'>;
}> = [
  {
    label: 'Gold Star',
    icon: Star,
    preset: decoPreset('star', 'Gold Star', '#fbbf24', 140),
  },
  {
    label: 'Pink Heart',
    icon: Heart,
    preset: decoPreset('heart', 'Pink Heart', '#f472b6', 130),
  },
  {
    label: 'Neon Sparkle',
    icon: Sparkles,
    preset: decoPreset('sparkle', 'Neon Sparkle', '#a3e635', 140),
  },
  {
    label: 'Pastel Floral',
    icon: Smile,
    preset: decoPreset('floral', 'Pastel Floral', '#c4b5fd', 150),
  },
];

const DECORATIVES: Array<{
  label: string;
  icon: typeof Star;
  preset: Omit<CanvasDecorativeElement, 'id'>;
}> = [
  { label: 'Star', icon: Star, preset: decoPreset('star', 'Star') },
  {
    label: 'Sparkle',
    icon: Sparkles,
    preset: decoPreset('sparkle', 'Sparkle'),
  },
  { label: 'Heart', icon: Heart, preset: decoPreset('heart', 'Heart') },
  { label: 'Dots', icon: Diamond, preset: decoPreset('dots', 'Dots') },
  {
    label: 'Arrow Deco',
    icon: ArrowRight,
    preset: decoPreset('arrow-deco', 'Arrow Deco'),
  },
  { label: 'Floral', icon: Sparkles, preset: decoPreset('floral', 'Floral') },
  {
    label: 'Geometric',
    icon: Hexagon,
    preset: decoPreset('geometric', 'Geometric'),
  },
];

export function ElementsPanel({
  onAddShape,
  onAddLine,
  onAddDecorative,
  onAddPhotoFrame,
}: ElementsPanelProps) {
  const [tab, setTab] = useState<SubTab>('frames');

  const tabs: Array<{ id: SubTab; label: string }> = [
    { id: 'frames', label: 'Frames' },
    { id: 'shapes', label: 'Shapes' },
    { id: 'lines', label: 'Lines' },
    { id: 'stickers', label: 'Stickers' },
    { id: 'decorative', label: 'Deco' },
  ];

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
      <div className="flex flex-wrap gap-1 rounded-lg border border-white/8 bg-white/[0.02] p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
              tab === t.id
                ? 'bg-white/12 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'frames' && (
        <p className="text-[10px] leading-relaxed text-neutral-400">
          Pilih bentuk Photo Mask Frame, lalu klik foto di Uploads/Properties
          untuk memasukkannya ke dalam frame.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {tab === 'frames' &&
          PHOTO_MASK_FRAMES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onAddPhotoFrame(item.preset)}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.02] p-3 transition-colors hover:border-sky-400/40 hover:bg-white/[0.06]"
            >
              <Frame className="h-5 w-5 text-sky-300" />
              <span className="text-center text-[10px] text-neutral-300">
                {item.label}
              </span>
            </button>
          ))}
        {tab === 'shapes' &&
          SHAPES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onAddShape(item.preset)}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.02] p-3 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
              >
                <Icon className="h-5 w-5 text-neutral-300" />
                <span className="text-[10px] text-neutral-400">
                  {item.label}
                </span>
              </button>
            );
          })}
        {tab === 'lines' &&
          LINES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onAddLine(item.preset)}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.02] p-3 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
              >
                <Icon className="h-5 w-5 text-neutral-300" />
                <span className="text-[10px] text-neutral-400">
                  {item.label}
                </span>
              </button>
            );
          })}
        {tab === 'stickers' &&
          STICKERS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onAddDecorative(item.preset)}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.02] p-3 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
              >
                <Icon
                  className="h-5 w-5"
                  style={{ color: item.preset.fill }}
                />
                <span className="text-[10px] text-neutral-400">
                  {item.label}
                </span>
              </button>
            );
          })}
        {tab === 'decorative' &&
          DECORATIVES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onAddDecorative(item.preset)}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.02] p-3 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
              >
                <Icon className="h-5 w-5 text-neutral-300" />
                <span className="text-[10px] text-neutral-400">
                  {item.label}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
}
