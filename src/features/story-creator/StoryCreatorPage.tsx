import { AlertTriangle } from 'lucide-react';
import { CarouselSlideBar } from '@/features/story-creator/components/CarouselSlideBar';
import { CropOverlayModal } from '@/features/story-creator/components/CropOverlayModal';
import { EditorBottomBar } from '@/features/story-creator/components/EditorBottomBar';
import { EditorHeader } from '@/features/story-creator/components/EditorHeader';
import { EditorToolbar } from '@/features/story-creator/components/EditorToolbar';
import { ExportDialog } from '@/features/story-creator/components/ExportDialog';
import { PreviewMode } from '@/features/story-creator/components/PreviewMode';
import { PropertiesPanel } from '@/features/story-creator/components/PropertiesPanel';
import { StoryCanvas } from '@/features/story-creator/components/StoryCanvas';
import {
  StoryEditorProvider,
  useStoryEditor,
} from '@/features/story-creator/context/StoryEditorContext';
import type {
  StoredProject,
  StoryTemplate,
  WorkspaceMode,
} from '@/types/studio';

interface StoryCreatorPageProps {
  projectId: string;
  initialProject?: StoredProject | null;
  initialTemplate?: StoryTemplate | null;
  initialWorkspaceMode?: WorkspaceMode;
  onBackToDashboard: () => void;
}

function StoryCreatorWorkspace() {
  const {
    stageRef,
    projectTitle,
    setProjectTitle,
    saveStatus,
    storageWarning,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    showSafeArea,
    isComparingOriginal,
    setIsComparingOriginal,
    canvasWidth,
    canvasHeight,
    workspaceMode,
    isPreviewOpen,
    setIsPreviewOpen,
    isExportOpen,
    setIsExportOpen,
    isExporting,
    setIsMobilePropertiesOpen,
    croppingElement,
    openCropForElement,
    closeCrop,
    photosById,
    state,
    selectedElementId,
    setSelectedElementId,
    canUndo,
    canRedo,
    undo,
    redo,
    performSave,
    handleBackToDashboard,
    handleUpdateElement,
    handleExport,
    handleExportAllCarouselSlides,
    handleBatchExport,
  } = useStoryEditor();

  if (isPreviewOpen) {
    return (
      <PreviewMode
        projectTitle={projectTitle}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        backgroundColor={state.backgroundColor}
        elements={state.elements}
        photosById={photosById}
        onExitPreview={() => setIsPreviewOpen(false)}
      />
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#09090b] text-neutral-100 antialiased">
      <EditorHeader
        projectTitle={projectTitle}
        saveStatus={saveStatus}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onSave={() => void performSave()}
        onBackToDashboard={handleBackToDashboard}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onToggleMobileProperties={() => setIsMobilePropertiesOpen(true)}
        onRenameProject={setProjectTitle}
      />

      {storageWarning && (
        <div className="flex items-center justify-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-200">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
          <span>{storageWarning}</span>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <EditorToolbar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <StoryCanvas
            stageRef={stageRef}
            zoom={zoom}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            showSafeArea={showSafeArea}
            isComparingOriginal={isComparingOriginal}
            backgroundColor={state.backgroundColor}
            elements={state.elements}
            photosById={photosById}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onUpdateElement={handleUpdateElement}
            onOpenCrop={openCropForElement}
          />
          {workspaceMode === 'carousel' && <CarouselSlideBar />}
        </div>

        <PropertiesPanel />
      </div>

      <EditorBottomBar
        zoom={zoom}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        elementCount={state.elements.length}
        isComparingOriginal={isComparingOriginal}
        onSetComparingOriginal={setIsComparingOriginal}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
      />

      <ExportDialog
        isOpen={isExportOpen}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        slideCount={state.slides?.length ?? 0}
        onClose={() => setIsExportOpen(false)}
        onExport={(format, quality) => void handleExport(format, quality)}
        onExportAllSlides={(format, quality) =>
          void handleExportAllCarouselSlides(format, quality)
        }
        onBatchExport={handleBatchExport}
        isExporting={isExporting}
      />

      {croppingElement && photosById[croppingElement.photoId] && (
        <CropOverlayModal
          element={croppingElement}
          photo={photosById[croppingElement.photoId]}
          onCancel={closeCrop}
          onApply={(updated) => {
            handleUpdateElement(croppingElement.id, updated);
            closeCrop();
          }}
        />
      )}
    </div>
  );
}

export function StoryCreatorPage(props: StoryCreatorPageProps) {
  return (
    <StoryEditorProvider
      projectId={props.projectId}
      initialProject={props.initialProject}
      initialTemplate={props.initialTemplate}
      initialWorkspaceMode={props.initialWorkspaceMode}
      onBackToDashboard={props.onBackToDashboard}
    >
      <StoryCreatorWorkspace />
    </StoryEditorProvider>
  );
}
