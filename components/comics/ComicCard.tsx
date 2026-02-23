'use client';

import { Comic, ComicWithArtist } from '@/types/comic.types';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, BookOpen, User } from 'lucide-react';
import { BookmarkButton } from './BookmarkButton';
import Image from 'next/image';

interface ComicCardProps {
  comic: ComicWithArtist | Comic;
}

export function ComicCard({ comic }: ComicCardProps) {
  const isComicWithArtist = (c: Comic | ComicWithArtist): c is ComicWithArtist => {
    return 'profiles' in c;
  };

  const artistName = isComicWithArtist(comic) ? comic.profiles.username : 'Unknown Artist';

  // Status badge color mapping
  const statusColors = {
    ongoing: 'bg-green-500 dark:bg-green-400',
    completed: 'bg-blue-500 dark:bg-blue-400',
    hiatus: 'bg-yellow-500 dark:bg-yellow-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <Link href={`/comics/${comic.id}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-surface dark:bg-surface-dark shadow-card dark:shadow-card-dark transition-all duration-300 group-hover:shadow-card-hover dark:group-hover:shadow-card-dark-hover">
          {/* Cover Image */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
            {comic.cover_url ? (
              <Image
                src={comic.cover_url}
                alt={comic.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-600" />
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold text-white shadow-lg ${
                  statusColors[comic.status]
                }`}
              >
                {comic.status.charAt(0).toUpperCase() + comic.status.slice(1)}
              </span>
            </div>

            {/* Bookmark Button */}
            <div className="absolute top-3 right-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <BookmarkButton comicId={comic.id} />
            </div>

            {/* Hover Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
              className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              {/* Genres */}
              {comic.genre && comic.genre.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {comic.genre.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-medium backdrop-blur-sm"
                    >
                      {genre}
                    </span>
                  ))}
                  {comic.genre.length > 3 && (
                    <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
                      +{comic.genre.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{formatViews(comic.view_count)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[100px]">{artistName}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Card Content */}
          <div className="p-4">
            <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
              {comic.title}
            </h3>
            {comic.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {comic.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Skeleton loading component
export function ComicCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative overflow-hidden rounded-2xl bg-surface dark:bg-surface-dark shadow-card">
        {/* Image skeleton */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{
            backgroundSize: '1000px 100%',
          }} />
        </div>

        {/* Content skeleton */}
        <div className="p-4">
          <div className="mb-2 h-5 w-3/4 rounded bg-gray-300 dark:bg-gray-700" />
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-1 h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

// Helper function to format view counts
function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}
