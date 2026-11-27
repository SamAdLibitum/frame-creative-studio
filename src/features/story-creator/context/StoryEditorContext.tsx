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
import { getWorkspaceDefinition } from '@/constants/workspaces';
import {
  adaptElementsToCanvasSize,
  getCanvasPreset,
  sanitizeCanvasDimensions,
} from '@/engines/canvas/formatEngine';
import {
  applyGlobalThemeToSlides,
  type CarouselTemplateId,
  createCarouselSlide,
  createStarterCarouselDeck,
  DEFAULT_CAROUSEL_THEME,
  deleteCarouselSlide,
  duplicateCarouselSlide,
  reorderCarouselSlides,
} from '@/engines/carousel/carouselEngine';
import {
  extractHarmoniousPaletteFromImage,
  PROCEDURAL_GENERATORS,
  sanitizeProceduralConfig,
} from '@/engines/procedural';
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
  type CanvasPresetId,
  type CanvasProceduralElement,
  type CanvasShapeElement,
  type CanvasTextElement,
  type CarouselGlobalTheme,
  type EditorToolCategory,
  type ProceduralConfig,
  type SaveStatus,
  type StoredProject,
  type StoryTemplate,
  type TemplateCategory,
  type UploadedPhoto,
  type WorkspaceMode,
} from '@/types/studio';
import {
  downloadBlob,
  type ExportFormat,
  exportStageToBlob,
  generateThumbnailDataUrl,
  renderSnapshotOffscreenToBlob,
  runMultiFormatBatchExport,
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

function formatProceduralLayerName(config: ProceduralConfig): string {
  const meta = PROCEDURAL_GENERATORS.find((g) => g.id === config.generatorType);
  const label = meta?.label ?? 'Procedural';
  return `${label} #${config.seed}`;
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
  isComparingOriginal: boolean;
  setIsComparingOriginal: (comparing: boolean) => void;
  canvasWidth: number;
  canvasHeight: number;
  canvasPreset: CanvasPresetId;
  workspaceMode: WorkspaceMode;
  changeCanvasFormat: (
    presetId: CanvasPresetId,
    customW?: number,
    customH?: number,
  ) => void;
  isCarouselOverviewOpen: boolean;
  setIsCarouselOverviewOpen: (open: boolean) => void;
  selectCarouselSlide: (slideId: string) => void;
  addCarouselSlide: () => void;
  duplicateCarouselSlideById: (slideId: string) => void;
  deleteCarouselSlideById: (slideId: string) => void;
  renameCarouselSlide: (slideId: string, name: string) => void;
  reorderCarouselSlide: (fromIdx: number, toIdx: number) => void;
  applyCarouselTemplate: (templateId: CarouselTemplateId) => void;
  updateCarouselTheme: (patch: Partial<CarouselGlobalTheme>) => void;
  handleExportAllCarouselSlides: (
    format: ExportFormat,
    quality: number,
  ) => Promise<void>;
  handleBatchExport: (
    presets: CanvasPresetId[],
    format: ExportFormat,
    quality: number,
  ) => Promise<{ succeeded: number; failed: string[] }>;
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
  addProceduralLayer: (rawConfig?: Partial<ProceduralConfig>) => void;
  applyProceduralBackground: (rawConfig: Partial<ProceduralConfig>) => void;
  applyProceduralOverlay: (rawConfig: Partial<ProceduralConfig>) => void;
  updateProceduralConfig: (
    id: string,
    partialConfig: Partial<ProceduralConfig>,
    options?: { coalesce?: boolean },
  ) => void;
  extractPaletteFromActivePhoto: () => Promise<string[] | null>;
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
  initialWorkspaceMode?: WorkspaceMode;
  onBackToDashboard: () => void;
  children: ReactNode;
}

export function StoryEditorProvider({
  projectId,
  initialProject = null,
  initialTemplate = null,
  initialWorkspaceMode = 'story',
  onBackToDashboard,
  children,
}: StoryEditorProviderProps) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const wsDef = getWorkspaceDefinition(
    initialProject?.document.workspaceMode ?? initialWorkspaceMode,
  );
  const defaultPresetDef = getCanvasPreset(wsDef.defaultPreset);

  const [projectTitle, setProjectTitle] = useState(
    initialProject?.name ??
      initialTemplate?.title ??
      (wsDef.id === 'carousel' ? 'Untitled Carousel' : 'Untitled Story'),
  );
  const [templateCategory, setTemplateCategory] = useState<
    TemplateCategory | undefined
  >(initialProject?.templateCategory ?? initialTemplate?.category);

  const [activeCategory, setActiveCategory] = useState<EditorToolCategory>(
    wsDef.defaultTool,
  );
  const [zoom, setZoom] = useState(100);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [isComparingOriginal, setIsComparingOriginal] = useState(false);
  const [isCarouselOverviewOpen, setIsCarouselOverviewOpen] = useState(false);
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
    if (initialTemplate) {
      return {
        ...buildTemplateDocument(initialTemplate, []),
        canvasWidth: CANVAS_WIDTH,
        canvasHeight: CANVAS_HEIGHT,
        canvasPreset: 'story-9-16',
        workspaceMode: initialWorkspaceMode,
      };
    }
    if (wsDef.id === 'carousel') {
      const deck = createStarterCarouselDeck(
        'minimal-editorial',
        defaultPresetDef.width,
        defaultPresetDef.height,
      );
      const first = deck.slides[0];
      return {
        backgroundColor: first.backgroundColor,
        elements: first.elements,
        canvasWidth: defaultPresetDef.width,
        canvasHeight: defaultPresetDef.height,
        canvasPreset: defaultPresetDef.id,
        workspaceMode: 'carousel',
        slides: deck.slides,
        activeSlideId: first.id,
        carouselTheme: deck.theme,
      };
    }
    return {
      backgroundColor: DEFAULT_CANVAS_BG,
      elements: [],
      canvasWidth: defaultPresetDef.width,
      canvasHeight: defaultPresetDef.height,
      canvasPreset: defaultPresetDef.id,
      workspaceMode: wsDef.id,
    };
  }, [
    initialProject,
    initialTemplate,
    initialWorkspaceMode,
    wsDef.id,
    defaultPresetDef.id,
    defaultPresetDef.width,
    defaultPresetDef.height,
  ]);

  const { state, commitState: rawCommitState, resetHistory, undo, redo, canUndo, canRedo } =
    useEditorHistory(initialDoc);

  const canvasWidth = state.canvasWidth ?? CANVAS_WIDTH;
  const canvasHeight = state.canvasHeight ?? CANVAS_HEIGHT;
  const canvasPreset = state.canvasPreset ?? 'story-9-16';
  const workspaceMode = state.workspaceMode ?? initialWorkspaceMode;

  // Keep active Carousel slide synced automatically on every state commit
  const commitState = useCallback(
    (
      updater: (prev: CanvasDocumentState) => CanvasDocumentState,
      options?: { coalesce?: boolean },
    ) => {
      rawCommitState((prev) => {
        const next = updater(prev);
        if (next === prev) return prev;
        if (next.slides && next.activeSlideId && next.slides === prev.slides) {
          const syncedSlides = next.slides.map((s) =>
            s.id === next.activeSlideId
              ? {
                  ...s,
                  backgroundColor: next.backgroundColor,
                  elements: next.elements,
                  smartLayout: next.smartLayout,
                }
              : s,
          );
          return { ...next, slides: syncedSlides };
        }
        return next;
      }, options);
    },
    [rawCommitState],
  );

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

  const addProceduralLayer = useCallback(
    (rawConfig?: Partial<ProceduralConfig>) => {
      const config = sanitizeProceduralConfig(rawConfig);
      const size = 640;
      const el: CanvasProceduralElement = {
        id: createElementId('proc'),
        type: 'procedural',
        name: formatProceduralLayerName(config),
        x: Math.round((CANVAS_WIDTH - size) / 2),
        y: Math.round((CANVAS_HEIGHT - size) / 2),
        width: size,
        height: size,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        procedural: config,
      };
      commitState((prev) => ({ ...prev, elements: [...prev.elements, el] }));
      setSelectedElementId(el.id);
    },
    [commitState],
  );

  const applyProceduralBackground = useCallback(
    (rawConfig: Partial<ProceduralConfig>) => {
      const config = sanitizeProceduralConfig(rawConfig);
      const meta = PROCEDURAL_GENERATORS.find(
        (g) => g.id === config.generatorType,
      );
      let targetId = '';

      commitState((prev) => {
        const first = prev.elements[0];
        const isExistingFullBg =
          first?.type === 'procedural' &&
          first.x === 0 &&
          first.y === 0 &&
          first.width === CANVAS_WIDTH &&
          first.height === CANVAS_HEIGHT &&
          !first.locked;

        const nextBgColor = meta?.hasTransparentNegativeSpace
          ? config.palette[0]
          : prev.backgroundColor;

        if (isExistingFullBg) {
          targetId = first.id;
          const updatedFirst: CanvasProceduralElement = {
            ...first,
            name: `Latar · ${formatProceduralLayerName(config)}`,
            visible: true,
            procedural: config,
          };
          return {
            ...prev,
            backgroundColor: nextBgColor,
            elements: [updatedFirst, ...prev.elements.slice(1)],
          };
        }

        const bgElement: CanvasProceduralElement = {
          id: createElementId('proc-bg'),
          type: 'procedural',
          name: `Latar · ${formatProceduralLayerName(config)}`,
          x: 0,
          y: 0,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          procedural: config,
        };
        targetId = bgElement.id;
        return {
          ...prev,
          backgroundColor: nextBgColor,
          elements: [bgElement, ...prev.elements],
        };
      });

      if (targetId) {
        setSelectedElementId(targetId);
      }
    },
    [commitState],
  );

  const applyProceduralOverlay = useCallback(
    (rawConfig: Partial<ProceduralConfig>) => {
      const requestedBlend = rawConfig.blendMode;
      const config = sanitizeProceduralConfig({
        ...rawConfig,
        blendMode:
          requestedBlend && requestedBlend !== 'normal'
            ? requestedBlend
            : 'screen',
      });
      let targetId = '';

      commitState((prev) => {
        const lastIdx = prev.elements.length - 1;
        const last = lastIdx >= 0 ? prev.elements[lastIdx] : undefined;
        const isExistingTopOverlay =
          last?.type === 'procedural' &&
          last.x === 0 &&
          last.y === 0 &&
          last.width === CANVAS_WIDTH &&
          last.height === CANVAS_HEIGHT &&
          (last.id.startsWith('proc-ov-') || last.name.startsWith('Overlay ·')) &&
          !last.locked;

        if (isExistingTopOverlay) {
          targetId = last.id;
          const updatedLast: CanvasProceduralElement = {
            ...last,
            name: `Overlay · ${formatProceduralLayerName(config)}`,
            width: canvasWidth,
            height: canvasHeight,
            opacity: 0.42,
            visible: true,
            procedural: config,
          };
          return {
            ...prev,
            elements: [...prev.elements.slice(0, lastIdx), updatedLast],
          };
        }

        const overlayElement: CanvasProceduralElement = {
          id: createElementId('proc-ov'),
          type: 'procedural',
          name: `Overlay · ${formatProceduralLayerName(config)}`,
          x: 0,
          y: 0,
          width: canvasWidth,
          height: canvasHeight,
          rotation: 0,
          opacity: 0.42,
          visible: true,
          locked: false,
          procedural: config,
        };
        targetId = overlayElement.id;
        return {
          ...prev,
          elements: [...prev.elements, overlayElement],
        };
      });

      if (targetId) {
        setSelectedElementId(targetId);
      }
    },
    [commitState],
  );

  const extractPaletteFromActivePhoto = useCallback(async (): Promise<
    string[] | null
  > => {
    const activePhotoEl =
      selectedElement?.type === 'photo' && selectedElement.photoId
        ? selectedElement
        : state.elements.find(
            (el): el is CanvasPhotoElement =>
              el.type === 'photo' && Boolean(el.photoId),
          );

    const photo = activePhotoEl
      ? photosById[activePhotoEl.photoId]
      : uploadedPhotos[0];

    if (!photo) return null;

    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        resolve(extractHarmoniousPaletteFromImage(img));
      };
      img.onerror = () => resolve(null);
      img.src = photo.objectUrl;
    });
  }, [photosById, selectedElement, state.elements, uploadedPhotos]);

  const updateProceduralConfig = useCallback(
    (
      id: string,
      partialConfig: Partial<ProceduralConfig>,
      options?: { coalesce?: boolean },
    ) => {
      commitState((prev) => {
        return {
          ...prev,
          elements: prev.elements.map((el) => {
            if (el.id !== id || el.type !== 'procedural') return el;
            const prevDefaultName = formatProceduralLayerName(el.procedural);
            const prevBgDefaultName = `Latar · ${prevDefaultName}`;
            const nextConfig = sanitizeProceduralConfig({
              ...el.procedural,
              ...partialConfig,
            });
            const nextDefaultName = formatProceduralLayerName(nextConfig);
            const nextName =
              el.name === prevDefaultName
                ? nextDefaultName
                : el.name === prevBgDefaultName
                  ? `Latar · ${nextDefaultName}`
                  : el.name;

            return {
              ...el,
              name: nextName,
              procedural: nextConfig,
            };
          }),
        };
      }, options);
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
          canvasWidth,
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
    [projectTitle, canvasWidth],
  );

  const changeCanvasFormat = useCallback(
    (presetId: CanvasPresetId, customW?: number, customH?: number) => {
      const preset = getCanvasPreset(presetId);
      const { width: nextW, height: nextH } =
        presetId === 'custom'
          ? sanitizeCanvasDimensions(customW ?? canvasWidth, customH ?? canvasHeight)
          : { width: preset.width, height: preset.height };

      commitState((prev) => {
        const oldW = prev.canvasWidth ?? CANVAS_WIDTH;
        const oldH = prev.canvasHeight ?? CANVAS_HEIGHT;
        const adaptedElements = adaptElementsToCanvasSize(
          prev.elements,
          oldW,
          oldH,
          nextW,
          nextH,
          prev.smartLayout?.layoutId,
          prev.smartLayout,
          photosById,
        );
        const adaptedSlides = prev.slides?.map((s) => ({
          ...s,
          elements: adaptElementsToCanvasSize(
            s.elements,
            oldW,
            oldH,
            nextW,
            nextH,
            s.smartLayout?.layoutId,
            s.smartLayout,
            photosById,
          ),
        }));
        return {
          ...prev,
          canvasWidth: nextW,
          canvasHeight: nextH,
          canvasPreset: presetId,
          elements: adaptedElements,
          slides: adaptedSlides,
        };
      });
    },
    [canvasWidth, canvasHeight, commitState, photosById],
  );

  const selectCarouselSlide = useCallback(
    (slideId: string) => {
      rawCommitState((prev) => {
        if (!prev.slides) return prev;
        const target = prev.slides.find((s) => s.id === slideId);
        if (!target) return prev;
        return {
          ...prev,
          activeSlideId: target.id,
          backgroundColor: target.backgroundColor,
          elements: target.elements,
          smartLayout: target.smartLayout,
        };
      });
      setSelectedElementId(null);
    },
    [rawCommitState],
  );

  const addCarouselSlide = useCallback(() => {
    rawCommitState((prev) => {
      const theme = prev.carouselTheme ?? DEFAULT_CAROUSEL_THEME;
      const existing = prev.slides ?? [];
      const newSlide = createCarouselSlide(`Slide ${existing.length + 1}`, theme);
      return {
        ...prev,
        slides: [...existing, newSlide],
        activeSlideId: newSlide.id,
        backgroundColor: newSlide.backgroundColor,
        elements: newSlide.elements,
        smartLayout: undefined,
      };
    });
    setSelectedElementId(null);
  }, [rawCommitState]);

  const duplicateCarouselSlideById = useCallback(
    (slideId: string) => {
      rawCommitState((prev) => {
        if (!prev.slides) return prev;
        const { slides, duplicated } = duplicateCarouselSlide(prev.slides, slideId);
        if (!duplicated) return prev;
        return {
          ...prev,
          slides,
          activeSlideId: duplicated.id,
          backgroundColor: duplicated.backgroundColor,
          elements: duplicated.elements,
          smartLayout: duplicated.smartLayout,
        };
      });
      setSelectedElementId(null);
    },
    [rawCommitState],
  );

  const deleteCarouselSlideById = useCallback(
    (slideId: string) => {
      rawCommitState((prev) => {
        if (!prev.slides || prev.slides.length <= 1) return prev;
        const { slides, nextActiveSlideId } = deleteCarouselSlide(
          prev.slides,
          slideId,
          prev.activeSlideId ?? prev.slides[0].id,
        );
        const active = slides.find((s) => s.id === nextActiveSlideId) ?? slides[0];
        return {
          ...prev,
          slides,
          activeSlideId: active.id,
          backgroundColor: active.backgroundColor,
          elements: active.elements,
          smartLayout: active.smartLayout,
        };
      });
      setSelectedElementId(null);
    },
    [rawCommitState],
  );

  const renameCarouselSlide = useCallback(
    (slideId: string, name: string) => {
      rawCommitState((prev) => {
        if (!prev.slides) return prev;
        return {
          ...prev,
          slides: prev.slides.map((s) => (s.id === slideId ? { ...s, name } : s)),
        };
      });
    },
    [rawCommitState],
  );

  const reorderCarouselSlide = useCallback(
    (fromIdx: number, toIdx: number) => {
      rawCommitState((prev) => {
        if (!prev.slides) return prev;
        return {
          ...prev,
          slides: reorderCarouselSlides(prev.slides, fromIdx, toIdx),
        };
      });
    },
    [rawCommitState],
  );

  const applyCarouselTemplate = useCallback(
    (templateId: CarouselTemplateId) => {
      rawCommitState((prev) => {
        const deck = createStarterCarouselDeck(
          templateId,
          prev.canvasWidth ?? canvasWidth,
          prev.canvasHeight ?? canvasHeight,
        );
        const first = deck.slides[0];
        return {
          ...prev,
          carouselTheme: deck.theme,
          slides: deck.slides,
          activeSlideId: first.id,
          backgroundColor: first.backgroundColor,
          elements: first.elements,
          smartLayout: undefined,
        };
      });
      setSelectedElementId(null);
    },
    [rawCommitState, canvasWidth, canvasHeight],
  );

  const updateCarouselTheme = useCallback(
    (patch: Partial<CarouselGlobalTheme>) => {
      rawCommitState((prev) => {
        const nextTheme: CarouselGlobalTheme = {
          ...(prev.carouselTheme ?? DEFAULT_CAROUSEL_THEME),
          ...patch,
        };
        const updatedSlides = prev.slides
          ? applyGlobalThemeToSlides(prev.slides, nextTheme)
          : undefined;
        const active = updatedSlides?.find((s) => s.id === prev.activeSlideId);
        return {
          ...prev,
          carouselTheme: nextTheme,
          slides: updatedSlides,
          backgroundColor: active?.backgroundColor ?? nextTheme.backgroundColor,
          elements: active?.elements ?? prev.elements,
        };
      });
    },
    [rawCommitState],
  );

  const handleExportAllCarouselSlides = useCallback(
    async (format: ExportFormat, quality: number) => {
      const slides = state.slides ?? [];
      if (slides.length === 0) return;
      setIsExporting(true);
      try {
        const safeBase =
          projectTitle
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-_]+/g, '-') || 'frame-carousel';
        const ext = format === 'jpeg' ? 'jpg' : 'png';
        for (let i = 0; i < slides.length; i++) {
          const slide = slides[i];
          const blob = await renderSnapshotOffscreenToBlob(
            slide.elements,
            slide.backgroundColor,
            canvasWidth,
            canvasHeight,
            photosById,
            format,
            quality,
          );
          const num = String(i + 1).padStart(2, '0');
          downloadBlob(blob, `${safeBase}-slide-${num}.${ext}`);
          await new Promise((r) => window.setTimeout(r, 200));
        }
        setIsExportOpen(false);
      } finally {
        setIsExporting(false);
      }
    },
    [state.slides, projectTitle, canvasWidth, canvasHeight, photosById],
  );

  const handleBatchExport = useCallback(
    async (
      presets: CanvasPresetId[],
      format: ExportFormat,
      quality: number,
    ): Promise<{ succeeded: number; failed: string[] }> => {
      setIsExporting(true);
      try {
        if (state.slides && state.slides.length > 0) {
          let totalSucceeded = 0;
          const allFailed: string[] = [];
          for (let i = 0; i < state.slides.length; i++) {
            const slide = state.slides[i];
            const res = await runMultiFormatBatchExport({
              projectName: projectTitle,
              elements: slide.elements,
              backgroundColor: slide.backgroundColor,
              sourceWidth: canvasWidth,
              sourceHeight: canvasHeight,
              activeLayoutId: slide.smartLayout?.layoutId,
              photosById,
              presets,
              format,
              quality,
              slideSuffix: `slide-${String(i + 1).padStart(2, '0')}`,
            });
            totalSucceeded += res.succeeded;
            allFailed.push(...res.failed);
          }
          return { succeeded: totalSucceeded, failed: allFailed };
        }

        return await runMultiFormatBatchExport({
          projectName: projectTitle,
          elements: state.elements,
          backgroundColor: state.backgroundColor,
          sourceWidth: canvasWidth,
          sourceHeight: canvasHeight,
          activeLayoutId: state.smartLayout?.layoutId,
          photosById,
          presets,
          format,
          quality,
        });
      } finally {
        setIsExporting(false);
      }
    },
    [state, projectTitle, canvasWidth, canvasHeight, photosById],
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
    isComparingOriginal,
    setIsComparingOriginal,
    canvasWidth,
    canvasHeight,
    canvasPreset,
    workspaceMode,
    changeCanvasFormat,
    isCarouselOverviewOpen,
    setIsCarouselOverviewOpen,
    selectCarouselSlide,
    addCarouselSlide,
    duplicateCarouselSlideById,
    deleteCarouselSlideById,
    renameCarouselSlide,
    reorderCarouselSlide,
    applyCarouselTemplate,
    updateCarouselTheme,
    handleExportAllCarouselSlides,
    handleBatchExport,
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
    addProceduralLayer,
    applyProceduralBackground,
    applyProceduralOverlay,
    updateProceduralConfig,
    extractPaletteFromActivePhoto,
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
