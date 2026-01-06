'use client';

import { useState, useCallback } from 'react';
import { CommandBar } from './CommandBar';
import { MetricsRibbon, PipelineStage, defaultPipelineMetrics } from './MetricsRibbon';
import { ShortcutBar } from './ShortcutBar';
import { IconSidebar } from '@/components/shared/IconSidebar';
import { CommandPalette } from '@/components/shared/CommandPalette';

interface TerminalLayoutProps {
  children: React.ReactNode;
  user: {
    email: string;
    full_name?: string | null;
  } | null;
  showMetrics?: boolean;
  showShortcuts?: boolean;
  shortcutContext?: 'table' | 'preview' | 'default';
  pipelineMetrics?: typeof defaultPipelineMetrics;
  onStageClick?: (stage: PipelineStage) => void;
  activeStage?: PipelineStage | null;
}

export function TerminalLayout({
  children,
  user,
  showMetrics = true,
  showShortcuts = true,
  shortcutContext = 'default',
  pipelineMetrics = defaultPipelineMetrics,
  onStageClick,
  activeStage,
}: TerminalLayoutProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const handleCommandPaletteOpen = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-terminal-void overflow-hidden">
      {/* Command Bar - Top */}
      <CommandBar
        onCommandPaletteOpen={handleCommandPaletteOpen}
        onSearchClick={handleCommandPaletteOpen}
      />

      {/* Metrics Ribbon */}
      {showMetrics && (
        <MetricsRibbon
          metrics={pipelineMetrics}
          activeStage={activeStage}
          onStageClick={onStageClick}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Icon Sidebar */}
        <IconSidebar user={user} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto scrollbar-terminal bg-terminal-base">
          {children}
        </main>
      </div>

      {/* Shortcut Bar - Bottom */}
      {showShortcuts && <ShortcutBar context={shortcutContext} />}

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  );
}
