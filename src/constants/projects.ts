import type { StoryProject } from '@/types/studio';

export const RECENT_PROJECTS: StoryProject[] = [
  {
    id: 'proj-01',
    title: 'Kopi Pagi di Kemang',
    templateCategory: 'Minimalist',
    photoCount: 1,
    updatedAt: '2 jam lalu',
    accentColor: '#e5e5e5',
    surfaceColor: '#18181b',
  },
  {
    id: 'proj-02',
    title: 'Liburan Bandung',
    templateCategory: 'Photo Dump',
    photoCount: 4,
    updatedAt: 'Kemarin',
    accentColor: '#38bdf8',
    surfaceColor: '#111820',
  },
  {
    id: 'proj-03',
    title: 'Sunset Senja 35mm',
    templateCategory: 'Analog Film',
    photoCount: 2,
    updatedAt: '3 hari lalu',
    accentColor: '#fb923c',
    surfaceColor: '#1a1512',
  },
];
