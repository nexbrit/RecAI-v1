import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TerminalLayout } from '@/components/terminal/TerminalLayout';
import { ToasterProvider } from '@/components/shared/ToasterProvider';

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
    <>
      <TerminalLayout
        user={{
          email: user.email || '',
          full_name: profile?.full_name,
        }}
        showMetrics={true}
        showShortcuts={true}
      >
        {children}
      </TerminalLayout>
      <ToasterProvider />
    </>
  );
}
