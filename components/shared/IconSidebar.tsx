'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { KeyHint } from './KeyHint';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string[];
}

const mainNav: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutGrid,
    shortcut: ['G', 'D'],
  },
  {
    title: 'Positions',
    href: '/positions',
    icon: FileText,
    shortcut: ['G', 'P'],
  },
  {
    title: 'Candidates',
    href: '/candidates',
    icon: Users,
    shortcut: ['G', 'C'],
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    shortcut: ['G', 'A'],
  },
];

const toolsNav: NavItem[] = [
  {
    title: 'AI Tools',
    href: '/tools/jd-decoder',
    icon: Sparkles,
    shortcut: ['G', 'T'],
  },
];

const bottomNav: NavItem[] = [
  {
    title: 'Settings',
    href: '/settings/team',
    icon: Settings,
    shortcut: ['G', 'S'],
  },
  {
    title: 'Help',
    href: '/help',
    icon: HelpCircle,
    shortcut: ['?'],
  },
];

interface IconSidebarProps {
  user: {
    email: string;
    full_name?: string | null;
  } | null;
}

export function IconSidebar({ user }: IconSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={100}>
      <aside className="w-sidebar-collapsed flex flex-col bg-terminal-base border-r border-border-subtle">
        {/* Main Navigation */}
        <nav className="flex-1 flex flex-col items-center py-3 gap-1">
          {mainNav.map((item) => (
            <NavIconButton
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
            />
          ))}

          <div className="w-6 h-px bg-border-subtle my-2" />

          {toolsNav.map((item) => (
            <NavIconButton
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
            />
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="flex flex-col items-center py-3 gap-1 border-t border-border-subtle">
          {bottomNav.map((item) => (
            <NavIconButton
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
            />
          ))}

          <div className="w-6 h-px bg-border-subtle my-2" />

          {/* User Avatar & Logout */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className="sidebar-icon group"
              >
                <div className="w-7 h-7 rounded-full bg-terminal-hover flex items-center justify-center text-text-secondary text-xs font-medium group-hover:bg-accent group-hover:text-terminal-void transition-colors">
                  {user?.full_name?.[0] || user?.email?.[0] || 'U'}
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="tooltip-terminal">
              <div className="flex flex-col gap-1">
                <span className="text-text-primary font-medium">
                  {user?.full_name || 'User'}
                </span>
                <span className="text-text-muted text-2xs">{user?.email}</span>
                <span className="text-text-muted text-2xs mt-1">Click to sign out</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}

interface NavIconButtonProps {
  item: NavItem;
  isActive: boolean;
}

function NavIconButton({ item, isActive }: NavIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          className={cn("sidebar-icon", isActive && "active")}
        >
          <item.icon className="w-5 h-5" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="tooltip-terminal">
        <div className="flex items-center gap-3">
          <span>{item.title}</span>
          {item.shortcut && <KeyHint keys={item.shortcut} size="sm" />}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
