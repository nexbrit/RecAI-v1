'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  LayoutDashboard,
  FileText,
  Users,
  Search,
  Sparkles,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const mainNav = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Positions',
    href: '/positions',
    icon: FileText,
  },
  {
    title: 'Candidates',
    href: '/candidates',
    icon: Users,
  },
  {
    title: 'Evaluate',
    href: '/evaluate',
    icon: Search,
  },
];

const tools = [
  {
    title: 'JD Decoder',
    href: '/tools/jd-decoder',
    icon: Sparkles,
  },
  {
    title: 'CV Updater',
    href: '/tools/cv-updater',
    icon: Sparkles,
  },
  {
    title: 'Boolean Search',
    href: '/tools/boolean-generator',
    icon: Sparkles,
  },
];

const settingsNav = [
  {
    title: 'Skills',
    href: '/settings/skills',
  },
  {
    title: 'Team',
    href: '/settings/team',
  },
];

interface SidebarProps {
  user: {
    email: string;
    full_name?: string | null;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) setCollapsed(JSON.parse(saved));
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className={cn(
      "flex h-screen flex-col border-r bg-card transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">IntelStack</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <nav className="space-y-1 px-2">
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative group',
                  'before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-r',
                  'before:bg-primary before:scale-y-0 before:transition-transform',
                  isActive && 'bg-primary/10 text-primary before:scale-y-100',
                  !isActive && 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={cn("h-5 w-5", collapsed && "mx-auto")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4 mx-3" />

        {/* AI Tools - Direct Access */}
        <div className="px-2">
          {!collapsed && (
            <h4 className="px-3 mb-2 text-xs font-semibold text-muted-foreground">
              AI TOOLS
            </h4>
          )}
          <nav className="space-y-1">
            {tools.map((tool) => {
              const isActive = pathname === tool.href;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  title={collapsed ? tool.title : undefined}
                >
                  <tool.icon className={cn("h-4 w-4 text-primary", collapsed && "mx-auto")} />
                  {!collapsed && <span>{tool.title}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <Separator className="my-4 mx-3" />

        {/* Settings */}
        <div className="px-2">
          {!collapsed && (
            <h4 className="px-3 mb-2 text-xs font-semibold text-muted-foreground">
              SETTINGS
            </h4>
          )}
          <nav className="space-y-1">
            {settingsNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Settings className={cn("h-4 w-4", collapsed && "mx-auto")} />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Section */}
      <div className="border-t p-4">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              {user?.full_name?.[0] || user?.email?.[0] || 'U'}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sign out"
              className="h-8 w-8"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
