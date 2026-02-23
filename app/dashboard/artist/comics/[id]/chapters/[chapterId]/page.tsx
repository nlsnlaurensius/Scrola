import { notFound, redirect } from 'next/navigation';
import { Container, Typography, Box, Button, Paper, Breadcrumbs } from '@mui/material';
import { ArrowBack, Home, Dashboard, Book, Article } from '@mui/icons-material';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PageManagement from './PageManagement';

interface Props {
  params: Promise<{
    id: string;
    chapterId: string;
  }>;
}

async function getChapterWithPages(chapterId: string, userId: string) {
  const supabase = await createClient();

  const { data: chapter } = await supabase
    .from('chapters')
    .select(`
      *,
      comic:comic_id (
        id,
        title,
        artist_id,
        cover_url
      ),
      pages (*)
    `)
    .eq('id', chapterId)
    .single() as { data: any };

  if (!chapter) {
    return null;
  }

  // Check ownership
  const comic = chapter.comic as any;
  if (comic.artist_id !== userId) {
    return null;
  }

  return chapter;
}

async function getCurrentUser() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function ChapterPagesPage({ params }: Props) {
  // Await params (Next.js 15 requirement)
  const { id, chapterId } = await params;
  
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const chapter = await getChapterWithPages(chapterId, user.id);

  if (!chapter) {
    notFound();
  }

  const comic = chapter.comic as any;
  const pages = (chapter.pages as any[]) || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          href="/"
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
        >
          <Home sx={{ fontSize: 20 }} />
          <span>Home</span>
        </Link>
        <Link
          href="/dashboard/artist"
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
        >
          <Dashboard sx={{ fontSize: 20 }} />
          <span>Dashboard</span>
        </Link>
        <Link
          href={`/dashboard/artist/comics/${id}`}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
        >
          <Book sx={{ fontSize: 20 }} />
          <span>{comic.title}</span>
        </Link>
        <Typography color="text.primary" className="font-semibold flex items-center gap-1">
          <Article sx={{ fontSize: 20 }} />
          Chapter {chapter.chapter_number}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {comic.cover_url && (
            <Box
              component="img"
              src={comic.cover_url}
              alt={comic.title}
              sx={{
                width: 60,
                height: 60,
                objectFit: 'cover',
                borderRadius: 1,
              }}
            />
          )}
          <Box>
            <Typography variant="body2" color="text.secondary">
              {comic.title}
            </Typography>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Chapter {chapter.chapter_number}: {chapter.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage pages for this chapter
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Page Management */}
      <Paper sx={{ p: 3 }}>
        <PageManagement 
          chapterId={chapterId}
          comicId={id}
          initialPages={pages}
        />
      </Paper>
    </Container>
  );
}
