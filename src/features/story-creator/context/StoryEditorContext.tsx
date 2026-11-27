import type Konva from 'konva';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { loadAllFonts } from '@/constants/fonts';
import { useEditorHistory } from '@/features/story-creator/hooks/useEditorHistory';
import { useKeyboardShortcuts } from '@/features/story-creator/hooks/useKeyboardShortcuts';
import {
  generateSmartLayoutElements,
  matchPhotosToLayoutSlots,
  SMART_LAYOUTS,
} from '@/features/story-creator/utils/smartLayoutEngine';
import {
  type AppliedSmartLayoutState,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  type CanvasDecorativeElement,
  type CanvasDocumentState,
  type CanvasElement,
  type CanvasLineElement,
  type CanvasPhotoElement,
  type CanvasShapeElement,
  type CanvasTextElement,
  type EditorToolCategory,
  type SaveStatus,
  type StoredProject,
  type StoryTemplate,
  type TemplateCategory,
  type UploadedPhoto,
} from '@/types/studio';
import {
  downloadBlob,
  type ExportFormat,
  exportStageToBlob,
  generateThumbnailDataUrl,
} from '@/utils/exportEngine';
import {
  loadProjectPhotos,
  savePhotoBlob,
  saveProject,
} from '@/utils/projectStorage';

const DEFAULT_CANVAS_BG = '#141418';

function createElementId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildTemplateDocument(
  template: StoryTemplate,
  availablePhotos: UploadedPhoto[],
): CanvasDocumentState {
  const photosMap: Record<string, UploadedPhoto> = {};
  for (const p of availablePhotos) photosMap[p.id] = p;

  const baseElements: CanvasElement[] = (template.elements ?? []).map((el) => ({
    ...el,
    id: createElementId(el.type),
  })) as CanvasElement[];

  if (template.photoCount > 0 && template.defaultLayoutId) {
    const layoutDef = SMART_LAYOUTS.find(
      (l) => l.id === template.defaultLayoutId,
    );
    if (layoutDef) {
      const matchedIds = matchPhotosToLayoutSlots(
        layoutDef,
        availablePhotos.slice(0, layoutDef.photoCount),
      );
      while (matchedIds.length < layoutDef.photoCount) {
        matchedIds.push('');
      }
      const smartConfig: AppliedSmartLayoutState = {
        layoutId: layoutDef.id,
        photoIds: matchedIds,
        spacing: layoutDef.defaultSpacing,
        margin: layoutDef.defaultMargin,
        cornerRadius: layoutDef.defaultCornerRadius,
      };
      const slotElements = generateSmartLayoutElements(smartConfig, photosMap);
      return {
        backgroundColor: template.surfaceColor,
        elements: [...slotElements, ...baseElements],
        smartLayout: smartConfig,
      };
    }
  }

  return {
    backgroundColor: template.surfaceColor,
    elements: baseElements,
  };
}

export interface StoryEditorContextValue {
  stageRef: React.RefObject<Konva.Stage | null>;
  projectTitle: string;
  setProjectTitle: (title: string) => void;
  saveStatus: SaveStatus;
  storageWarning: string | null;
  activeCategory: EditorToolCategory;
  setActiveCategory: (category: EditorToolCategory) => void;
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  showSafeArea: boolean;
  toggleSafeArea: () => void;
  isPreviewOpen: boolean;
  setIsPreviewOpen: (open: boolean) => void;
  isExportOpen: boolean;
  setIsExportOpen: (open: boolean) => void;
  isExporting: boolean;
  isMobilePropertiesOpen: boolean;
  setIsMobilePropertiesOpen: (open: boolean) => void;
  croppingElement: CanvasPhotoElement | null;
  openCropForElement: (id: string) => void;
  openCropForSlot: (slotIndex: number) => void;
  closeCrop: () => void;
  uploadedPhotos: UploadedPhoto[];
  photosById: Record<string, UploadedPhoto>;
  state: CanvasDocumentState;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  selectedElement: CanvasElement | null;
  hasManualPhotoContent: boolean;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  performSave: () => Promise<void>;
  handleBackToDashboard: () => void;
  handlePhotosAdded: (newPhotos: UploadedPhoto[]) => void;
  handleAddPhotoToCanvas: (photo: UploadedPhoto) => void;
  handleAddPhotoFrame: (preset: Omit<CanvasPhotoElement, 'id'>) => void;
  handleAddText: (preset: Omit<CanvasTextElement, 'id'>) => void;
  handleAddShape: (preset: Omit<CanvasShapeElement, 'id'>) => void;
  handleAddLine: (preset: Omit<CanvasLineElement, 'id'>) => void;
  handleAddDecorative: (preset: Omit<CanvasDecorativeElement, 'id'>) => void;
  handleApplyTemplate: (template: StoryTemplate) => void;
  handleApplySmartLayout: (
    config: AppliedSmartLayoutState,
    mode: 'preserve-decor' | 'replace-all',
  ) => void;
  handleUpdateSmartLayoutParams: (
    patch: Partial<AppliedSmartLayoutState>,
    options?: { coalesce?: boolean },
  ) => void;
  handleResetSmartLayoutDefaults: () => void;
  handleUpdateElement: (
    id: string,
    updated: Partial<CanvasElement>,
    options?: { coalesce?: boolean },
  ) => void;
  handleDeleteElement: (id: string) => void;
  handleDuplicateElement: (id: string) => void;
  handleReorderLayer: (fromIndex: number, toIndex: number) => void;
  handleBringForward: () => void;
  handleSendBackward: () => void;
  handleBringToFront: () => void;
  handleSendToBack: () => void;
  handleCenterHorizontally: () => void;
  handleCenterVertically: () => void;
  handleChangeBackground: (color: string) => void;
  handleExport: (format: ExportFormat, quality: number) => Promise<void>;
}

const StoryEditorContext = createContext<StoryEditorContextValue | null>(null);

interface StoryEditorProviderProps {
  projectId: string;
  initialProject?: StoredProject | null;
  initialTemplate?: StoryTemplate | null;
  onBackToDashboard: () => void;
  children: ReactNode;
}

export function StoryEditorProvider({
  projectId,
  initialProject = null,
  initialTemplate = null,
  onBackToDashboard,
  children,
}: StoryEditorProviderProps) {
  const stageRef = useRef<Konva.Stage | null>(null);

  const [projectTitle, setProjectTitle] = useState(
    initialProject?.name ?? initialTemplate?.title ?? 'Untitled Story',
  );
  const [templateCategory, setTemplateCategory] = useState<
    TemplateCategory | undefined
  >(initialProject?.templateCategory ?? initialTemplate?.category);

  const [activeCategory, setActiveCategory] =
    useState<EditorToolCategory>('uploads');
  const [zoom, setZoom] = useState(100);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isMobilePropertiesOpen, setIsMobilePropertiesOpen] = useState(false);
  const [croppingElementId, setCroppingElementId] = useState<string | null>(
    null,
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(
    initialProject ? 'saved' : 'unsaved',
  );
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const uploadedPhotosRef = useRef<UploadedPhoto[]>([]);
  uploadedPhotosRef.current = uploadedPhotos;

  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );

  const initialDoc = useMemo<CanvasDocumentState>(() => {
    if (initialProject) return initialProject.document;
    if (initialTemplate) return buildTemplateDocument(initialTemplate, []);
    return { backgroundColor: DEFAULT_CANVAS_BG, elements: [] };
  }, [initialProject, initialTemplate]);

  const { state, commitState, resetHistory, undo, redo, canUndo, canRedo } =
    useEditorHistory(initialDoc);

  const isHydratedRef = useRef(false);

  useEffect(() => {
    loadAllFonts();
    if (navigator.storage?.estimate) {
      void navigator.storage.estimate().then((est) => {
        if (est.usage && est.quota && est.usage / est.quota > 0.85) {
          setStorageWarning(
            'Kapasitas penyimpanan lokal hampir penuh (>85%). Hapus proyek lama yang tidak diperlukan.',
          );
        }
      });
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (initialProject) {
      resetHistory(initialProject.document);
      void loadProjectPhotos(projectId).then((photos) => {
        if (active) {
          setUploadedPhotos(photos);
          isHydratedRef.current = true;
        }
      });
    } else {
      isHydratedRef.current = true;
    }
    return () => {
      active = false;
    };
  }, [projectId, initialProject, resetHistory]);

  useEffect(() => {
    return () => {
      for (const photo of uploadedPhotosRef.current) {
        URL.revokeObjectURL(photo.objectUrl);
      }
    };
  }, []);

  const performSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      const thumbnailDataUrl = stageRef.current
        ? generateThumbnailDataUrl(stageRef.current)
        : initialProject?.thumbnailDataUrl;

      await saveProject({
        id: projectId,
        name: projectTitle.trim() || 'Untitled Story',
        updatedAt: Date.now(),
        templateCategory,
        thumbnailDataUrl,
        document: state,
      });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('unsaved');
    }
  }, [
    projectId,
    projectTitle,
    templateCategory,
    state,
    initialProject?.thumbnailDataUrl,
  ]);

  const firstRenderRef = useRef(true);
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    if (!isHydratedRef.current) return;

    setSaveStatus('unsaved');
    const timer = window.setTimeout(() => {
      void performSave();
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [state, projectTitle, performSave]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void performSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [performSave]);

  const photosById = useMemo(() => {
    const map: Record<string, UploadedPhoto> = {};
    for (const photo of uploadedPhotos) {
      map[photo.id] = photo;
    }
    return map;
  }, [uploadedPhotos]);

  const selectedElement = useMemo(
    () => state.elements.find((el) => el.id === selectedElementId) ?? null,
    [state.elements, selectedElementId],
  );

  const croppingElement = useMemo(
    () =>
      state.elements.find(
        (el): el is CanvasPhotoElement =>
          el.id === croppingElementId && el.type === 'photo',
      ) ?? null,
    [state.elements, croppingElementId],
  );

  const hasManualPhotoContent = useMemo(
    () =>
      state.elements.some(
        (el) => el.type === 'photo' && el.layoutSlotIndex === undefined,
      ),
    [state.elements],
  );

  const handlePhotosAdded = useCallback(
    (newPhotos: UploadedPhoto[]) => {
      setUploadedPhotos((prev) => [...newPhotos, ...prev]);
      for (const photo of newPhotos) {
        void fetch(photo.objectUrl)
          .then((res) => res.blob())
          .then((blob) => savePhotoBlob(projectId, photo, blob));
      }
    },
    [projectId],
  );

  const handleAddPhotoToCanvas = useCallback(
    (photo: UploadedPhoto) => {
      if (
        selectedElement?.type === 'photo' &&
        !selectedElement.photoId &&
        !selectedElement.locked
      ) {
        commitState((prev) => {
          const nextSmart =
            prev.smartLayout && selectedElement.layoutSlotIndex !== undefined
              ? {
                  ...prev.smartLayout,
                  photoIds: prev.smartLayout.photoIds.map((pid, idx) =>
                    idx === selectedElement.layoutSlotIndex ? photo.id : pid,
                  ),
                }
              : prev.smartLayout;

          return {
            ...prev,
            smartLayout: nextSmart,
            elements: prev.elements.map((el) =>
              el.id === selectedElement.id && el.type === 'photo'
                ? {
                    ...el,
                    photoId: photo.id,
                    name:
                      el.layoutSlotIndex !== undefined
                        ? `Slot ${el.layoutSlotIndex + 1} · ${photo.name}`
                        : photo.name,
                    crop: { zoom: 1, offsetX: 0, offsetY: 0 },
                  }
                : el,
            ),
          };
        });
        return;
      }

      const emptySlot = state.elements.find(
        (el): el is CanvasPhotoElement =>
          el.type === 'photo' &&
          el.layoutSlotIndex !== undefined &&
          !el.photoId &&
          !el.locked,
      );
      if (emptySlot && emptySlot.layoutSlotIndex !== undefined) {
        const slotIdx = emptySlot.layoutSlotIndex;
        commitState((prev) => ({
          ...prev,
          smartLayout: prev.smartLayout
            ? {
                ...prev.smartLayout,
                photoIds: prev.smartLayout.photoIds.map((pid, idx) =>
                  idx === slotIdx ? photo.id : pid,
                ),
              }
            : undefined,
          elements: prev.elements.map((el) =>
            el.id === emptySlot.id && el.type === 'photo'
              ? {
                  ...el,
                  photoId: photo.id,
                  name: `Slot ${slotIdx + 1} · ${photo.name}`,
                  crop: { zoom: 1, offsetX: 0, offsetY: 0 },
                }
              : el,
          ),
        }));
        setSelectedElementId(emptySlot.id);
        return;
      }

      const maxW = CANVAS_WIDTH * 0.78;
      const maxH = CANVAS_HEIGHT * 0.65;
      const fitScale = Math.min(
        maxW / photo.naturalWidth,
        maxH / photo.naturalHeight,
        1,
      );

      const width = Math.round(photo.naturalWidth * fitScale);
      const height = Math.round(photo.naturalHeight * fitScale);

      const newElement: CanvasPhotoElement = {
        id: createElementId('photo'),
        type: 'photo',
        name: photo.name,
        photoId: photo.id,
        x: Math.round((CANVAS_WIDTH - width) / 2),
        y: Math.round((CANVAS_HEIGHT - height) / 2),
        width,
        height,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        keepAspectRatio: true,
      };

      commitState((prev) => ({
        ...prev,
        elements: [...prev.elements, newElement],
      }));
      setSelectedElementId(newElement.id);
    },
    [commitState, selectedElement, state.elements],
  );

  const handleAddPhotoFrame = useCallback(
    (preset: Omit<CanvasPhotoElement, 'id'>) => {
      const el: CanvasPhotoElement = {
        ...preset,
        id: createElementId('frame'),
      };
      commitState((prev) => ({ ...prev, elements: [...prev.elements, el] }));
      setSelectedElementId(el.id);
    },
    [commitState],
  );

  const handleAddText = useCallback(
    (preset: Omit<CanvasTextElement, 'id'>) => {
      const el: CanvasTextElement = { ...preset, id: createElementId('text') };
      commitState((prev) => ({ ...prev, elements: [...prev.elements, el] }));
      setSelectedElementId(el.id);
    },
    [commitState],
  );

  const handleAddShape = useCallback(
    (preset: Omit<CanvasShapeElement, 'id'>) => {
      const el: CanvasShapeElement = { ...preset, id: createElementId('shape') };
      commitState((prev) => ({ ...prev, elements: [...prev.elements, el] }));
      setSelectedElementId(el.id);
    },
    [commitState],
  );

  const handleAddLine = useCallback(
    (preset: Omit<CanvasLineElement, 'id'>) => {
      const el: CanvasLineElement = { ...preset, id: createElementId('line') };
      commitState((prev) => ({ ...prev, elements: [...prev.elements, el] }));
      setSelectedElementId(el.id);
    },
    [commitState],
  );

  const handleAddDecorative = useCallback(
    (preset: Omit<CanvasDecorativeElement, 'id'>) => {
      const el: CanvasDecorativeElement = {
        ...preset,
        id: createElementId('deco'),
      };
      commitState((prev) => ({ ...prev, elements: [...prev.elements, el] }));
      setSelectedElementId(el.id);
    },
    [commitState],
  );

  const handleApplyTemplate = useCallback(
    (template: StoryTemplate) => {
      const nextDoc = buildTemplateDocument(template, uploadedPhotos);
      setTemplateCategory(template.category);
      if (projectTitle === 'Untitled Story') {
        setProjectTitle(template.title);
      }
      commitState(() => nextDoc);
      setSelectedElementId(null);
    },
    [commitState, projectTitle, uploadedPhotos],
  );

  const handleApplySmartLayout = useCallback(
    (
      config: AppliedSmartLayoutState,
      mode: 'preserve-decor' | 'replace-all',
    ) => {
      commitState((prev) => {
        const prevSlots = prev.elements.filter(
          (el): el is CanvasPhotoElement =>
            el.type === 'photo' && el.layoutSlotIndex !== undefined,
        );
        const nextSlots = generateSmartLayoutElements(
          config,
          photosById,
          prevSlots,
        );

        if (mode === 'replace-all') {
          return {
            ...prev,
            elements: nextSlots,
            smartLayout: config,
          };
        }

        const nonPhotos = prev.elements.filter((el) => el.type !== 'photo');
        return {
          ...prev,
          elements: [...nextSlots, ...nonPhotos],
          smartLayout: config,
        };
      });
      setSelectedElementId(null);
    },
    [commitState, photosById],
  );

  const handleUpdateSmartLayoutParams = useCallback(
    (
      patch: Partial<AppliedSmartLayoutState>,
      options?: { coalesce?: boolean },
    ) => {
      commitState((prev) => {
        if (!prev.smartLayout) return prev;
        const nextConfig: AppliedSmartLayoutState = {
          ...prev.smartLayout,
          ...patch,
        };
        const prevSlots = prev.elements.filter(
          (el): el is CanvasPhotoElement =>
            el.type === 'photo' && el.layoutSlotIndex !== undefined,
        );
        const nextSlots = generateSmartLayoutElements(
          nextConfig,
          photosById,
          prevSlots,
        );
        const otherElements = prev.elements.filter(
          (el) => !(el.type === 'photo' && el.layoutSlotIndex !== undefined),
        );
        return {
          ...prev,
          smartLayout: nextConfig,
          elements: [...nextSlots, ...otherElements],
        };
      }, options);
    },
    [commitState, photosById],
  );

  const handleResetSmartLayoutDefaults = useCallback(() => {
    commitState((prev) => {
      if (!prev.smartLayout) return prev;
      const def = SMART_LAYOUTS.find(
        (l) => l.id === prev.smartLayout?.layoutId,
      );
      if (!def) return prev;
      const resetConfig: AppliedSmartLayoutState = {
        ...prev.smartLayout,
        spacing: def.defaultSpacing,
        margin: def.defaultMargin,
        cornerRadius: def.defaultCornerRadius,
      };
      const nextSlots = generateSmartLayoutElements(resetConfig, photosById);
      const otherElements = prev.elements.filter(
        (el) => !(el.type === 'photo' && el.layoutSlotIndex !== undefined),
      );
      return {
        ...prev,
        smartLayout: resetConfig,
        elements: [...nextSlots, ...otherElements],
      };
    });
  }, [commitState, photosById]);

  const handleUpdateElement = useCallback(
    (
      id: string,
      updated: Partial<CanvasElement>,
      options?: { coalesce?: boolean },
    ) => {
      commitState((prev) => {
        const target = prev.elements.find((e) => e.id === id);
        let nextSmart = prev.smartLayout;

        if (
          target?.type === 'photo' &&
          target.layoutSlotIndex !== undefined &&
          'photoId' in updated &&
          typeof updated.photoId === 'string' &&
          prev.smartLayout
        ) {
          const slotIdx = target.layoutSlotIndex;
          nextSmart = {
            ...prev.smartLayout,
            photoIds: prev.smartLayout.photoIds.map((pid, idx) =>
              idx === slotIdx ? (updated.photoId as string) : pid,
            ),
          };
        }

        return {
          ...prev,
          smartLayout: nextSmart,
          elements: prev.elements.map((el) =>
            el.id === id ? ({ ...el, ...updated } as CanvasElement) : el,
          ),
        };
      }, options);
    },
    [commitState],
  );

  const handleDeleteElement = useCallback(
    (id: string) => {
      commitState((prev) => {
        const target = prev.elements.find((e) => e.id === id);
        if (!target || target.locked) return prev;
        return {
          ...prev,
          elements: prev.elements.filter((el) => el.id !== id),
        };
      });
      if (selectedElementId === id) {
        setSelectedElementId(null);
      }
    },
    [commitState, selectedElementId],
  );

  const handleDuplicateElement = useCallback(
    (id: string) => {
      let duplicatedId: string | null = null;
      commitState((prev) => {
        const idx = prev.elements.findIndex((e) => e.id === id);
        if (idx === -1) return prev;
        const source = prev.elements[idx];
        const newId = createElementId(source.type);
        duplicatedId = newId;
        const copy: CanvasElement = {
          ...source,
          id: newId,
          name: `${source.name} (salinan)`,
          x: source.x + 30,
          y: source.y + 30,
          locked: false,
          ...(source.type === 'photo' ? { layoutSlotIndex: undefined } : {}),
        } as CanvasElement;
        const next = [...prev.elements];
        next.splice(idx + 1, 0, copy);
        return { ...prev, elements: next };
      });
      if (duplicatedId) {
        setSelectedElementId(duplicatedId);
      }
    },
    [commitState],
  );

  const handleReorderLayer = useCallback(
    (fromIndex: number, toIndex: number) => {
      commitState((prev) => {
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= prev.elements.length ||
          toIndex >= prev.elements.length
        ) {
          return prev;
        }
        const next = [...prev.elements];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return { ...prev, elements: next };
      });
    },
    [commitState],
  );

  const handleBringForward = useCallback(() => {
    if (!selectedElementId) return;
    commitState((prev) => {
      const idx = prev.elements.findIndex((el) => el.id === selectedElementId);
      if (idx === -1 || idx === prev.elements.length - 1) return prev;
      const next = [...prev.elements];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return { ...prev, elements: next };
    });
  }, [commitState, selectedElementId]);

  const handleSendBackward = useCallback(() => {
    if (!selectedElementId) return;
    commitState((prev) => {
      const idx = prev.elements.findIndex((el) => el.id === selectedElementId);
      if (idx <= 0) return prev;
      const next = [...prev.elements];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return { ...prev, elements: next };
    });
  }, [commitState, selectedElementId]);

  const handleBringToFront = useCallback(() => {
    if (!selectedElementId) return;
    commitState((prev) => {
      const idx = prev.elements.findIndex((el) => el.id === selectedElementId);
      if (idx === -1 || idx === prev.elements.length - 1) return prev;
      const next = [...prev.elements];
      const [item] = next.splice(idx, 1);
      next.push(item);
      return { ...prev, elements: next };
    });
  }, [commitState, selectedElementId]);

  const handleSendToBack = useCallback(() => {
    if (!selectedElementId) return;
    commitState((prev) => {
      const idx = prev.elements.findIndex((el) => el.id === selectedElementId);
      if (idx <= 0) return prev;
      const next = [...prev.elements];
      const [item] = next.splice(idx, 1);
      next.unshift(item);
      return { ...prev, elements: next };
    });
  }, [commitState, selectedElementId]);

  const handleCenterHorizontally = useCallback(() => {
    if (!selectedElement || selectedElement.locked) return;
    const w =
      'width' in selectedElement
        ? selectedElement.width
        : selectedElement.type === 'line'
          ? selectedElement.length
          : 0;
    handleUpdateElement(selectedElement.id, {
      x: Math.round((CANVAS_WIDTH - w) / 2),
    });
  }, [handleUpdateElement, selectedElement]);

  const handleCenterVertically = useCallback(() => {
    if (!selectedElement || selectedElement.locked) return;
    const h =
      'height' in selectedElement
        ? selectedElement.height
        : selectedElement.type === 'text'
          ? selectedElement.fontSize * 1.4
          : 0;
    handleUpdateElement(selectedElement.id, {
      y: Math.round((CANVAS_HEIGHT - h) / 2),
    });
  }, [handleUpdateElement, selectedElement]);

  const handleChangeBackground = useCallback(
    (color: string) => {
      commitState(
        (prev) => ({
          ...prev,
          backgroundColor: color,
        }),
        { coalesce: true },
      );
    },
    [commitState],
  );

  const handleExport = useCallback(
    async (format: ExportFormat, quality: number) => {
      if (!stageRef.current) return;
      setIsExporting(true);
      try {
        const blob = await exportStageToBlob(stageRef.current, {
          format,
          quality,
        });
        const safeName =
          projectTitle
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-_]+/g, '-') || 'frame-story';
        downloadBlob(blob, `${safeName}.${format === 'jpeg' ? 'jpg' : 'png'}`);
        setIsExportOpen(false);
      } finally {
        setIsExporting(false);
      }
    },
    [projectTitle],
  );

  const handleBackToDashboard = useCallback(() => {
    const shouldSave =
      state.elements.length > 0 ||
      Boolean(initialProject) ||
      Boolean(initialTemplate) ||
      projectTitle !== 'Untitled Story';
    if (shouldSave) {
      void performSave().finally(onBackToDashboard);
    } else {
      onBackToDashboard();
    }
  }, [
    initialProject,
    initialTemplate,
    onBackToDashboard,
    performSave,
    projectTitle,
    state.elements.length,
  ]);

  const openCropForSlot = useCallback(
    (slotIndex: number) => {
      const slotEl = state.elements.find(
        (el): el is CanvasPhotoElement =>
          el.type === 'photo' && el.layoutSlotIndex === slotIndex,
      );
      if (slotEl && slotEl.photoId) {
        setSelectedElementId(slotEl.id);
        setCroppingElementId(slotEl.id);
      }
    },
    [state.elements],
  );

  useKeyboardShortcuts({
    enabled: !isPreviewOpen && !isExportOpen && !croppingElementId,
    onUndo: undo,
    onRedo: redo,
    onDelete: () => {
      if (selectedElementId) handleDeleteElement(selectedElementId);
    },
    onDuplicate: () => {
      if (selectedElementId) handleDuplicateElement(selectedElementId);
    },
    onDeselect: () => setSelectedElementId(null),
  });

  const value: StoryEditorContextValue = {
    stageRef,
    projectTitle,
    setProjectTitle,
    saveStatus,
    storageWarning,
    activeCategory,
    setActiveCategory,
    zoom,
    zoomIn: () => setZoom((prev) => Math.min(150, prev + 10)),
    zoomOut: () => setZoom((prev) => Math.max(50, prev - 10)),
    resetZoom: () => setZoom(100),
    showSafeArea,
    toggleSafeArea: () => setShowSafeArea((prev) => !prev),
    isPreviewOpen,
    setIsPreviewOpen,
    isExportOpen,
    setIsExportOpen,
    isExporting,
    isMobilePropertiesOpen,
    setIsMobilePropertiesOpen,
    croppingElement,
    openCropForElement: (id: string) => setCroppingElementId(id),
    openCropForSlot,
    closeCrop: () => setCroppingElementId(null),
    uploadedPhotos,
    photosById,
    state,
    selectedElementId,
    setSelectedElementId,
    selectedElement,
    hasManualPhotoContent,
    canUndo,
    canRedo,
    undo,
    redo,
    performSave,
    handleBackToDashboard,
    handlePhotosAdded,
    handleAddPhotoToCanvas,
    handleAddPhotoFrame,
    handleAddText,
    handleAddShape,
    handleAddLine,
    handleAddDecorative,
    handleApplyTemplate,
    handleApplySmartLayout,
    handleUpdateSmartLayoutParams,
    handleResetSmartLayoutDefaults,
    handleUpdateElement,
    handleDeleteElement,
    handleDuplicateElement,
    handleReorderLayer,
    handleBringForward,
    handleSendBackward,
    handleBringToFront,
    handleSendToBack,
    handleCenterHorizontally,
    handleCenterVertically,
    handleChangeBackground,
    handleExport,
  };

  return (
    <StoryEditorContext.Provider value={value}>
      {children}
    </StoryEditorContext.Provider>
  );
}

export function useStoryEditor(): StoryEditorContextValue {
  const ctx = useContext(StoryEditorContext);
  if (!ctx) {
    throw new Error('useStoryEditor must be used inside StoryEditorProvider');
  }
  return ctx;
}
