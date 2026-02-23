import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { BookmarkButton } from '@/components/comics/BookmarkButton';
import { getBookmarkStatus } from '@/app/comics/actions';
import Link from 'next/link';
import { format } from 'date-fns';

// ============================================
// SERVER COMPONENT: COMIC DETAIL PAGE
// ============================================

interface ComicDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ComicDetailPage({ params }: ComicDetailPageProps) {
  // Await params (Next.js 15 requirement)
  const { id } = await params;
  
  const supabase = await createClient();

  // Fetch comic with chapters and artist info
  const { data: comic, error: comicError } = await supabase
    .from('comics')
    .select(
      `
      *,
      profiles:artist_id (
        username,
        avatar_url
      ),
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

  // Sort chapters by chapter_number
  const sortedChapters = comic.chapters?.sort((a: any, b: any) => a.chapter_number - b.chapter_number) || [];

  // Get bookmark status
  const { isBookmarked, bookmarkCount } = await getBookmarkStatus(id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cover Image */}
            <div className="md:col-span-1">
              <div className="aspect-2/3 w-full max-w-sm mx-auto bg-gray-800 dark:bg-gray-950 rounded-lg overflow-hidden shadow-2xl">
                {comic.cover_url ? (
                  <img
                    src={comic.cover_url}
                    alt={comic.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-24 h-24"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Comic Info */}
            <div className="md:col-span-2 space-y-4">
              <h1 className="text-4xl font-bold">{comic.title}</h1>

              {/* Author Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                  {comic.profiles?.avatar_url ? (
                    <img
                      src={comic.profiles.avatar_url}
                      alt={comic.profiles.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-700 dark:bg-purple-600">
                      <span className="text-white font-semibold">
                        {comic.profiles?.username?.[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm opacity-80">Author</p>
                  <p className="font-semibold">{comic.profiles?.username || 'Unknown'}</p>
                </div>
              </div>

              {/* Genre Tags */}
              <div className="flex flex-wrap gap-2">
                {comic.genre.map((g: string) => (
                  <span
                    key={g}
                    className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium backdrop-blur-sm"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-sm opacity-80">Status</p>
                  <p className="font-semibold capitalize">{comic.status}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Views</p>
                  <p className="font-semibold">{comic.view_count.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Chapters</p>
                  <p className="font-semibold">{sortedChapters.length}</p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Bookmarks</p>
                  <p className="font-semibold">{bookmarkCount}</p>
                </div>
              </div>

              {/* Description */}
              {comic.description && (
                <div>
                  <p className="text-sm opacity-80 mb-2">Description</p>
                  <p className="text-base leading-relaxed">{comic.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <BookmarkButton
                  comicId={comic.id}
                  initialIsBookmarked={isBookmarked}
                  initialBookmarkCount={bookmarkCount}
                />
                {sortedChapters.length > 0 && (
                  <Link
                    href={`/comics/${comic.id}/chapters/${sortedChapters[0].id}`}
                    className="px-6 py-3 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  
                    Start Reading
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Chapters</h2>

        {sortedChapters.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
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
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No chapters yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This comic doesn't have any chapters yet.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedChapters.map((chapter: any) => (
              <Link
                key={chapter.id}
                href={`/comics/${comic.id}/chapters/${chapter.id}`}
                className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        Chapter {chapter.chapter_number}
                      </span>
                      <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">{chapter.title}</h3>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{format(new Date(chapter.created_at), 'MMM dd, yyyy')}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {chapter.view_count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
