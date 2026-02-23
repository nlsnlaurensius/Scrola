import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ComicTable } from '@/components/dashboard/ComicTable';
import { Comic } from '@/types/comic.types';

// ============================================
// SERVER COMPONENT: ARTIST DASHBOARD PAGE
// ============================================

export default async function ArtistDashboardPage() {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (authError || !user) {
    redirect('/login');
  }

  // Get user profile to verify role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, username, avatar_url')
    .eq('id', user.id)
    .single() as { data: any; error: any };

  // Redirect to home if not artist or admin
  if (profileError || !profile || (profile.role !== 'artist' && profile.role !== 'admin')) {
    redirect('/');
  }

  // Fetch comics owned by this artist
  const { data: comics, error: comicsError } = await supabase
    .from('comics')
    .select('*')
    .eq('artist_id', user.id)
    .order('created_at', { ascending: false });

  if (comicsError) {
    console.error('Failed to fetch comics:', comicsError);
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Artist Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Welcome back, {profile.username}! Manage your comics here.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                {profile.role === 'admin' ? 'Admin' : 'Artist'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-card-dark p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="shrink-0 bg-indigo-500 dark:bg-indigo-600 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Comics</dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{comics?.length || 0}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-card-dark p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="shrink-0 bg-green-500 dark:bg-green-600 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Views</dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {comics?.reduce((sum: number, comic: any) => sum + (comic.view_count || 0), 0).toLocaleString() || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-card-dark p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="shrink-0 bg-yellow-500 dark:bg-yellow-600 rounded-md p-3">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Ongoing Series</dt>
                  <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {comics?.filter((c: any) => c.status === 'ongoing').length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Comics Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-card-dark border border-gray-100 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Comics</h2>
          </div>
          <div className="p-6">
            <ComicTable comics={comics || []} artistId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
