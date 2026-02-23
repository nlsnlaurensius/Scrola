'use client';

import { useState, useTransition } from 'react';
import { toggleBookmarkAction } from '@/app/comics/actions';
import { useRouter } from 'next/navigation';

// ============================================
// CLIENT COMPONENT: BOOKMARK BUTTON
// ============================================

interface BookmarkButtonProps {
  comicId: string;
  initialIsBookmarked?: boolean;
  initialBookmarkCount?: number;
}

export function BookmarkButton({
  comicId,
  initialIsBookmarked = false,
  initialBookmarkCount = 0,
}: BookmarkButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    // Optimistic update
    const previousBookmarked = isBookmarked;
    const previousCount = bookmarkCount;
    
    setIsBookmarked(!isBookmarked);
    setBookmarkCount((prev) => (isBookmarked ? prev - 1 : prev + 1));
    setError(null);

    const result = await toggleBookmarkAction(comicId);

    if (!result.success) {
      // Revert on error
      setIsBookmarked(previousBookmarked);
      setBookmarkCount(previousCount);
      setError(result.error || 'Failed to update bookmark');
      return;
    }

    // Update with actual result
    setIsBookmarked(result.isBookmarked);

    // Refresh the page data
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`
          px-6 py-3 rounded-lg font-semibold transition-all duration-200
          flex items-center justify-center gap-2
          ${
            isBookmarked
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50'
          }
          ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isPending ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill={isBookmarked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </>
        )}
      </button>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
