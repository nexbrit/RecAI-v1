'use client';

import { KeyHint } from '@/components/shared/KeyHint';

export interface Shortcut {
  keys: string[];
  label: string;
}

interface ShortcutBarProps {
  shortcuts?: Shortcut[];
  context?: 'table' | 'preview' | 'default';
}

const defaultShortcuts: Shortcut[] = [
  { keys: ['J', 'K'], label: 'Navigate' },
  { keys: ['Space'], label: 'Select' },
  { keys: ['E'], label: 'Evaluate' },
  { keys: ['V'], label: 'View' },
  { keys: ['?'], label: 'Help' },
];

const tableShortcuts: Shortcut[] = [
  { keys: ['J'], label: 'Down' },
  { keys: ['K'], label: 'Up' },
  { keys: ['Space'], label: 'Select' },
  { keys: ['Shift', 'A'], label: 'Select All' },
  { keys: ['E'], label: 'Evaluate' },
  { keys: ['V'], label: 'Preview' },
  { keys: ['M'], label: 'Move' },
  { keys: ['?'], label: 'Help' },
];

const previewShortcuts: Shortcut[] = [
  { keys: ['Esc'], label: 'Close' },
  { keys: ['J', 'K'], label: 'Prev/Next' },
  { keys: ['E'], label: 'Evaluate' },
  { keys: ['M'], label: 'Move Stage' },
  { keys: ['N'], label: 'Add Note' },
];

const contextShortcuts: Record<string, Shortcut[]> = {
  default: defaultShortcuts,
  table: tableShortcuts,
  preview: previewShortcuts,
};

export function ShortcutBar({ shortcuts, context = 'default' }: ShortcutBarProps) {
  const displayShortcuts = shortcuts || contextShortcuts[context];

  return (
    <footer className="shortcut-bar">
      {displayShortcuts.map((shortcut, index) => (
        <div key={index} className="shortcut-item">
          <KeyHint keys={shortcut.keys} />
          <span className="text-text-muted">{shortcut.label}</span>
        </div>
      ))}
    </footer>
  );
}
