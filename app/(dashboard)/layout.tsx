import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/shared/Sidebar';
import { ToasterProvider } from '@/components/shared/ToasterProvider';
import { CommandPalette } from '@/components/shared/CommandPalette';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        user={{
          email: user.email || '',
          full_name: profile?.full_name,
        }}
      />
      <main className="flex-1 overflow-y-auto bg-muted/30 scrollbar-thin">
        <div className="container py-6">{children}</div>
      </main>
      <CommandPalette />
      <ToasterProvider />
    </div>
  );
}
