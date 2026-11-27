export interface FontOption {
  family: string;
  label: string;
  category: 'sans-serif' | 'serif' | 'display' | 'monospace';
  weights: number[];
  url?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { family: 'Inter', label: 'Inter', category: 'sans-serif', weights: [400, 700], url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap' },
  { family: 'Poppins', label: 'Poppins', category: 'sans-serif', weights: [400, 700], url: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,700;1,400;1,700&display=swap' },
  { family: 'DM Sans', label: 'DM Sans', category: 'sans-serif', weights: [400, 700], url: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap' },
  { family: 'Playfair Display', label: 'Playfair Display', category: 'serif', weights: [400, 700], url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap' },
  { family: 'Lora', label: 'Lora', category: 'serif', weights: [400, 700], url: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400;1,700&display=swap' },
  { family: 'Space Grotesk', label: 'Space Grotesk', category: 'display', weights: [400, 700], url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap' },
  { family: 'Syne', label: 'Syne', category: 'display', weights: [400, 700], url: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;700&display=swap' },
  { family: 'JetBrains Mono', label: 'JetBrains Mono', category: 'monospace', weights: [400, 700], url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap' },
  { family: 'Arial', label: 'Arial', category: 'sans-serif', weights: [400, 700] },
  { family: 'Georgia', label: 'Georgia', category: 'serif', weights: [400, 700] },
];

const loadedFonts = new Set<string>();

export function loadFont(font: FontOption): void {
  if (!font.url || loadedFonts.has(font.family)) return;
  loadedFonts.add(font.family);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = font.url;
  document.head.appendChild(link);
}

export function loadAllFonts(): void {
  for (const font of FONT_OPTIONS) {
    loadFont(font);
  }
}
