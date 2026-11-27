import type Konva from 'konva';
import { CANVAS_WIDTH } from '@/types/studio';

export type ExportFormat = 'png' | 'jpeg';

export interface ExportOptions {
  format: ExportFormat;
  quality: number; // 0.1 – 1.0 for jpeg
  pixelRatio?: number;
}

export async function exportStageToBlob(
  stage: Konva.Stage,
  options: ExportOptions,
): Promise<Blob> {
  const { format, quality } = options;
  const pixelRatio = (options.pixelRatio ?? 1) * (CANVAS_WIDTH / stage.width());

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const overlays = stage.find('.editor-overlay');
  const prevVis = overlays.map((n) => n.visible());
  overlays.forEach((n) => n.visible(false));

  return new Promise((resolve, reject) => {
    try {
      stage.toBlob({
        pixelRatio,
        mimeType: format === 'jpeg' ? 'image/jpeg' : 'image/png',
        quality: format === 'jpeg' ? quality : undefined,
        callback: (blob) => {
          overlays.forEach((n, i) => n.visible(prevVis[i]));
          stage.batchDraw();
          if (blob) resolve(blob);
          else reject(new Error('Export menghasilkan blob kosong.'));
        },
      });
    } catch (err) {
      overlays.forEach((n, i) => n.visible(prevVis[i]));
      stage.batchDraw();
      reject(err);
    }
  });
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateThumbnailDataUrl(stage: Konva.Stage): string {
  const overlays = stage.find('.editor-overlay');
  const prevVis = overlays.map((n) => n.visible());
  overlays.forEach((n) => n.visible(false));
  try {
    const pixelRatio = 240 / stage.width();
    return stage.toDataURL({
      pixelRatio,
      mimeType: 'image/jpeg',
      quality: 0.65,
    });
  } finally {
    overlays.forEach((n, i) => n.visible(prevVis[i]));
    stage.batchDraw();
  }
}
