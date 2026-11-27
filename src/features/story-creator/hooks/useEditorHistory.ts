import { useCallback, useRef, useState } from 'react';
import type { CanvasDocumentState } from '@/types/studio';

const MAX_HISTORY_ENTRIES = 50;
const COALESCE_WINDOW_MS = 320;

export function useEditorHistory(initialState: CanvasDocumentState) {
  const [past, setPast] = useState<CanvasDocumentState[]>([]);
  const [present, setPresent] = useState<CanvasDocumentState>(initialState);
  const [future, setFuture] = useState<CanvasDocumentState[]>([]);
  const lastCommitTimeRef = useRef<number>(0);

  const commitState = useCallback(
    (
      updater: (prev: CanvasDocumentState) => CanvasDocumentState,
      options?: { coalesce?: boolean },
    ) => {
      const now = Date.now();
      const shouldCoalesce =
        Boolean(options?.coalesce) &&
        now - lastCommitTimeRef.current < COALESCE_WINDOW_MS;
      lastCommitTimeRef.current = now;

      setPresent((current) => {
        const next = updater(current);
        if (next === current) return current;
        if (!shouldCoalesce) {
          setPast((prevPast) =>
            [...prevPast, current].slice(-MAX_HISTORY_ENTRIES),
          );
        }
        setFuture([]);
        return next;
      });
    },
    [],
  );

  const resetHistory = useCallback((nextState: CanvasDocumentState) => {
    lastCommitTimeRef.current = 0;
    setPast([]);
    setPresent(nextState);
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    lastCommitTimeRef.current = 0;
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const previous = prevPast[prevPast.length - 1];
      setPresent((current) => {
        setFuture((prevFuture) => [current, ...prevFuture]);
        return previous;
      });
      return prevPast.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    lastCommitTimeRef.current = 0;
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      setPresent((current) => {
        setPast((prevPast) =>
          [...prevPast, current].slice(-MAX_HISTORY_ENTRIES),
        );
        return next;
      });
      return prevFuture.slice(1);
    });
  }, []);

  return {
    state: present,
    commitState,
    resetHistory,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
