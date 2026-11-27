import { AlertCircle, Plus, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import type { UploadedPhoto } from '@/types/studio';

const ACCEPTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

async function hasValidImageMagicBytes(file: File): Promise<boolean> {
  try {
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (bytes.length < 4) return false;

    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return true;
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    ) {
      return true;
    }

    // WebP: "RIFF" (0..3) + "WEBP" (8..11)
    if (
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

interface PhotoUploadPanelProps {
  photos: UploadedPhoto[];
  onPhotosAdded: (newPhotos: UploadedPhoto[]) => void;
  onAddPhotoToCanvas: (photo: UploadedPhoto) => void;
}

function readImageDimensions(
  objectUrl: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error('Gagal membaca dimensi gambar.'));
    };
    img.src = objectUrl;
  });
}

export function PhotoUploadPanel({
  photos,
  onPhotosAdded,
  onAddPhotoToCanvas,
}: PhotoUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setErrorMessage(null);
    setIsProcessing(true);

    const validPhotos: UploadedPhoto[] = [];
    const errors: string[] = [];

    for (const file of Array.from(fileList)) {
      if (!ACCEPTED_MIME_TYPES.has(file.type.toLowerCase())) {
        errors.push(`"${file.name}": format harus JPEG, JPG, PNG, atau WebP.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`"${file.name}": ukuran melebihi batas 20 MB.`);
        continue;
      }

      const validMagic = await hasValidImageMagicBytes(file);
      if (!validMagic) {
        errors.push(
          `"${file.name}": header biner file bukan gambar JPEG, PNG, atau WebP yang valid.`,
        );
        continue;
      }

      const objectUrl = URL.createObjectURL(file);
      try {
        const { width, height } = await readImageDimensions(objectUrl);
        validPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          objectUrl,
          naturalWidth: width,
          naturalHeight: height,
          sizeBytes: file.size,
        });
      } catch {
        URL.revokeObjectURL(objectUrl);
        errors.push(`"${file.name}": file gambar tidak dapat dibaca.`);
      }
    }

    if (validPhotos.length > 0) {
      onPhotosAdded(validPhotos);
    }

    if (errors.length > 0) {
      setErrorMessage(errors[0]);
    }

    setIsProcessing(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={(e) => void processFiles(e.target.files)}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isProcessing}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-neutral-200 disabled:opacity-50"
      >
        <Upload className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{isProcessing ? 'Memproses...' : 'Unggah Foto'}</span>
      </button>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void processFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border border-dashed p-3.5 text-center transition-colors ${
          isDragging
            ? 'border-white/50 bg-white/[0.08]'
            : 'border-white/12 bg-white/[0.02]'
        }`}
      >
        <p className="text-[11px] font-medium text-neutral-300">
          Tarik & lepas foto ke sini
        </p>
        <p className="mt-1 text-[10px] text-neutral-500">
          JPEG, JPG, PNG, WebP · Maks 20 MB
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-[11px] text-red-200">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {photos.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-medium text-neutral-400">
            Foto Tersedia ({photos.length})
          </p>
          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => onAddPhotoToCanvas(photo)}
                title={`Tambahkan "${photo.name}" ke kanvas`}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/40 transition-all hover:border-white/30"
              >
                <img
                  src={photo.objectUrl}
                  alt={photo.name}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <span className="absolute right-1.5 bottom-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
