'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  FileText,
  Users,
  Search,
  Plus,
  Briefcase,
  Zap,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <Command.Input
            placeholder="Type a command or search..."
            className="flex h-11 w-full rounded-md bg-transparent py-3 px-4 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-b"
          />
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Actions">
              <Command.Item
                onSelect={() => runCommand(() => router.push('/positions/new'))}
                className="flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Plus className="h-4 w-4" />
                <span>Create Position</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘P
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/evaluate'))}
                className="flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Search className="h-4 w-4" />
                <span>Evaluate CVs</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘E
                </kbd>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-border my-2" />

            <Command.Group heading="Navigation">
              <Command.Item
                onSelect={() => runCommand(() => router.push('/'))}
                className="flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/positions'))}
                className="flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <FileText className="h-4 w-4" />
                <span>Positions</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/candidates'))}
                className="flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Users className="h-4 w-4" />
                <span>Candidates</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-border my-2" />

            <Command.Group heading="AI Tools">
              <Command.Item
                onSelect={() => runCommand(() => router.push('/tools/jd-decoder'))}
                className="flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Zap className="h-4 w-4" />
                <span>JD Decoder</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/tools/cv-updater'))}
                className="flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Zap className="h-4 w-4" />
                <span>CV Updater</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/tools/boolean-generator'))}
                className="flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Zap className="h-4 w-4" />
                <span>Boolean Search Generator</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/tools/skill-mapper'))}
                className="flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Zap className="h-4 w-4" />
                <span>Skill Mapper</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-border my-2" />

            <Command.Group heading="Settings">
              <Command.Item
                onSelect={() => runCommand(() => router.push('/settings/team'))}
                className="flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Settings className="h-4 w-4" />
                <span>Team Settings</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push('/settings/skills'))}
                className="flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
              >
                <Briefcase className="h-4 w-4" />
                <span>Skills Taxonomy</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
