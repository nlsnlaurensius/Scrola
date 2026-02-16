'use client';

import { useState, useEffect } from 'react';
import { comicService } from '@/services/comic.service';
import { ComicWithArtist } from '@/types/comic.types';

interface UseComicsOptions {
  limit?: number;
  offset?: number;
  genre?: string;
  status?: 'ongoing' | 'completed' | 'hiatus';
  artistId?: string;
  search?: string;
  autoFetch?: boolean;
}

export function useComics(options: UseComicsOptions = {}) {
  const [comics, setComics] = useState<ComicWithArtist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState(0);

  const { autoFetch = true, ...fetchOptions } = options;

  const fetchComics = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await comicService.getComics(fetchOptions);
      setComics(result.data);
      setCount(result.count || 0);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchComics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetchOptions.limit,
    fetchOptions.offset,
    fetchOptions.genre,
    fetchOptions.status,
    fetchOptions.artistId,
    fetchOptions.search,
    autoFetch,
  ]);

  return {
    comics,
    loading,
    error,
    count,
    refetch: fetchComics,
  };
}
