'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

type KeyCombo = string | string[];
type ShortcutCallback = () => void;

interface ShortcutDefinition {
  keys: KeyCombo;
  callback: ShortcutCallback;
  description?: string;
  preventDefault?: boolean;
  enabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: ShortcutDefinition[];
  enabled?: boolean;
}

// Helper to normalize key representation
function normalizeKey(key: string): string {
  const keyMap: Record<string, string> = {
    'meta': 'cmd',
    'control': 'ctrl',
    'cmd': 'cmd',
    'ctrl': 'ctrl',
    'alt': 'alt',
    'shift': 'shift',
    'escape': 'esc',
    'arrowup': 'up',
    'arrowdown': 'down',
    'arrowleft': 'left',
    'arrowright': 'right',
    ' ': 'space',
  };

  const normalized = key.toLowerCase();
  return keyMap[normalized] || normalized;
}

// Parse a key combo string into an array
function parseKeyCombo(combo: KeyCombo): string[] {
  if (Array.isArray(combo)) {
    return combo.map(normalizeKey);
  }
  return combo.toLowerCase().split('+').map((k) => k.trim()).map(normalizeKey);
}

// Check if an event matches a key combo
function matchesCombo(e: KeyboardEvent, combo: string[]): boolean {
  const pressedKeys = new Set<string>();

  if (e.metaKey) pressedKeys.add('cmd');
  if (e.ctrlKey) pressedKeys.add('ctrl');
  if (e.altKey) pressedKeys.add('alt');
  if (e.shiftKey) pressedKeys.add('shift');
  pressedKeys.add(normalizeKey(e.key));

  if (pressedKeys.size !== combo.length) return false;

  return combo.every((key) => pressedKeys.has(key));
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions): void {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as Element).tagName)) {
        // Allow some shortcuts even in inputs (like Cmd+K)
        const allowInInput = ['cmd+k', 'ctrl+k', 'esc'];
        const currentCombo = [];
        if (e.metaKey) currentCombo.push('cmd');
        if (e.ctrlKey) currentCombo.push('ctrl');
        currentCombo.push(normalizeKey(e.key));
        const comboStr = currentCombo.join('+');

        if (!allowInInput.includes(comboStr)) {
          return;
        }
      }

      for (const shortcut of shortcutsRef.current) {
        if (shortcut.enabled === false) continue;

        const combo = parseKeyCombo(shortcut.keys);
        if (matchesCombo(e, combo)) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.callback();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}

// Pre-built hook for common navigation shortcuts
export function useNavigationShortcuts(): void {
  const router = useRouter();

  const shortcuts: ShortcutDefinition[] = [
    {
      keys: ['g', 'd'],
      callback: () => router.push('/'),
      description: 'Go to Dashboard',
    },
    {
      keys: ['g', 'p'],
      callback: () => router.push('/positions'),
      description: 'Go to Positions',
    },
    {
      keys: ['g', 'c'],
      callback: () => router.push('/candidates'),
      description: 'Go to Candidates',
    },
    {
      keys: ['g', 'a'],
      callback: () => router.push('/analytics'),
      description: 'Go to Analytics',
    },
    {
      keys: ['g', 's'],
      callback: () => router.push('/settings/team'),
      description: 'Go to Settings',
    },
    {
      keys: ['g', 't'],
      callback: () => router.push('/tools/jd-decoder'),
      description: 'Go to AI Tools',
    },
  ];

  // Handle G+key sequences
  useEffect(() => {
    let gPressed = false;
    let gTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as Element).tagName)) {
        return;
      }

      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey) {
        gPressed = true;
        gTimeout = setTimeout(() => {
          gPressed = false;
        }, 500);
        return;
      }

      if (gPressed) {
        const secondKey = e.key.toLowerCase();
        const shortcut = shortcuts.find((s) => {
          const keys = parseKeyCombo(s.keys);
          return keys[0] === 'g' && keys[1] === secondKey;
        });

        if (shortcut) {
          e.preventDefault();
          shortcut.callback();
        }

        gPressed = false;
        clearTimeout(gTimeout);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(gTimeout);
    };
  }, [router]);
}

// Hook for help dialog
export function useHelpShortcut(onOpen: () => void): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as Element).tagName)) {
        return;
      }

      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        onOpen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpen]);
}

// All keyboard shortcuts definition for documentation
export const keyboardShortcutsMap = {
  global: [
    { keys: ['Cmd', 'K'], description: 'Open command palette' },
    { keys: ['/'], description: 'Focus search' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
  ],
  navigation: [
    { keys: ['G', 'D'], description: 'Go to Dashboard' },
    { keys: ['G', 'P'], description: 'Go to Positions' },
    { keys: ['G', 'C'], description: 'Go to Candidates' },
    { keys: ['G', 'A'], description: 'Go to Analytics' },
    { keys: ['G', 'S'], description: 'Go to Settings' },
    { keys: ['G', 'T'], description: 'Go to AI Tools' },
  ],
  table: [
    { keys: ['J'], description: 'Move down' },
    { keys: ['K'], description: 'Move up' },
    { keys: ['Space'], description: 'Select/deselect item' },
    { keys: ['V'], description: 'View details' },
    { keys: ['E'], description: 'Run evaluation' },
    { keys: ['M'], description: 'Move to stage' },
    { keys: ['Shift', 'A'], description: 'Select all' },
    { keys: ['Esc'], description: 'Clear selection' },
  ],
  preview: [
    { keys: ['Esc'], description: 'Close preview' },
    { keys: ['J', 'K'], description: 'Navigate items' },
    { keys: ['E'], description: 'Evaluate candidate' },
    { keys: ['M'], description: 'Move to stage' },
    { keys: ['N'], description: 'Add note' },
  ],
};
