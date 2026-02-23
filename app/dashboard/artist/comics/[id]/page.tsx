import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs, Typography } from '@mui/material';
import { Home, Dashboard } from '@mui/icons-material';
import { ChapterTable } from '@/components/dashboard/ChapterTable';

// ============================================
// SERVER COMPONENT: COMIC MANAGEMENT PAGE
// Shows chapters for a specific comic
// ============================================

interface ComicManagementPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ComicManagementPage({ params }: ComicManagementPageProps) {
  // Await params (Next.js 15 requirement)
  const { id } = await params;
  
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: any };

  if (!profile || !['artist', 'admin'].includes(profile.role)) {
    redirect('/');
  }

  // Fetch comic with chapters
  const { data: comic, error: comicError } = await supabase
    .from('comics')
    .select(
      `
      *,
      chapters (
        id,
        chapter_number,
        title,
        view_count,
        created_at
      )
    `
    )
    .eq('id', id)
    .single() as { data: any; error: any };

  if (comicError || !comic) {
    notFound();
  }

  // Check ownership (unless admin)
  if (profile.role !== 'admin' && comic.artist_id !== user.id) {
    redirect('/dashboard/artist');
  }

  // Sort chapters by chapter_number
  const sortedChapters = comic.chapters?.sort((a: any, b: any) => a.chapter_number - b.chapter_number) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link
            href="/"
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <Home sx={{ fontSize: 20 }} />
            Home
          </Link>
          <Link
            href="/dashboard/artist"
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <Dashboard sx={{ fontSize: 20 }} />
            Dashboard
          </Link>
          <Typography color="text.primary" className="font-semibold">
            {comic.title}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <div className="mb-8">

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{comic.title}</h1>
              <p className="mt-2 text-gray-600">{comic.description || 'No description'}</p>
              <div className="mt-4 flex gap-4 text-sm">
                <span className="text-gray-500">
                  Status: <span className="font-semibold capitalize">{comic.status}</span>
                </span>
                <span className="text-gray-500">
                  Total Chapters: <span className="font-semibold">{sortedChapters.length}</span>
                </span>
                <span className="text-gray-500">
                  Total Views: <span className="font-semibold">{comic.view_count.toLocaleString()}</span>
                </span>
              </div>
            </div>

            <Link
              href={`/dashboard/artist/comics/${comic.id}/add-chapter`}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Chapter
            </Link>
          </div>
        </div>

        {/* Chapters Table */}
        <div className="bg-white rounded-lg shadow">
          <ChapterTable chapters={sortedChapters} comicId={comic.id} />
        </div>
      </div>
    </div>
  );
}
