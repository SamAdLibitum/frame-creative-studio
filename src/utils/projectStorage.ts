import { db, type PhotoBlob, type ProjectRecord } from '@/utils/db';
import type { CanvasDocumentState, StoredProject, UploadedPhoto } from '@/types/studio';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function saveProject(
  project: StoredProject,
): Promise<void> {
  const record: ProjectRecord = {
    id: project.id,
    name: project.name,
    updatedAt: project.updatedAt,
    templateCategory: project.templateCategory,
    thumbnailDataUrl: project.thumbnailDataUrl,
    documentJson: JSON.stringify(project.document),
  };
  await db.projects.put(record);
}

function parseProjectRecord(record: ProjectRecord): StoredProject | null {
  try {
    const parsed = JSON.parse(record.documentJson) as CanvasDocumentState;
    if (!parsed || !Array.isArray(parsed.elements)) {
      return null;
    }
    return {
      id: record.id,
      name: record.name,
      updatedAt: record.updatedAt,
      templateCategory: record.templateCategory as StoredProject['templateCategory'],
      thumbnailDataUrl: record.thumbnailDataUrl,
      document: parsed,
    };
  } catch (err) {
    console.warn(`Melewati record proyek korup (${record.id}):`, err);
    return null;
  }
}

export async function loadProject(
  id: string,
): Promise<StoredProject | null> {
  const record = await db.projects.get(id);
  if (!record) return null;
  return parseProjectRecord(record);
}

export async function listProjects(): Promise<StoredProject[]> {
  const records = await db.projects.orderBy('updatedAt').reverse().toArray();
  const projects: StoredProject[] = [];
  for (const record of records) {
    const parsed = parseProjectRecord(record);
    if (parsed) projects.push(parsed);
  }
  return projects;
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id);
  const photoIds = await db.photos
    .filter((p) => p.id.startsWith(`${id}/`))
    .primaryKeys();
  await db.photos.bulkDelete(photoIds);
}

export async function duplicateProject(
  id: string,
): Promise<StoredProject | null> {
  const original = await loadProject(id);
  if (!original) return null;
  const newId = generateId();
  const newProject: StoredProject = {
    ...original,
    id: newId,
    name: `${original.name} (salinan)`,
    updatedAt: Date.now(),
  };
  await saveProject(newProject);

  const photoRecords = await db.photos
    .filter((p) => p.id.startsWith(`${id}/`))
    .toArray();
  if (photoRecords.length > 0) {
    const clonedPhotos: PhotoBlob[] = photoRecords.map((r) => ({
      ...r,
      id: `${newId}/${r.id.split('/').slice(1).join('/')}`,
    }));
    await db.photos.bulkPut(clonedPhotos);
  }

  return newProject;
}

export function createNewProjectId(): string {
  return generateId();
}

export async function savePhotoBlob(
  projectId: string,
  photo: UploadedPhoto,
  blob: Blob,
): Promise<void> {
  const record: PhotoBlob = {
    id: `${projectId}/${photo.id}`,
    blob,
    name: photo.name,
    naturalWidth: photo.naturalWidth,
    naturalHeight: photo.naturalHeight,
  };
  await db.photos.put(record);
}

export async function loadProjectPhotos(
  projectId: string,
): Promise<UploadedPhoto[]> {
  const records = await db.photos
    .filter((p) => p.id.startsWith(`${projectId}/`))
    .toArray();
  return records.map((r) => {
    const photoId = r.id.split('/').slice(1).join('/');
    return {
      id: photoId,
      name: r.name,
      objectUrl: URL.createObjectURL(r.blob),
      naturalWidth: r.naturalWidth,
      naturalHeight: r.naturalHeight,
      sizeBytes: r.blob.size,
    };
  });
}
