/**
 * useKeyboardShortcuts hook
 * 
 * Registers global keyboard shortcuts for desktop/laptop users.
 */

import { useEffect } from 'react';

interface ShortcutHandlers {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onPrint?: () => void;
  onExportPdf?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      // Don't intercept when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        if (e.key === 'Escape' && handlers.onEscape) {
          handlers.onEscape();
          return;
        }
        return;
      }

      if (isCtrl && e.key === 's') {
        e.preventDefault();
        handlers.onSave?.();
      } else if (isCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handlers.onUndo?.();
      } else if (isCtrl && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handlers.onRedo?.();
      } else if (isCtrl && (e.key === 'Z')) {
        e.preventDefault();
        handlers.onRedo?.();
      } else if (isCtrl && e.key === 'p') {
        e.preventDefault();
        handlers.onPrint?.();
      } else if (isCtrl && e.key === 'e') {
        e.preventDefault();
        handlers.onExportPdf?.();
      } else if (e.key === 'Escape') {
        handlers.onEscape?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
