export type NavItemId = 'dashboard' | 'projects' | 'templates' | 'settings';

export type TemplateCategory =
  | 'Minimalist'
  | 'Editorial'
  | 'Korean Aesthetic'
  | 'Analog Film'
  | 'Polaroid'
  | 'Scrapbook'
  | 'Photo Dump'
  | 'Travel Diary';

export interface StoryTemplate {
  id: string;
  title: string;
  category: TemplateCategory;
  photoCount: number;
  aspectRatio: '9:16';
  accentColor: string;
  surfaceColor: string;
  badge?: string;
}

export interface StoryProject {
  id: string;
  title: string;
  templateCategory: TemplateCategory;
  photoCount: number;
  updatedAt: string;
  accentColor: string;
  surfaceColor: string;
}
