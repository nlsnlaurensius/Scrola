import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminDashboardTabs } from './AdminDashboardTabs';

// ============================================
// SERVER COMPONENT: ADMIN DASHBOARD
// Shows all comics and users for moderation
// ============================================

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null };

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  // Fetch all comics with artist info
  const { data: comics } = await supabase
    .from('comics')
    .select(
      `
      *,
      profiles:artist_id (
        username,
        avatar_url
      )
    `
    );
  const allComics = comics || [];

  // Fetch all users
  interface UserProfile {
    id: string;
    username: string;
    full_name: string | null;
    role: 'admin' | 'artist' | 'reader';
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    updated_at: string;
  }

  const { data: users } = await supabase
    .from('profiles')
    .select('id, username, full_name, role, avatar_url, bio, created_at, updated_at')
    .order('created_at', { ascending: false }) as { data: UserProfile[] | null };
  const allUsers = users || [];

  // Calculate comics stats
  const totalComics = allComics.length;
  const ongoingComics = allComics.filter((c: any) => c.status === 'ongoing').length;
  const completedComics = allComics.filter((c: any) => c.status === 'completed').length;
  const hiatusComics = allComics.filter((c: any) => c.status === 'hiatus').length;
  const totalViews = allComics.reduce((sum: number, c: any) => sum + c.view_count, 0);

  // Calculate user stats
  const totalUsers = allUsers.length;
  const admins = allUsers.filter((u) => u.role === 'admin').length;
  const artists = allUsers.filter((u) => u.role === 'artist').length;
  const readers = allUsers.filter((u) => u.role === 'reader').length;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentUsers = allUsers.filter((u) => new Date(u.created_at) > sevenDaysAgo).length;

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Manage comics and users across the platform</p>
        </div>

        {/* Stats Cards - Comics */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comics Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-card-dark p-6 border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Comics</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalComics}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-card-dark p-6 border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ongoing</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{ongoingComics}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-card-dark p-6 border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{completedComics}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-card-dark p-6 border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On Hiatus</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{hiatusComics}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-card-dark p-6 border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards - Users */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-card-dark p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalUsers}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-card-dark p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admins</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{admins}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-card-dark p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Artists</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{artists}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-card-dark p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Readers</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{readers}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-card-dark p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New (7 days)</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{recentUsers}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Comics and Users Management */}
        <AdminDashboardTabs comics={allComics} users={allUsers} currentUserId={user.id} />
      </div>
    </div>
  );
}
