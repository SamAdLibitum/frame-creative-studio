export interface ProceduralPaletteDefinition {
  id: string;
  name: string;
  /**
   * Role hierarchy:
   * [0] = dominant base
   * [1..n-2] = secondary support tones
   * [n-1] = focal editorial accent
   */
  colors: string[];
}

export const PROCEDURAL_PALETTES: ProceduralPaletteDefinition[] = [
  {
    id: 'kodak-portra-400',
    name: 'Kodak Portra 400',
    colors: ['#1E1A17', '#6E5B4B', '#B59B84', '#D9C2A7', '#EFE4D4'],
  },
  {
    id: 'cinestill-halation',
    name: 'Cinestill Halation',
    colors: ['#12151C', '#2B3A4A', '#6D4C52', '#C2594B', '#E8B89A'],
  },
  {
    id: 'editorial-stone',
    name: 'Editorial Stone',
    colors: ['#1C1B19', '#4A4640', '#857F75', '#BCB6AA', '#E8E4DC'],
  },
  {
    id: 'obsidian-noir',
    name: 'Obsidian Noir',
    colors: ['#0B0B0D', '#1D1E22', '#3B3D45', '#787B85', '#C7C9D1'],
  },
  {
    id: 'nordic-mist',
    name: 'Nordic Mist',
    colors: ['#141C24', '#2F3E4E', '#5F7285', '#9EB0C0', '#DCE4EB'],
  },
  {
    id: 'warm-terracotta',
    name: 'Warm Terracotta',
    colors: ['#211714', '#5A3A2E', '#9B624B', '#C99278', '#E9D6C9'],
  },
  {
    id: 'tokyo-twilight',
    name: 'Tokyo Twilight',
    colors: ['#141320', '#2D2A45', '#5C4F78', '#9D83A8', '#D8C2D6'],
  },
  {
    id: 'sage-linen',
    name: 'Sage & Linen',
    colors: ['#181D19', '#3E4B41', '#738274', '#B3BEB0', '#E5E4DC'],
  },
  {
    id: 'golden-film',
    name: 'Golden Film',
    colors: ['#1C1710', '#4D3D26', '#8C7046', '#C8A972', '#EBD9B5'],
  },
  {
    id: 'minimal-monochrome',
    name: 'Minimal Monochrome',
    colors: ['#111111', '#383838', '#707070', '#B0B0B0', '#EBEBEB'],
  },
];

export const DEFAULT_PROCEDURAL_PALETTE = PROCEDURAL_PALETTES[0].colors;
