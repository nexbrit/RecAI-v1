'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  LayoutDashboard,
  FileText,
  Users,
  Search,
  Wrench,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  },
  {
    title: 'JD Formatter',
    href: '/tools/jd-formatter',
  },
  {
    title: 'CV Updater',
    href: '/tools/cv-updater',
  },
  {
    title: 'Boolean Generator',
    href: '/tools/boolean-generator',
  },
  {
    title: 'Skill Mapper',
    href: '/tools/skill-mapper',
  },
];

const settingsNav = [
  {
    title: 'Skills Taxonomy',
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b">
        <Briefcase className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">IntelStack RecAI</span>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4" />

        {/* Tools */}
        <div className="px-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-muted-foreground hover:text-accent-foreground"
              >
                <span className="flex items-center gap-3">
                  <Wrench className="h-4 w-4" />
                  Tools
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {tools.map((tool) => (
                <DropdownMenuItem key={tool.href} asChild>
                  <Link href={tool.href}>{tool.title}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="px-3 mt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-muted-foreground hover:text-accent-foreground"
              >
                <span className="flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  Settings
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {settingsNav.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>{item.title}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* User Section */}
      <div className="border-t p-4">
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
      </div>
    </div>
  );
}
