import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// ============================================
// SERVER COMPONENT: CHAPTER READER PAGE
// ============================================

interface ReaderPageProps {
  params: Promise<{
    id: string; // comic id
    chapterId: string;
  }>;
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  // Await params (Next.js 15 requirement)
  const { id, chapterId } = await params;
  
  const supabase = await createClient();

  // Fetch chapter with pages and comic info
  const { data: chapter, error: chapterError } = await supabase
    .from('chapters')
    .select(
      `
      *,
      comic:comics (
        id,
        title,
        artist_id
      ),
      pages (
        id,
        image_url,
        page_order
      )
    `
    )
    .eq('id', chapterId)
    .single() as { data: any; error: any };

  if (chapterError || !chapter) {
    notFound();
  }

  // Verify chapter belongs to this comic
  if (chapter.comic.id !== id) {
    notFound();
  }

  // Sort pages by page_order
  const sortedPages = chapter.pages?.sort((a: any, b: any) => a.page_order - b.page_order) || [];

  // Get all chapters for navigation
  const { data: allChapters } = await supabase
    .from('chapters')
    .select('id, chapter_number, title')
    .eq('comic_id', id)
    .order('chapter_number', { ascending: true }) as { data: any[] | null };

  // Find prev/next chapters
  const currentIndex = allChapters?.findIndex((c: any) => c.id === chapterId) ?? -1;
  const prevChapter: any = currentIndex > 0 ? allChapters?.[currentIndex - 1] : null;
  const nextChapter: any =
    currentIndex >= 0 && allChapters && currentIndex < allChapters.length - 1
      ? allChapters[currentIndex + 1]
      : null;

  // Increment view counts using RPC
  try {
    await supabase.rpc('increment_chapter_view', { chapter_uuid: chapterId } as any);
    await supabase.rpc('increment_comic_view', { comic_uuid: id } as any);
  } catch (error) {
    console.error('Failed to increment view counts:', error);
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black bg-opacity-90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/comics/${id}`}
              className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-sm font-medium">Back to Comic</span>
            </Link>

            <div className="text-center flex-1 px-4">
              <h1 className="text-white font-semibold text-lg truncate">
                {chapter.comic.title}
              </h1>
              <p className="text-gray-400 text-sm">
                Chapter {chapter.chapter_number}: {chapter.title}
              </p>
            </div>

            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Pages */}
      <main className="max-w-4xl mx-auto">
        {sortedPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <svg
              className="w-16 h-16 text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-white text-xl font-semibold mb-2">No pages available</h2>
            <p className="text-gray-400 text-sm mb-6">
              This chapter doesn't have any pages yet.
            </p>
            <Link
              href={`/comics/${id}`}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go Back
            </Link>
          </div>
        ) : (
          <div className="space-y-0">
            {sortedPages.map((page: any) => (
              <div key={page.id} className="w-full">
                <img
                  src={page.image_url}
                  alt={`Page ${page.page_order}`}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Navigation Footer */}
      {sortedPages.length > 0 && (
        <footer className="sticky bottom-0 bg-black bg-opacity-90 backdrop-blur-sm border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Previous Chapter */}
              {prevChapter ? (
                <Link
                  href={`/comics/${id}/chapters/${prevChapter.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <div className="text-left">
                    <p className="text-xs text-gray-400">Previous</p>
                    <p className="text-sm font-medium truncate max-w-[150px]">
                      Ch. {prevChapter.chapter_number}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="w-[150px]"></div>
              )}

              {/* Current Chapter Info */}
              <div className="text-center text-white">
                <p className="text-sm font-medium">
                  Chapter {chapter.chapter_number}
                </p>
                <p className="text-xs text-gray-400">
                  {sortedPages.length} {sortedPages.length === 1 ? 'page' : 'pages'}
                </p>
              </div>

              {/* Next Chapter */}
              {nextChapter ? (
                <Link
                  href={`/comics/${id}/chapters/${nextChapter.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <div className="text-right">
                    <p className="text-xs text-purple-200">Next</p>
                    <p className="text-sm font-medium truncate max-w-[150px]">
                      Ch. {nextChapter.chapter_number}
                    </p>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <Link
                  href={`/comics/${id}`}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                >
                  Back to Comic
                </Link>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
