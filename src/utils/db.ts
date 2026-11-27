import Dexie, { type EntityTable } from 'dexie';

export interface PhotoBlob {
  id: string;
  blob: Blob;
  name: string;
  naturalWidth: number;
  naturalHeight: number;
}

export interface ProjectRecord {
  id: string;
  name: string;
  updatedAt: number;
  templateCategory?: string;
  thumbnailDataUrl?: string;
  documentJson: string;
}

class FrameDatabase extends Dexie {
  projects!: EntityTable<ProjectRecord, 'id'>;
  photos!: EntityTable<PhotoBlob, 'id'>;

  constructor() {
    super('frame-studio');
    this.version(1).stores({
      projects: 'id, updatedAt',
      photos: 'id',
    });
  }
}

export const db = new FrameDatabase();
