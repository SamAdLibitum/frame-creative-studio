import type {
  CanvasElement,
  CarouselGlobalTheme,
  CarouselSlide,
} from '../../types/studio.ts';

export const DEFAULT_CAROUSEL_THEME: CarouselGlobalTheme = {
  primaryColor: '#EFE4D4',
  secondaryColor: '#B59B84',
  backgroundColor: '#161412',
  textColor: '#F5F2EC',
  accentColor: '#C8A972',
  headingFont: 'Playfair Display',
  bodyFont: 'Inter',
  showSlideNumbers: true,
  slideNumberFormat: '01/05',
  slideNumberPosition: 'top-right',
  hideNumberOnCover: true,
};

export type CarouselTemplateId =
  | 'educational'
  | 'photo-storytelling'
  | 'minimal-editorial'
  | 'promotional-showcase';

let idCounter = 1;
function uniqueId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createCarouselSlide(
  name: string,
  theme: CarouselGlobalTheme = DEFAULT_CAROUSEL_THEME,
  elements: CanvasElement[] = [],
): CarouselSlide {
  return {
    id: uniqueId('slide'),
    name,
    backgroundColor: theme.backgroundColor,
    elements,
  };
}

export function duplicateCarouselSlide(
  slides: CarouselSlide[],
  slideId: string,
): { slides: CarouselSlide[]; duplicated: CarouselSlide | null } {
  const idx = slides.findIndex((s) => s.id === slideId);
  if (idx === -1) return { slides, duplicated: null };
  const source = slides[idx];
  const clonedElements: CanvasElement[] = source.elements.map((el) => ({
    ...el,
    id: uniqueId(el.type),
  }));
  const duplicated: CarouselSlide = {
    ...source,
    id: uniqueId('slide'),
    name: `${source.name} (Salinan)`,
    elements: clonedElements,
  };
  const next = [...slides];
  next.splice(idx + 1, 0, duplicated);
  return { slides: next, duplicated };
}

export function deleteCarouselSlide(
  slides: CarouselSlide[],
  slideId: string,
  activeSlideId: string,
): { slides: CarouselSlide[]; nextActiveSlideId: string } {
  if (slides.length <= 1) {
    return { slides, nextActiveSlideId: activeSlideId };
  }
  const idx = slides.findIndex((s) => s.id === slideId);
  if (idx === -1) return { slides, nextActiveSlideId: activeSlideId };
  const next = slides.filter((s) => s.id !== slideId);
  const nextActive =
    activeSlideId === slideId
      ? next[Math.max(0, idx - 1)].id
      : activeSlideId;
  return { slides: next, nextActiveSlideId: nextActive };
}

export function reorderCarouselSlides(
  slides: CarouselSlide[],
  fromIndex: number,
  toIndex: number,
): CarouselSlide[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= slides.length ||
    toIndex >= slides.length ||
    fromIndex === toIndex
  ) {
    return slides;
  }
  const next = [...slides];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function formatSlideNumber(
  index: number,
  total: number,
  format: CarouselGlobalTheme['slideNumberFormat'],
): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  if (format === '01') return pad(index + 1);
  if (format === '1/5') return `${index + 1}/${total}`;
  return `${pad(index + 1)}/${pad(total)}`;
}

/**
 * Applies global theme colors & fonts to non-overridden slides while preserving
 * individual slide overrides.
 */
export function applyGlobalThemeToSlides(
  slides: CarouselSlide[],
  theme: CarouselGlobalTheme,
): CarouselSlide[] {
  return slides.map((slide) => {
    if (slide.overrideTheme) return slide;
    return {
      ...slide,
      backgroundColor: theme.backgroundColor,
      elements: slide.elements.map((el) => {
        if (el.type === 'text') {
          const isHeading = el.fontSize >= 44;
          return {
            ...el,
            fill: isHeading ? theme.primaryColor : theme.textColor,
            fontFamily: isHeading ? theme.headingFont : theme.bodyFont,
          };
        }
        return el;
      }),
    };
  });
}

function makeText(
  name: string,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  fontFamily: string,
  fill: string,
  fontWeight: 'normal' | 'bold' = 'bold',
  align: 'left' | 'center' | 'right' = 'left',
): CanvasElement {
  return {
    id: uniqueId('text'),
    type: 'text',
    name,
    text,
    x,
    y,
    width,
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle: 'normal',
    align,
    fill,
    lineHeight: 1.25,
    letterSpacing: 0,
    backgroundColor: '',
    backgroundPadding: 0,
    backgroundRadius: 0,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
  };
}

/**
 * Builds curated multi-slide starter decks for Carousel Studio (1080×1350 default).
 */
export function createStarterCarouselDeck(
  templateId: CarouselTemplateId = 'minimal-editorial',
  width = 1080,
  height = 1350,
): { theme: CarouselGlobalTheme; slides: CarouselSlide[] } {
  const padX = 90;
  const contentW = width - padX * 2;

  if (templateId === 'educational') {
    const theme: CarouselGlobalTheme = {
      ...DEFAULT_CAROUSEL_THEME,
      backgroundColor: '#12151C',
      primaryColor: '#E8E4DC',
      textColor: '#B8C0CC',
      accentColor: '#C2594B',
      headingFont: 'Space Grotesk',
      bodyFont: 'Inter',
    };
    const steps = [
      { label: 'Cover / Hook', h: '5 Prinsip Komposisi\nVisual Editorial', b: 'Geser untuk mempelajari panduan singkat →' },
      { label: 'Introduction', h: '01. Ruang Negatif', b: 'Biarkan elemen bernapas. Ruang kosong membangun fokus dan kesan premium.' },
      { label: 'Main Content', h: '02. Hierarki Tipografi', b: 'Gunakan kontras ukuran jelas antara judul utama dan teks pendukung.' },
      { label: 'Key Insight', h: '03. Konsistensi Warna', b: 'Batasi palet menjadi warna dasar, pendukung, dan satu aksen terukur.' },
      { label: 'Call to Action', h: 'Simpan & Terapkan', b: 'Gunakan template ini sebagai panduan desain Story & Carousel berikutnya.' },
    ];
    return {
      theme,
      slides: steps.map((s) =>
        createCarouselSlide(s.label, theme, [
          makeText('Judul', s.h, padX, Math.round(height * 0.28), contentW, 64, theme.headingFont, theme.primaryColor, 'bold'),
          makeText('Isi', s.b, padX, Math.round(height * 0.56), contentW, 30, theme.bodyFont, theme.textColor, 'normal'),
        ]),
      ),
    };
  }

  if (templateId === 'photo-storytelling') {
    const theme: CarouselGlobalTheme = {
      ...DEFAULT_CAROUSEL_THEME,
      backgroundColor: '#1C1B19',
      primaryColor: '#EFE4D4',
      textColor: '#BCB6AA',
      accentColor: '#D9C2A7',
      headingFont: 'Playfair Display',
      bodyFont: 'Lora',
    };
    const slides = [
      createCarouselSlide('Cover / Hook', theme, [
        makeText('Judul', 'Catatan Perjalanan\nPagi di Kyoto', padX, Math.round(height * 0.34), contentW, 68, theme.headingFont, theme.primaryColor, 'bold', 'center'),
        makeText('Subjudul', 'SERI FOTO EDITORIAL', padX, Math.round(height * 0.56), contentW, 22, theme.bodyFont, theme.accentColor, 'normal', 'center'),
      ]),
      createCarouselSlide('Supporting Visual', theme, [
        {
          id: uniqueId('frame'),
          type: 'photo',
          name: 'Frame Foto Utama',
          photoId: '',
          x: padX,
          y: 130,
          width: contentW,
          height: Math.round(height * 0.62),
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          keepAspectRatio: false,
          frameShape: 'rounded-rect',
          cornerRadius: 24,
          frameBackground: '#262420',
          frameStroke: '#857F75',
          frameStrokeWidth: 2,
        },
        makeText('Caption', 'Cahaya pagi yang lembut menyapa jalanan sunyi.', padX, Math.round(height * 0.8), contentW, 28, theme.bodyFont, theme.textColor, 'normal', 'center'),
      ]),
      createCarouselSlide('Conclusion', theme, [
        makeText('Penutup', '"Setiap bingkai menyimpan jeda."', padX, Math.round(height * 0.42), contentW, 52, theme.headingFont, theme.primaryColor, 'bold', 'center'),
      ]),
    ];
    return { theme, slides };
  }

  if (templateId === 'promotional-showcase') {
    const theme: CarouselGlobalTheme = {
      ...DEFAULT_CAROUSEL_THEME,
      backgroundColor: '#0B0B0D',
      primaryColor: '#FAFAFA',
      textColor: '#A1A1AA',
      accentColor: '#EBD9B5',
      headingFont: 'Syne',
      bodyFont: 'DM Sans',
    };
    const slides = [
      createCarouselSlide('Cover / Hook', theme, [
        makeText('Tag', 'NEW COLLECTION', padX, 180, contentW, 20, theme.bodyFont, theme.accentColor, 'bold'),
        makeText('Judul', 'AUTUMN\nCAPSULE 04', padX, 240, contentW, 82, theme.headingFont, theme.primaryColor, 'bold'),
      ]),
      createCarouselSlide('Product Highlight', theme, [
        {
          id: uniqueId('frame'),
          type: 'photo',
          name: 'Produk Showcase',
          photoId: '',
          x: padX,
          y: 160,
          width: contentW,
          height: Math.round(height * 0.58),
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          keepAspectRatio: false,
          frameShape: 'arch',
          cornerRadius: 16,
          frameBackground: '#18181B',
          frameStroke: '#3F3F46',
          frameStrokeWidth: 2,
        },
        makeText('Detail', 'Material linen organik · Potongan minimalis', padX, Math.round(height * 0.8), contentW, 28, theme.bodyFont, theme.textColor, 'normal', 'center'),
      ]),
      createCarouselSlide('Call to Action', theme, [
        makeText('CTA', 'Tersedia Sekarang', padX, Math.round(height * 0.4), contentW, 58, theme.headingFont, theme.primaryColor, 'bold', 'center'),
        makeText('Sub', 'Kunjungi tautan di bio untuk katalog lengkap.', padX, Math.round(height * 0.52), contentW, 26, theme.bodyFont, theme.accentColor, 'normal', 'center'),
      ]),
    ];
    return { theme, slides };
  }

  // Default: minimal-editorial
  const theme = { ...DEFAULT_CAROUSEL_THEME };
  const slides = [
    createCarouselSlide('Cover / Hook', theme, [
      makeText('Judul', 'Minimal Editorial\nCarousel', padX, Math.round(height * 0.34), contentW, 68, theme.headingFont, theme.primaryColor, 'bold'),
      makeText('Subjudul', 'Rangkaian visual dengan ritme tenang dan konsisten.', padX, Math.round(height * 0.56), contentW, 28, theme.bodyFont, theme.textColor, 'normal'),
    ]),
    createCarouselSlide('Main Content', theme, [
      makeText('Heading', 'Cerita Utama', padX, Math.round(height * 0.28), contentW, 54, theme.headingFont, theme.primaryColor, 'bold'),
      makeText('Body', 'Tambahkan foto, kutipan, atau data kunci pada slide ini.', padX, Math.round(height * 0.44), contentW, 30, theme.bodyFont, theme.textColor, 'normal'),
    ]),
    createCarouselSlide('Call to Action', theme, [
      makeText('Penutup', 'Terima Kasih', padX, Math.round(height * 0.42), contentW, 60, theme.headingFont, theme.primaryColor, 'bold', 'center'),
    ]),
  ];
  return { theme, slides };
}
