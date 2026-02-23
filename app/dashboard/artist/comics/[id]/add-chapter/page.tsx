import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs, Typography } from '@mui/material';
import { Home, Dashboard, Book } from '@mui/icons-material';
import { AddChapterForm } from '@/components/dashboard/AddChapterForm';

// ============================================
// SERVER COMPONENT: ADD CHAPTER PAGE
// ============================================

interface AddChapterPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AddChapterPage({ params }: AddChapterPageProps) {
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

  // Fetch comic to verify ownership
  const { data: comic, error: comicError } = await supabase
    .from('comics')
    .select('id, title, artist_id')
    .eq('id', id)
    .single() as { data: any; error: any };

  if (comicError || !comic) {
    notFound();
  }

  // Check ownership (unless admin)
  if (profile.role !== 'admin' && comic.artist_id !== user.id) {
    redirect('/dashboard/artist');
  }

  // Get existing chapters to suggest next chapter number
  const { data: chapters } = await supabase
    .from('chapters')
    .select('chapter_number')
    .eq('comic_id', id)
    .order('chapter_number', { ascending: false })
    .limit(1) as { data: any[] | null };

  const nextChapterNumber = chapters && chapters.length > 0 ? chapters[0].chapter_number + 1 : 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <Link
            href={`/dashboard/artist/comics/${comic.id}`}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <Book sx={{ fontSize: 20 }} />
            {comic.title}
          </Link>
          <Typography color="text.primary" className="font-semibold">
            Add Chapter
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">Add New Chapter</h1>
          <p className="mt-2 text-gray-600">Create a new chapter for {comic.title}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <AddChapterForm comicId={comic.id} suggestedChapterNumber={nextChapterNumber} />
        </div>
      </div>
    </div>
  );
}
