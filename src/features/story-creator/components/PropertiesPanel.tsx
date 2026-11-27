import {
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Unlock,
  X,
} from 'lucide-react';
import { AnimationPropertiesPanel } from '@/features/story-creator/components/properties/AnimationPropertiesPanel';
import { CanvasPropertiesPanel } from '@/features/story-creator/components/properties/CanvasPropertiesPanel';
import { PhotoPropertiesPanel } from '@/features/story-creator/components/properties/PhotoPropertiesPanel';
import { ProceduralPropertiesPanel } from '@/features/story-creator/components/properties/ProceduralPropertiesPanel';
import { ShapePropertiesPanel } from '@/features/story-creator/components/properties/ShapePropertiesPanel';
import { TextPropertiesPanel } from '@/features/story-creator/components/properties/TextPropertiesPanel';
import { useStoryEditor } from '@/features/story-creator/context/StoryEditorContext';
import type { CanvasElement } from '@/types/studio';

export function PropertiesPanel() {
  const {
    showSafeArea,
    toggleSafeArea,
    canvasWidth,
    canvasHeight,
    canvasPreset,
    changeCanvasFormat,
    state,
    handleChangeBackground,
    selectedElement: sel,
    uploadedPhotos,
    handleUpdateElement,
    updateProceduralConfig,
    openCropForElement,
    handleDeleteElement,
    handleDuplicateElement,
    handleBringForward,
    handleSendBackward,
    handleBringToFront,
    handleSendToBack,
    handleCenterHorizontally,
    handleCenterVertically,
    isMobilePropertiesOpen,
    setIsMobilePropertiesOpen,
  } = useStoryEditor();

  const updateSelected = (
    patch: Partial<CanvasElement>,
    options?: { coalesce?: boolean },
  ) => {
    if (sel) handleUpdateElement(sel.id, patch, options);
  };

  return (
    <>
      {isMobilePropertiesOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobilePropertiesOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-76 shrink-0 flex-col border-l border-white/8 bg-[#0c0c0e] transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          isMobilePropertiesOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-12 items-center justify-between border-b border-white/8 px-4">
          <span className="text-xs font-semibold tracking-wider text-neutral-300 uppercase">
            Properties
          </span>
          <button
            type="button"
            onClick={() => setIsMobilePropertiesOpen(false)}
            className="rounded-md p-1 text-neutral-400 hover:bg-white/6 hover:text-white lg:hidden"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {sel && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="truncate text-xs font-semibold capitalize text-white">
                    {sel.type} · {sel.name}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicateElement(sel.id)}
                      title="Duplikat (Ctrl+D)"
                      className="rounded p-1 text-neutral-400 hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={sel.locked}
                      onClick={() => handleDeleteElement(sel.id)}
                      title="Hapus (Del)"
                      className="rounded p-1 text-neutral-400 hover:text-red-400 disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Alignment Tools */}
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled={sel.locked}
                    onClick={handleCenterHorizontally}
                    title="Tengah Horizontal"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] py-1.5 text-[11px] text-neutral-300 hover:bg-white/[0.08] disabled:opacity-40"
                  >
                    <AlignHorizontalJustifyCenter className="h-3.5 w-3.5" />
                    <span>Tengah H</span>
                  </button>
                  <button
                    type="button"
                    disabled={sel.locked}
                    onClick={handleCenterVertically}
                    title="Tengah Vertikal"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] py-1.5 text-[11px] text-neutral-300 hover:bg-white/[0.08] disabled:opacity-40"
                  >
                    <AlignVerticalJustifyCenter className="h-3.5 w-3.5" />
                    <span>Tengah V</span>
                  </button>
                </div>

                {/* Common Transform Coordinates */}
                <div className="grid grid-cols-3 gap-2">
                  <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
                    <span className="block text-[10px] text-neutral-500">X</span>
                    <input
                      type="number"
                      disabled={sel.locked}
                      value={sel.x}
                      onChange={(e) =>
                        updateSelected({ x: Number(e.target.value) || 0 })
                      }
                      className="mt-0.5 w-full bg-transparent text-xs font-medium text-neutral-200 focus:outline-none disabled:opacity-50"
                    />
                  </label>
                  <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
                    <span className="block text-[10px] text-neutral-500">Y</span>
                    <input
                      type="number"
                      disabled={sel.locked}
                      value={sel.y}
                      onChange={(e) =>
                        updateSelected({ y: Number(e.target.value) || 0 })
                      }
                      className="mt-0.5 w-full bg-transparent text-xs font-medium text-neutral-200 focus:outline-none disabled:opacity-50"
                    />
                  </label>
                  <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
                    <span className="block text-[10px] text-neutral-500">
                      Rotasi °
                    </span>
                    <input
                      type="number"
                      disabled={sel.locked}
                      value={sel.rotation}
                      onChange={(e) =>
                        updateSelected({
                          rotation: Number(e.target.value) || 0,
                        })
                      }
                      className="mt-0.5 w-full bg-transparent text-xs font-medium text-neutral-200 focus:outline-none disabled:opacity-50"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {'width' in sel && (
                    <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
                      <span className="block text-[10px] text-neutral-500">
                        Lebar
                      </span>
                      <input
                        type="number"
                        min={20}
                        disabled={sel.locked}
                        value={sel.width}
                        onChange={(e) =>
                          updateSelected({
                            width: Math.max(20, Number(e.target.value) || 20),
                          } as Partial<CanvasElement>)
                        }
                        className="mt-0.5 w-full bg-transparent text-xs font-medium text-neutral-200 focus:outline-none disabled:opacity-50"
                      />
                    </label>
                  )}
                  {'height' in sel && (
                    <label className="rounded-xl border border-white/8 bg-white/[0.02] p-2">
                      <span className="block text-[10px] text-neutral-500">
                        Tinggi
                      </span>
                      <input
                        type="number"
                        min={20}
                        disabled={sel.locked}
                        value={sel.height}
                        onChange={(e) =>
                          updateSelected({
                            height: Math.max(20, Number(e.target.value) || 20),
                          } as Partial<CanvasElement>)
                        }
                        className="mt-0.5 w-full bg-transparent text-xs font-medium text-neutral-200 focus:outline-none disabled:opacity-50"
                      />
                    </label>
                  )}
                  {sel.type === 'line' && (
                    <label className="col-span-2 rounded-xl border border-white/8 bg-white/[0.02] p-2">
                      <span className="block text-[10px] text-neutral-500">
                        Panjang
                      </span>
                      <input
                        type="number"
                        min={20}
                        disabled={sel.locked}
                        value={sel.length}
                        onChange={(e) =>
                          updateSelected({
                            length: Math.max(20, Number(e.target.value) || 20),
                          } as Partial<CanvasElement>)
                        }
                        className="mt-0.5 w-full bg-transparent text-xs font-medium text-neutral-200 focus:outline-none disabled:opacity-50"
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>Opacity</span>
                    <span>{Math.round(sel.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={1}
                    step={0.05}
                    disabled={sel.locked}
                    value={sel.opacity}
                    onChange={(e) =>
                      updateSelected(
                        { opacity: Number(e.target.value) },
                        { coalesce: true },
                      )
                    }
                    className="w-full accent-white"
                  />
                </div>

                {/* Contextual Type-Specific Sub-Panels */}
                {sel.type === 'photo' && (
                  <PhotoPropertiesPanel
                    element={sel}
                    photos={uploadedPhotos}
                    onUpdate={updateSelected}
                    onOpenCrop={() => {
                      if (sel.photoId && !sel.locked) {
                        openCropForElement(sel.id);
                      }
                    }}
                  />
                )}

                {sel.type === 'text' && (
                  <TextPropertiesPanel
                    element={sel}
                    onUpdate={updateSelected}
                  />
                )}

                {(sel.type === 'shape' ||
                  sel.type === 'line' ||
                  sel.type === 'decorative') && (
                  <ShapePropertiesPanel
                    element={sel}
                    onUpdate={updateSelected}
                  />
                )}

                {sel.type === 'procedural' && (
                  <ProceduralPropertiesPanel
                    element={sel}
                    onUpdateConfig={(patch, opts) =>
                      updateProceduralConfig(sel.id, patch, opts)
                    }
                  />
                )}

                <AnimationPropertiesPanel
                  element={sel}
                  onUpdate={updateSelected}
                />

                {/* Visibility, Lock, and Layer Order */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateSelected({ visible: !sel.visible })}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] py-1.5 text-[11px] text-neutral-300 hover:bg-white/[0.08]"
                    >
                      {sel.visible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                      <span>{sel.visible ? 'Visible' : 'Hidden'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelected({ locked: !sel.locked })}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] py-1.5 text-[11px] text-neutral-300 hover:bg-white/[0.08]"
                    >
                      {sel.locked ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <Unlock className="h-3 w-3" />
                      )}
                      <span>{sel.locked ? 'Locked' : 'Unlocked'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={handleBringToFront}
                      title="Bring to Front"
                      className="flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] py-1.5 text-neutral-300 hover:bg-white/[0.08]"
                    >
                      <ArrowUpToLine className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleBringForward}
                      title="Bring Forward"
                      className="flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] py-1.5 text-neutral-300 hover:bg-white/[0.08]"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleSendBackward}
                      title="Send Backward"
                      className="flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] py-1.5 text-neutral-300 hover:bg-white/[0.08]"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleSendToBack}
                      title="Send to Back"
                      className="flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] py-1.5 text-neutral-300 hover:bg-white/[0.08]"
                    >
                      <ArrowDownToLine className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-px bg-white/8" />
            </>
          )}

          <CanvasPropertiesPanel
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            canvasPreset={canvasPreset}
            onChangeFormat={changeCanvasFormat}
            backgroundColor={state.backgroundColor}
            onChangeBackground={handleChangeBackground}
            showSafeArea={showSafeArea}
            onToggleSafeArea={toggleSafeArea}
          />
        </div>
      </aside>
    </>
  );
}
