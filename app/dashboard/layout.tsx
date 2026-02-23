import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username, avatar_url')
    .eq('id', user.id)
    .single() as { data: any };

  // Redirect if not artist or admin
  if (!profile || (profile.role !== 'artist' && profile.role !== 'admin')) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
