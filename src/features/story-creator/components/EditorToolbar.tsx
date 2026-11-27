import {
  Image,
  Layers,
  LayoutGrid,
  LayoutTemplate,
  Palette,
  Plus,
  Shapes,
  Type,
  Upload,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { BackgroundControls } from '@/features/story-creator/components/BackgroundControls';
import { ElementsPanel } from '@/features/story-creator/components/ElementsPanel';
import { LayersPanel } from '@/features/story-creator/components/LayersPanel';
import { PhotoUploadPanel } from '@/features/story-creator/components/PhotoUploadPanel';
import { SmartLayoutPanel } from '@/features/story-creator/components/SmartLayoutPanel';
import { TemplatesPanel } from '@/features/story-creator/components/TemplatesPanel';
import { TextPanel } from '@/features/story-creator/components/TextPanel';
import { useStoryEditor } from '@/features/story-creator/context/StoryEditorContext';
import type { EditorToolCategory } from '@/types/studio';

const TOOL_CATEGORIES: Array<{
  id: EditorToolCategory;
  label: string;
  icon: typeof LayoutTemplate;
}> = [
  { id: 'uploads', label: 'Uploads', icon: Upload },
  { id: 'layout', label: 'Layout', icon: LayoutGrid },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'elements', label: 'Elements', icon: Shapes },
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'background', label: 'Background', icon: Palette },
  { id: 'layers', label: 'Layers', icon: Layers },
];

export function EditorToolbar() {
  const {
    activeCategory,
    setActiveCategory,
    uploadedPhotos: photos,
    handlePhotosAdded,
    handleAddPhotoToCanvas,
    state,
    handleChangeBackground,
    handleAddText,
    handleAddShape,
    handleAddLine,
    handleAddDecorative,
    handleAddPhotoFrame,
    selectedElementId,
    setSelectedElementId,
    handleUpdateElement,
    handleDeleteElement,
    handleDuplicateElement,
    handleReorderLayer,
    handleApplyTemplate,
    hasManualPhotoContent,
    handleApplySmartLayout,
    handleUpdateSmartLayoutParams,
    handleResetSmartLayoutDefaults,
    openCropForSlot,
  } = useStoryEditor();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const currentTool =
    TOOL_CATEGORIES.find((c) => c.id === activeCategory) ?? TOOL_CATEGORIES[0];

  const handleCategoryClick = (id: EditorToolCategory) => {
    if (activeCategory === id) {
      setMobileDrawerOpen((prev) => !prev);
    } else {
      setActiveCategory(id);
      setMobileDrawerOpen(true);
    }
  };

  const renderPanel = () => {
    switch (activeCategory) {
      case 'uploads':
        return (
          <PhotoUploadPanel
            photos={photos}
            onPhotosAdded={handlePhotosAdded}
            onAddPhotoToCanvas={handleAddPhotoToCanvas}
          />
        );
      case 'layout':
        return (
          <SmartLayoutPanel
            photos={photos}
            appliedLayout={state.smartLayout}
            backgroundColor={state.backgroundColor}
            hasManualPhotoContent={hasManualPhotoContent}
            onApplyLayout={handleApplySmartLayout}
            onUpdateLayoutParams={handleUpdateSmartLayoutParams}
            onResetLayoutDefaults={handleResetSmartLayoutDefaults}
            onChangeBackground={handleChangeBackground}
            onEditSlotCrop={openCropForSlot}
            onGoToUploads={() => setActiveCategory('uploads')}
          />
        );
      case 'templates':
        return (
          <TemplatesPanel
            hasExistingContent={state.elements.length > 0}
            onApplyTemplate={handleApplyTemplate}
          />
        );
      case 'text':
        return <TextPanel onAddText={handleAddText} />;
      case 'elements':
        return (
          <ElementsPanel
            onAddShape={handleAddShape}
            onAddLine={handleAddLine}
            onAddDecorative={handleAddDecorative}
            onAddPhotoFrame={handleAddPhotoFrame}
          />
        );
      case 'photos':
        return (
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
            {photos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center">
                <p className="text-xs font-medium text-neutral-300">
                  Belum ada foto diunggah
                </p>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Unggah foto melalui tab Uploads terlebih dahulu.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveCategory('uploads')}
                  className="mt-3 rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-950 hover:bg-neutral-200"
                >
                  Ke Uploads
                </button>
              </div>
            ) : (
              <>
                <p className="text-[10px] leading-relaxed text-neutral-400">
                  Klik foto untuk menambahkannya ke kanvas (atau mengisi Frame
                  foto yang sedang dipilih).
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => handleAddPhotoToCanvas(photo)}
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
              </>
            )}
          </div>
        );
      case 'background':
        return (
          <BackgroundControls
            backgroundColor={state.backgroundColor}
            onChangeBackground={handleChangeBackground}
          />
        );
      case 'layers':
        return (
          <LayersPanel
            elements={state.elements}
            selectedId={selectedElementId}
            onSelect={setSelectedElementId}
            onToggleVisibility={(id) => {
              const target = state.elements.find((e) => e.id === id);
              if (target) handleUpdateElement(id, { visible: !target.visible });
            }}
            onToggleLock={(id) => {
              const target = state.elements.find((e) => e.id === id);
              if (target) handleUpdateElement(id, { locked: !target.locked });
            }}
            onDelete={handleDeleteElement}
            onDuplicate={handleDuplicateElement}
            onRename={(id, name) => handleUpdateElement(id, { name })}
            onReorder={handleReorderLayer}
          />
        );
    }
  };

  return (
    <div className="relative flex shrink-0 flex-col border-b border-white/8 bg-[#0c0c0e] lg:flex-row lg:border-r lg:border-b-0">
      <nav
        className="flex flex-row items-center gap-1 overflow-x-auto px-2 py-2 lg:w-20 lg:flex-col lg:gap-1.5 lg:px-2 lg:py-3"
        aria-label="Alat editor Story"
      >
        {TOOL_CATEGORIES.map((item) => {
          const Icon = item.icon;
          const isActive = activeCategory === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleCategoryClick(item.id)}
              className={`flex shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium transition-all lg:w-full lg:px-1.5 lg:py-2 ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Panel */}
      <div className="hidden w-68 flex-col border-l border-white/8 bg-[#0f0f12] p-4 lg:flex">
        <div className="mb-3 border-b border-white/8 pb-2.5">
          <h2 className="text-sm font-semibold text-white">
            {currentTool.label === 'Layout'
              ? 'Smart Layout'
              : currentTool.label}
          </h2>
        </div>
        {renderPanel()}
      </div>

      {/* Mobile Panel Sheet */}
      {mobileDrawerOpen && (
        <div className="flex max-h-80 flex-col border-t border-white/8 bg-[#0f0f12] p-3 lg:hidden">
          <div className="mb-2.5 flex items-center justify-between border-b border-white/8 pb-2">
            <h2 className="text-xs font-semibold text-white">
              {currentTool.label === 'Layout'
                ? 'Smart Layout'
                : currentTool.label}
            </h2>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="rounded-md p-1 text-neutral-400 hover:text-white"
              aria-label="Tutup panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {renderPanel()}
        </div>
      )}
    </div>
  );
}
