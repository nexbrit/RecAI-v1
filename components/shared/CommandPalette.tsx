'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  FileText,
  Users,
  Search,
  Plus,
  Zap,
  Settings,
  LayoutGrid,
  BarChart3,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { KeyHint } from './KeyHint';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string[];
  action: () => void;
  keywords?: string[];
  group: string;
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
      // Forward slash when not in input
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as Element).tagName)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    setSearch('');
    command();
  }, [setOpen]);

  const commands: CommandItem[] = useMemo(() => [
    // Quick Actions
    {
      id: 'new-position',
      title: 'Create New Position',
      subtitle: 'Add a new job position',
      icon: Plus,
      shortcut: ['Cmd', 'N'],
      action: () => router.push('/positions/new'),
      keywords: ['create', 'add', 'new', 'job', 'position'],
      group: 'Actions',
    },
    {
      id: 'evaluate-cvs',
      title: 'Evaluate CVs',
      subtitle: 'Run AI evaluation on candidates',
      icon: Search,
      shortcut: ['Cmd', 'E'],
      action: () => router.push('/evaluate'),
      keywords: ['evaluate', 'assess', 'score', 'cv', 'resume'],
      group: 'Actions',
    },
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      icon: LayoutGrid,
      shortcut: ['G', 'D'],
      action: () => router.push('/'),
      keywords: ['dashboard', 'home', 'overview'],
      group: 'Navigation',
    },
    {
      id: 'nav-positions',
      title: 'Go to Positions',
      icon: FileText,
      shortcut: ['G', 'P'],
      action: () => router.push('/positions'),
      keywords: ['positions', 'jobs', 'openings'],
      group: 'Navigation',
    },
    {
      id: 'nav-candidates',
      title: 'Go to Candidates',
      icon: Users,
      shortcut: ['G', 'C'],
      action: () => router.push('/candidates'),
      keywords: ['candidates', 'people', 'applicants'],
      group: 'Navigation',
    },
    {
      id: 'nav-analytics',
      title: 'Go to Analytics',
      icon: BarChart3,
      shortcut: ['G', 'A'],
      action: () => router.push('/analytics'),
      keywords: ['analytics', 'reports', 'metrics', 'stats'],
      group: 'Navigation',
    },
    // AI Tools
    {
      id: 'tool-jd-decoder',
      title: 'JD Decoder',
      subtitle: 'Extract requirements from job descriptions',
      icon: Sparkles,
      action: () => router.push('/tools/jd-decoder'),
      keywords: ['jd', 'decoder', 'job description', 'extract'],
      group: 'AI Tools',
    },
    {
      id: 'tool-cv-updater',
      title: 'CV Updater',
      subtitle: 'Update and optimize CVs',
      icon: Sparkles,
      action: () => router.push('/tools/cv-updater'),
      keywords: ['cv', 'resume', 'update', 'optimize'],
      group: 'AI Tools',
    },
    {
      id: 'tool-boolean',
      title: 'Boolean Search Generator',
      subtitle: 'Generate search strings for sourcing',
      icon: Sparkles,
      action: () => router.push('/tools/boolean-generator'),
      keywords: ['boolean', 'search', 'linkedin', 'sourcing'],
      group: 'AI Tools',
    },
    {
      id: 'tool-skill-mapper',
      title: 'Skill Mapper',
      subtitle: 'Map and normalize skills',
      icon: Sparkles,
      action: () => router.push('/tools/skill-mapper'),
      keywords: ['skill', 'mapper', 'normalize', 'taxonomy'],
      group: 'AI Tools',
    },
    // Settings
    {
      id: 'settings-team',
      title: 'Team Settings',
      icon: Settings,
      shortcut: ['G', 'S'],
      action: () => router.push('/settings/team'),
      keywords: ['settings', 'team', 'members', 'users'],
      group: 'Settings',
    },
    {
      id: 'settings-skills',
      title: 'Skills Taxonomy',
      icon: Settings,
      action: () => router.push('/settings/skills'),
      keywords: ['skills', 'taxonomy', 'categories'],
      group: 'Settings',
    },
  ], [router]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    commands.forEach((cmd) => {
      if (!groups[cmd.group]) {
        groups[cmd.group] = [];
      }
      groups[cmd.group].push(cmd);
    });
    return groups;
  }, [commands]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 command-palette max-w-lg">
        <Command
          className="[&_[cmdk-group-heading]]:command-palette-group-heading"
          filter={(value, search) => {
            const item = commands.find((c) => c.id === value);
            if (!item) return 0;

            const searchLower = search.toLowerCase();
            const titleMatch = item.title.toLowerCase().includes(searchLower);
            const subtitleMatch = item.subtitle?.toLowerCase().includes(searchLower);
            const keywordMatch = item.keywords?.some((k) => k.includes(searchLower));

            if (titleMatch) return 1;
            if (subtitleMatch) return 0.8;
            if (keywordMatch) return 0.6;
            return 0;
          }}
        >
          <div className="flex items-center border-b border-border-default px-4">
            <Search className="w-4 h-4 text-text-muted mr-3" />
            <Command.Input
              placeholder="Type a command or search..."
              className="command-palette-input border-0 px-0"
              value={search}
              onValueChange={setSearch}
            />
            <KeyHint keys={['Esc']} size="sm" />
          </div>

          <Command.List className="command-palette-list">
            <Command.Empty className="py-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <Search className="w-8 h-8 text-text-muted" />
                <p className="text-sm text-text-secondary">No results found</p>
                <p className="text-xs text-text-muted">Try a different search term</p>
              </div>
            </Command.Empty>

            {Object.entries(groupedCommands).map(([group, items]) => (
              <Command.Group key={group} heading={group}>
                {items.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={item.id}
                    onSelect={() => runCommand(item.action)}
                    className="command-palette-item group"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded flex items-center justify-center",
                      "bg-terminal-hover group-aria-selected:bg-accent-ghost",
                      "transition-colors duration-50"
                    )}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-xs text-text-muted truncate">{item.subtitle}</p>
                      )}
                    </div>
                    {item.shortcut && (
                      <KeyHint keys={item.shortcut} size="sm" />
                    )}
                    <ArrowRight className={cn(
                      "w-4 h-4 text-text-muted",
                      "opacity-0 group-aria-selected:opacity-100",
                      "transition-opacity duration-50"
                    )} />
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border-subtle bg-terminal-base text-xs text-text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <KeyHint keys={['Up', 'Down']} size="sm" />
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <KeyHint keys={['Enter']} size="sm" />
                <span>Select</span>
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <KeyHint keys={['Esc']} size="sm" />
              <span>Close</span>
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
