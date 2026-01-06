'use client';

import { useState, useEffect } from 'react';
import { Search, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandBarProps {
  onSearchClick?: () => void;
  onCommandPaletteOpen?: () => void;
}

export function CommandBar({ onSearchClick, onCommandPaletteOpen }: CommandBarProps) {
  const [time, setTime] = useState<string>('');
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    // Detect OS
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

    // Update time
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="command-bar">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
          <span className="text-terminal-void font-mono font-bold text-sm">R</span>
        </div>
        <span className="font-mono font-semibold text-text-primary text-sm tracking-tight">
          RecAI
        </span>
      </div>

      {/* Search Trigger */}
      <button
        onClick={onSearchClick || onCommandPaletteOpen}
        className="command-bar-search flex-1 max-w-md"
      >
        <Search className="w-4 h-4 text-text-muted" />
        <span className="text-text-muted">Search candidates, positions...</span>
        <kbd className="kbd kbd-sm ml-auto">/</kbd>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Command Palette Trigger */}
      <button
        onClick={onCommandPaletteOpen}
        className={cn(
          "flex items-center gap-1.5 px-2 h-7 rounded",
          "bg-terminal-raised border border-border-subtle",
          "text-text-secondary text-xs",
          "hover:bg-terminal-hover hover:border-border-default",
          "transition-all duration-100"
        )}
      >
        <Command className="w-3.5 h-3.5" />
        <span className="font-mono">{isMac ? 'K' : 'Ctrl+K'}</span>
      </button>

      {/* Clock */}
      <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border-subtle">
        <span className="font-mono text-sm text-text-secondary tabular-nums">
          {time}
        </span>
      </div>
    </header>
  );
}
