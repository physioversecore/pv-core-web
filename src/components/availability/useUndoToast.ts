"use client";

import { useState, useCallback, useRef } from "react";

interface ToastState {
  message: string;
  show: boolean;
  undoable: boolean;
}

export function useUndoToast(onUndo?: () => void) {
  const [toast, setToast] = useState<ToastState>({ message: "", show: false, undoable: false });
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const showToast = useCallback((message: string, undoable = false) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, show: true, undoable });
    timerRef.current = setTimeout(() => setToast((p) => ({ ...p, show: false })), 4500);
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast((p) => ({ ...p, show: false }));
  }, []);

  const handleUndo = useCallback(() => {
    hideToast();
    onUndo?.();
  }, [hideToast, onUndo]);

  return { toast, showToast, hideToast, handleUndo };
}
