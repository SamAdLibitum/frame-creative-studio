import type { StoryTemplate, TemplateCategory, TemplateElementBlueprint } from '@/types/studio';

const W = 1080;
const H = 1920;

function tplEl(partial: TemplateElementBlueprint): TemplateElementBlueprint {
  return partial;
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'Minimalist', 'Editorial', 'Korean Aesthetic', 'Analog Film',
  'Polaroid', 'Scrapbook', 'Photo Dump', 'Travel Diary',
  'Lifestyle', 'Cinematic', 'Typography Focus', 'Collage',
];

export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'tpl-minimal-01', title: 'Quiet Frame', category: 'Minimalist', photoCount: 1,
    aspectRatio: '9:16', accentColor: '#e5e5e5', surfaceColor: '#18181b', badge: 'Populer',
    defaultLayoutId: 'single-framed',
    elements: [
      tplEl({ type: 'shape', name: 'Border', shapeType: 'rect', x: 40, y: 40, width: W - 80, height: H - 80, rotation: 0, opacity: 1, visible: true, locked: false, fill: 'transparent', stroke: '#e5e5e5', strokeWidth: 2, cornerRadius: 0 }),
      tplEl({ type: 'text', name: 'Judul', text: 'Your Title', fontFamily: 'Inter', fontSize: 48, fontWeight: 'bold', fontStyle: 'normal', align: 'center', fill: '#e5e5e5', lineHeight: 1.2, letterSpacing: 2, backgroundColor: '', backgroundPadding: 0, backgroundRadius: 0, x: W / 2 - 200, y: H - 300, width: 400, rotation: 0, opacity: 1, visible: true, locked: false }),
    ],
  },
  {
    id: 'tpl-editorial-01', title: 'Vogue Issue 04', category: 'Editorial', photoCount: 2,
    aspectRatio: '9:16', accentColor: '#f59e0b', surfaceColor: '#1c1917', badge: 'Baru',
    defaultLayoutId: 'two-editorial',
    elements: [
      tplEl({ type: 'shape', name: 'Accent Bar', shapeType: 'rect', x: 60, y: 160, width: 4, height: 200, rotation: 0, opacity: 1, visible: true, locked: false, fill: '#f59e0b', stroke: '', strokeWidth: 0, cornerRadius: 0 }),
      tplEl({ type: 'text', name: 'Headline', text: 'EDITORIAL', fontFamily: 'Playfair Display', fontSize: 72, fontWeight: 'bold', fontStyle: 'italic', align: 'left', fill: '#f5f5f4', lineHeight: 1.1, letterSpacing: 4, backgroundColor: '', backgroundPadding: 0, backgroundRadius: 0, x: 90, y: 170, width: 900, rotation: 0, opacity: 1, visible: true, locked: false }),
      tplEl({ type: 'text', name: 'Caption', text: 'Ceritakan kisahmu', fontFamily: 'Inter', fontSize: 24, fontWeight: 'normal', fontStyle: 'normal', align: 'left', fill: '#a8a29e', lineHeight: 1.5, letterSpacing: 0, backgroundColor: '', backgroundPadding: 0, backgroundRadius: 0, x: 90, y: 300, width: 500, rotation: 0, opacity: 0.7, visible: true, locked: false }),
    ],
  },
  {
    id: 'tpl-korean-01', title: 'Seoul Morning', category: 'Korean Aesthetic', photoCount: 3,
    aspectRatio: '9:16', accentColor: '#f9a8d4', surfaceColor: '#1f1a1c',
    defaultLayoutId: 'three-editorial',
    elements: [
      tplEl({ type: 'shape', name: 'Circle Frame', shapeType: 'circle', x: W / 2 - 160, y: 360, width: 320, height: 320, rotation: 0, opacity: 0.35, visible: true, locked: false, fill: 'transparent', stroke: '#f9a8d4', strokeWidth: 2, cornerRadius: 0 }),
      tplEl({ type: 'text', name: 'Title', text: '오늘의 순간', fontFamily: 'DM Sans', fontSize: 42, fontWeight: 'bold', fontStyle: 'normal', align: 'center', fill: '#f9a8d4', lineHeight: 1.3, letterSpacing: 1, backgroundColor: '', backgroundPadding: 0, backgroundRadius: 0, x: W / 2 - 250, y: H - 350, width: 500, rotation: 0, opacity: 1, visible: true, locked: false }),
    ],
  },
  {
    id: 'tpl-analog-01', title: 'Kodak 400TX', category: 'Analog Film', photoCount: 1,
    aspectRatio: '9:16', accentColor: '#fb923c', surfaceColor: '#1a1512', badge: 'Populer',
    defaultLayoutId: 'single-framed',
    elements: [
      tplEl({ type: 'shape', name: 'Film Border', shapeType: 'rect', x: 50, y: 300, width: W - 100, height: H - 600, rotation: 0, opacity: 1, visible: true, locked: false, fill: 'transparent', stroke: '#fb923c', strokeWidth: 1, cornerRadius: 4 }),
      tplEl({ type: 'text', name: 'Film Code', text: '04A  KODAK 400TX', fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 'normal', fontStyle: 'normal', align: 'left', fill: '#fb923c', lineHeight: 1, letterSpacing: 3, backgroundColor: '', backgroundPadding: 0, backgroundRadius: 0, x: 70, y: H - 260, width: 500, rotation: 0, opacity: 0.8, visible: true, locked: false }),
      tplEl({ type: 'text', name: 'Date', text: 'NOV 2026', fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', align: 'right', fill: '#a8a29e', lineHeight: 1, letterSpacing: 2, backgroundColor: '', backgroundPadding: 0, backgroundRadius: 0, x: W - 300, y: H - 260, width: 230, rotation: 0, opacity: 0.6, visible: true, locked: false }),
    ],
  },
  {
    id: 'tpl-polaroid-01', title: 'Instant Memory', category: 'Polaroid', photoCount: 2,
    aspectRatio: '9:16', accentColor: '#e2e8f0', surfaceColor: '#16181d',
    defaultLayoutId: 'two-vertical-split',
    elements: [
      tplEl({ type: 'shape', name: 'Polaroid Frame', shapeType: 'rounded-rect', x: W / 2 - 300, y: 350, width: 600, height: 720, rotation: -3, opacity: 1, visible: true, locked: false, fill: '#fafaf9', stroke: '', strokeWidth: 0, cornerRadius: 8 }),
      tplEl({ type: 'text', name: 'Memo', text: 'momen berharga ♡', fontFamily: 'Lora', fontSize: 22, fontWeight: 'normal', fontStyle: 'italic', align: 'center', fill: '#44403c', lineHeight: 1.5, letterSpacing: 0, backgroundColor: '', backgroundPadding: 0, backgroundRadius: 0, x: W / 2 - 250, y: 1000, width: 500, rotation: -3, opacity: 1, visible: true, locked: false }),
    ],
  },
  {
    id: 'tpl-scrapbook-01', title: 'Paper & Tape', category: 'Scrapbook', photoCount: 4,
    aspectRatio: '9:16', accentColor: '#a3e635', surfaceColor: '#171a14',
    defaultLayoutId: 'four-mosaic',
    elements: [
      tplEl({ type: 'shape', name: 'Tape 1', shapeType: 'rect', x: 200, y: 280, width: 120, height: 30, rotation: 15, opacity: 0.6, visible: true, locked: false, fill: '#a3e635', stroke: '', strokeWidth: 0, cornerRadius: 2 }),
      tplEl({ type: 'shape', name: 'Tape 2', shapeType: 'rect', x: 700, y: 900, width: 120, height: 30, rotation: -10, opacity: 0.6, visible: true, locked: false, fill: '#fde047', stroke: '', strokeWidth: 0, cornerRadius: 2 }),
      tplEl({ type: 'text', name: 'Date Label', text: '27 Nov 2026', fontFamily: 'JetBrains Mono', fontSize: 16, fontWeight: 'normal', fontStyle: 'normal', align: 'left', fill: '#a3e635', lineHeight: 1, letterSpacing: 2, backgroundColor: '#171a14', backgroundPadding: 8, backgroundRadius: 4, x: 60, y: H - 180, width: 300, rotation: 0, opacity: 0.9, visible: true, locked: false }),
    ],
  },
  {
    id: 'tpl-photodump-01', title: 'Weekend Recap', category: 'Photo Dump', photoCount: 5,
    aspectRatio: '9:16', accentColor: '#38bdf8', surfaceColor: '#111820', badge: 'Multi-Foto',
    defaultLayoutId: 'five-collage',
    elements: [
      tplEl({ type: 'text', name: 'Title', text: 'photo dump ✦', fontFamily: 'Space Grotesk', fontSize: 36, fontWeight: 'bold', fontStyle: 'normal', align: 'center', fill: '#38bdf8', lineHeight: 1.2, letterSpacing: 1, backgroundColor: '', backgroundPadding: 0, backgroundRadius: 0, x: W / 2 - 250, y: 100, width: 500, rotation: 0, opacity: 1, visible: true, locked: false }),
      tplEl({ type: 'line', name: 'Divider', lineType: 'straight', x: W / 2 - 150, y: 170, length: 300, rotation: 0, opacity: 0.4, visible: true, locked: false, stroke: '#38bdf8', strokeWidth: 1 }),
    ],
  },
  {
    id: 'tpl-travel-01', title: 'Kyoto Journal', category: 'Travel Diary', photoCount: 3,
    aspectRatio: '9:16', accentColor: '#34d399', surfaceColor: '#111b18',
    defaultLayoutId: 'three-triptych',
    elements: [
      tplEl({ type: 'decorative', name: 'Pin', decoType: 'arrow-deco', x: 100, y: 150, width: 40, height: 40, rotation: 45, opacity: 0.7, visible: true, locked: false, fill: '#34d399', stroke: '', strokeWidth: 0 }),
      tplEl({ type: 'text', name: 'Location', text: 'KYOTO, JAPAN', fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 'bold', fontStyle: 'normal', align: 'left', fill: '#34d399', lineHeight: 1, letterSpacing: 6, backgroundColor: '', backgroundPadding: 0, backgroundRadius: 0, x: 80, y: H - 280, width: 600, rotation: 0, opacity: 1, visible: true, locked: false }),
      tplEl({ type: 'text', name: 'Note', text: 'catatan perjalanan', fontFamily: 'Lora', fontSize: 20, fontWeight: 'normal', fontStyle: 'italic', align: 'left', fill: '#a8a29e', lineHeight: 1.5, letterSpacing: 0, backgroundColor: '', backgroundPadding: 0, backgroundRadius: 0, x: 80, y: H - 230, width: 400, rotation: 0, opacity: 0.7, visible: true, locked: false }),
    ],
  },
  {
    id: 'tpl-lifestyle-01', title: 'Daily Ritual', category: 'Lifestyle', photoCount: 2,
    aspectRatio: '9:16', accentColor: '#c4b5fd', surfaceColor: '#1a1625',
    defaultLayoutId: 'two-horizontal-split',
    elements: [
      tplEl({ type: 'decorative', name: 'Sparkle', decoType: 'sparkle', x: W - 180, y: 120, width: 48, height: 48, rotation: 0, opacity: 0.5, visible: true, locked: false, fill: '#c4b5fd', stroke: '', strokeWidth: 0 }),
      tplEl({ type: 'text', name: 'Title', text: 'daily ritual', fontFamily: 'Syne', fontSize: 56, fontWeight: 'bold', fontStyle: 'normal', align: 'center', fill: '#c4b5fd', lineHeight: 1.1, letterSpacing: 2, backgroundColor: '', backgroundPadding: 0, backgroundRadius: 0, x: W / 2 - 300, y: H - 350, width: 600, rotation: 0, opacity: 1, visible: true, locked: false }),
    ],
  },
  {
    id: 'tpl-cinematic-01', title: 'Widescreen Noir', category: 'Cinematic', photoCount: 1,
    aspectRatio: '9:16', accentColor: '#a3a3a3', surfaceColor: '#0a0a0a', badge: 'Baru',
    defaultLayoutId: 'single-full-bleed',
    elements: [
      tplEl({ type: 'shape', name: 'Letterbox Top', shapeType: 'rect', x: 0, y: 0, width: W, height: 300, rotation: 0, opacity: 1, visible: true, locked: false, fill: '#000000', stroke: '', strokeWidth: 0, cornerRadius: 0 }),
      tplEl({ type: 'shape', name: 'Letterbox Bottom', shapeType: 'rect', x: 0, y: H - 300, width: W, height: 300, rotation: 0, opacity: 1, visible: true, locked: false, fill: '#000000', stroke: '', strokeWidth: 0, cornerRadius: 0 }),
      tplEl({ type: 'text', name: 'Subtitle', text: '"setiap bingkai menceritakan sesuatu"', fontFamily: 'Lora', fontSize: 24, fontWeight: 'normal', fontStyle: 'italic', align: 'center', fill: '#d4d4d4', lineHeight: 1.5, letterSpacing: 0, backgroundColor: '', backgroundPadding: 0, backgroundRadius: 0, x: W / 2 - 400, y: H - 240, width: 800, rotation: 0, opacity: 0.9, visible: true, locked: false }),
    ],
  },
  {
    id: 'tpl-typo-01', title: 'Bold Statement', category: 'Typography Focus', photoCount: 0,
    aspectRatio: '9:16', accentColor: '#fbbf24', surfaceColor: '#0f0f0f',
    elements: [
      tplEl({ type: 'text', name: 'Big Text', text: 'MAKE\nIT\nBOLD.', fontFamily: 'Syne', fontSize: 120, fontWeight: 'bold', fontStyle: 'normal', align: 'left', fill: '#fbbf24', lineHeight: 0.95, letterSpacing: 0, backgroundColor: '', backgroundPadding: 0, backgroundRadius: 0, x: 80, y: H / 2 - 250, width: 900, rotation: 0, opacity: 1, visible: true, locked: false }),
      tplEl({ type: 'line', name: 'Accent Line', lineType: 'straight', x: 80, y: H / 2 + 200, length: 400, rotation: 0, opacity: 0.8, visible: true, locked: false, stroke: '#fbbf24', strokeWidth: 4 }),
    ],
  },
  {
    id: 'tpl-collage-01', title: 'Mixed Media', category: 'Collage', photoCount: 4,
    aspectRatio: '9:16', accentColor: '#f472b6', surfaceColor: '#1a1218',
    defaultLayoutId: 'four-asymmetric',
    elements: [
      tplEl({ type: 'shape', name: 'Frame 1', shapeType: 'rounded-rect', x: 50, y: 200, width: 460, height: 600, rotation: -2, opacity: 1, visible: true, locked: false, fill: 'transparent', stroke: '#f472b6', strokeWidth: 2, cornerRadius: 12 }),
      tplEl({ type: 'shape', name: 'Frame 2', shapeType: 'rounded-rect', x: 560, y: 250, width: 460, height: 500, rotation: 3, opacity: 1, visible: true, locked: false, fill: 'transparent', stroke: '#f472b6', strokeWidth: 2, cornerRadius: 12 }),
      tplEl({ type: 'decorative', name: 'Heart', decoType: 'heart', x: W / 2 - 24, y: H - 300, width: 48, height: 48, rotation: 0, opacity: 0.7, visible: true, locked: false, fill: '#f472b6', stroke: '', strokeWidth: 0 }),
      tplEl({ type: 'text', name: 'Title', text: 'mixed media', fontFamily: 'Space Grotesk', fontSize: 32, fontWeight: 'bold', fontStyle: 'normal', align: 'center', fill: '#f472b6', lineHeight: 1.2, letterSpacing: 3, backgroundColor: '', backgroundPadding: 0, backgroundRadius: 0, x: W / 2 - 200, y: H - 220, width: 400, rotation: 0, opacity: 1, visible: true, locked: false }),
    ],
  },
];
