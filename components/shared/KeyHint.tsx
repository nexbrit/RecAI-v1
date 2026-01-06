'use client';

import { cn } from '@/lib/utils';

interface KeyHintProps {
  keys: string[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function KeyHint({ keys, size = 'sm', className }: KeyHintProps) {
  const sizeClasses = {
    sm: 'kbd-sm',
    md: 'kbd',
    lg: 'kbd-lg',
  };

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {keys.map((key, index) => (
        <span key={index}>
          <kbd className={cn("kbd", sizeClasses[size])}>
            {formatKey(key)}
          </kbd>
          {index < keys.length - 1 && keys.length > 1 && (
            <span className="text-text-muted mx-0.5">/</span>
          )}
        </span>
      ))}
    </span>
  );
}

function formatKey(key: string): string {
  const keyMap: Record<string, string> = {
    'Command': '⌘',
    'Cmd': '⌘',
    'Control': '⌃',
    'Ctrl': '⌃',
    'Alt': '⌥',
    'Option': '⌥',
    'Shift': '⇧',
    'Enter': '↵',
    'Return': '↵',
    'Backspace': '⌫',
    'Delete': '⌦',
    'Escape': 'Esc',
    'Space': '␣',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Tab': '⇥',
  };

  return keyMap[key] || key.toUpperCase();
}

// Single key display component
interface SingleKeyProps {
  children: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SingleKey({ children, size = 'sm', className }: SingleKeyProps) {
  const sizeClasses = {
    sm: 'kbd-sm',
    md: 'kbd',
    lg: 'kbd-lg',
  };

  return (
    <kbd className={cn("kbd", sizeClasses[size], className)}>
      {formatKey(children)}
    </kbd>
  );
}
