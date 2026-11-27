import { useCallback, useEffect } from 'react';

interface UseKeyboardShortcutsOptions {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onDeselect: () => void;
  enabled: boolean;
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onDelete,
  onDuplicate,
  onDeselect,
  enabled,
}: UseKeyboardShortcutsOptions) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'z' && !e.shiftKey) {
        if (isInput) return;
        e.preventDefault();
        onUndo();
        return;
      }

      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        if (isInput) return;
        e.preventDefault();
        onRedo();
        return;
      }

      if (ctrl && e.key === 'd') {
        if (isInput) return;
        e.preventDefault();
        onDuplicate();
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput) {
        e.preventDefault();
        onDelete();
        return;
      }

      if (e.key === 'Escape') {
        onDeselect();
        return;
      }
    },
    [enabled, onUndo, onRedo, onDelete, onDuplicate, onDeselect],
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
