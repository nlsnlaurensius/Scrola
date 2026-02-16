'use client';

import { useState, useCallback } from 'react';
import { bookmarkService } from '@/services/bookmark.service';
import { useAuth } from './useAuth';

export function useBookmarks() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const toggleBookmark = useCallback(
    async (comicId: string) => {
      if (!user) throw new Error('User must be logged in');

      try {
        setLoading(true);
        const isBookmarked = await bookmarkService.toggleBookmark(
          user.id,
          comicId
        );
        return isBookmarked;
      } catch (error) {
        console.error('Error toggling bookmark:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const isBookmarked = useCallback(
    async (comicId: string) => {
      if (!user) return false;

      try {
        return await bookmarkService.isBookmarked(user.id, comicId);
      } catch (error) {
        console.error('Error checking bookmark:', error);
        return false;
      }
    },
    [user]
  );

  return {
    toggleBookmark,
    isBookmarked,
    loading,
  };
}
