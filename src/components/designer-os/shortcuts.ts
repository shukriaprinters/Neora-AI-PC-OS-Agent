import { useEffect, useRef } from "react";

export interface ShortcutBindings {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onSelectAll?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(bindings: ShortcutBindings) {
  const bindingsRef = useRef<ShortcutBindings>(bindings);

  useEffect(() => {
    bindingsRef.current = bindings;
  }, [bindings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input, textarea or contenteditable element
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === "INPUT" ||
        activeEl.tagName === "TEXTAREA" ||
        activeEl.hasAttribute("contenteditable")
      );

      // Escape is allowed even when typing to unfocus
      if (e.key === "Escape") {
        if (bindingsRef.current.onEscape) {
          bindingsRef.current.onEscape();
          return;
        }
      }

      if (isTyping) return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Ctrl + S (Save Layout)
      if (isCtrlOrCmd && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (bindingsRef.current.onSave) bindingsRef.current.onSave();
      }

      // Ctrl + Z (Undo)
      if (isCtrlOrCmd && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (bindingsRef.current.onUndo) bindingsRef.current.onUndo();
      }

      // Ctrl + Shift + Z or Ctrl + Y (Redo)
      if (isCtrlOrCmd && ((e.shiftKey && e.key.toLowerCase() === "z") || e.key.toLowerCase() === "y")) {
        e.preventDefault();
        if (bindingsRef.current.onRedo) bindingsRef.current.onRedo();
      }

      // Ctrl + C (Copy)
      if (isCtrlOrCmd && e.key.toLowerCase() === "c") {
        e.preventDefault();
        if (bindingsRef.current.onCopy) bindingsRef.current.onCopy();
      }

      // Ctrl + V (Paste)
      if (isCtrlOrCmd && e.key.toLowerCase() === "v") {
        e.preventDefault();
        if (bindingsRef.current.onPaste) bindingsRef.current.onPaste();
      }

      // Ctrl + A (Select All)
      if (isCtrlOrCmd && e.key.toLowerCase() === "a") {
        e.preventDefault();
        if (bindingsRef.current.onSelectAll) bindingsRef.current.onSelectAll();
      }

      // Delete or Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        if (bindingsRef.current.onDelete) bindingsRef.current.onDelete();
      }

      // Plus key with Ctrl for Zoom In
      if (isCtrlOrCmd && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        if (bindingsRef.current.onZoomIn) bindingsRef.current.onZoomIn();
      }

      // Minus key with Ctrl for Zoom Out
      if (isCtrlOrCmd && e.key === "-") {
        e.preventDefault();
        if (bindingsRef.current.onZoomOut) bindingsRef.current.onZoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
