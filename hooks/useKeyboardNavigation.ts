'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseKeyboardNavigationOptions {
  itemCount: number;
  onSelect?: (index: number) => void;
  onView?: (index: number) => void;
  onEscape?: () => void;
  enabled?: boolean;
  loop?: boolean;
}

interface UseKeyboardNavigationReturn {
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

export function useKeyboardNavigation({
  itemCount,
  onSelect,
  onView,
  onEscape,
  enabled = true,
  loop = false,
}: UseKeyboardNavigationOptions): UseKeyboardNavigationReturn {
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Reset focused index when item count changes
  useEffect(() => {
    if (focusedIndex >= itemCount) {
      setFocusedIndex(Math.max(0, itemCount - 1));
    }
  }, [itemCount, focusedIndex]);

  const navigateUp = useCallback(() => {
    setFocusedIndex((prev) => {
      if (prev <= 0) {
        return loop ? itemCount - 1 : 0;
      }
      return prev - 1;
    });
  }, [itemCount, loop]);

  const navigateDown = useCallback(() => {
    setFocusedIndex((prev) => {
      if (prev >= itemCount - 1) {
        return loop ? 0 : itemCount - 1;
      }
      return prev + 1;
    });
  }, [itemCount, loop]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!enabled) return;

    switch (e.key) {
      case 'j':
      case 'ArrowDown':
        e.preventDefault();
        navigateDown();
        break;
      case 'k':
      case 'ArrowUp':
        e.preventDefault();
        navigateUp();
        break;
      case ' ':
        e.preventDefault();
        onSelect?.(focusedIndex);
        break;
      case 'Enter':
      case 'v':
        e.preventDefault();
        onView?.(focusedIndex);
        break;
      case 'Escape':
        e.preventDefault();
        onEscape?.();
        break;
    }
  }, [enabled, focusedIndex, navigateDown, navigateUp, onSelect, onView, onEscape]);

  // Global keyboard event listener
  useEffect(() => {
    if (!enabled) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as Element).tagName)) {
        return;
      }

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault();
          navigateDown();
          break;
        case 'k':
        case 'ArrowUp':
          e.preventDefault();
          navigateUp();
          break;
        case ' ':
          e.preventDefault();
          onSelect?.(focusedIndex);
          break;
        case 'v':
          e.preventDefault();
          onView?.(focusedIndex);
          break;
        case 'Escape':
          e.preventDefault();
          onEscape?.();
          break;
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [enabled, focusedIndex, navigateDown, navigateUp, onSelect, onView, onEscape]);

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  };
}
