'use client';

import { Comic, ComicWithArtist } from '@/types/comic.types';
import { ComicCard, ComicCardSkeleton } from './ComicCard';
import { motion } from 'framer-motion';

interface ComicGridProps {
  comics: (Comic | ComicWithArtist)[];
  isLoading?: boolean;
}

export function ComicGrid({ comics, isLoading = false }: ComicGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <ComicCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!comics || comics.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
          <svg
            className="h-16 w-16 text-gray-400 dark:text-gray-600"
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
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Comics Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          We couldn't find any comics matching your criteria. Try adjusting your filters or check back later.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {comics.map((comic, index) => (
        <motion.div
          key={comic.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <ComicCard comic={comic} />
        </motion.div>
      ))}
    </div>
  );
}

// Alternative: List view for table/list layout
export function ComicList({ comics, isLoading = false }: ComicGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex gap-4 rounded-xl bg-surface dark:bg-surface-dark p-4 shadow-card">
              <div className="h-32 w-24 flex-shrink-0 rounded-lg bg-gray-300 dark:bg-gray-700" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-3/4 rounded bg-gray-300 dark:bg-gray-700" />
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!comics || comics.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Comics Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your filters or check back later.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {comics.map((comic, index) => {
        const isComicWithArtist = (c: Comic | ComicWithArtist): c is ComicWithArtist => {
          return 'profiles' in c;
        };
        const artistName = isComicWithArtist(comic) ? comic.profiles.username : 'Unknown';

        return (
          <motion.div
            key={comic.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <a
              href={`/comics/${comic.id}`}
              className="flex gap-4 rounded-xl bg-surface dark:bg-surface-dark p-4 shadow-card hover:shadow-card-hover dark:shadow-card-dark dark:hover:shadow-card-dark-hover transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                {comic.cover_url ? (
                  <img
                    src={comic.cover_url}
                    alt={comic.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                  {comic.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {comic.description || 'No description available'}
                </p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {comic.status}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    by {artistName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    • {comic.view_count} views
                  </span>
                </div>
              </div>
            </a>
          </motion.div>
        );
      })}
    </div>
  );
}
