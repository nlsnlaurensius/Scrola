import { createClient } from '@/lib/supabase/client';
import {
  Comic,
  ComicInsert,
  ComicUpdate,
  ComicWithArtist,
  ComicWithChapters,
} from '@/types/comic.types';

export class ComicService {
  private supabase = createClient();

  async getComics(options?: {
    limit?: number;
    offset?: number;
    genre?: string;
    status?: 'ongoing' | 'completed' | 'hiatus';
    artistId?: string;
    search?: string;
  }) {
    let query = this.supabase
      .from('comics')
      .select(
        `
        *,
        profiles:artist_id (
          username,
          avatar_url
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    if (options?.genre) {
      query = query.contains('genre', [options.genre]);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.artistId) {
      query = query.eq('artist_id', options.artistId);
    }

    if (options?.search) {
      query = query.or(
        `title.ilike.%${options.search}%,description.ilike.%${options.search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data as ComicWithArtist[], count };
  }

  async getComic(id: string) {
    const { data, error } = await this.supabase
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
      .single();

    if (error) throw error;
    return data as ComicWithChapters;
  }

  async createComic(comic: ComicInsert) {
    const { data, error } = await this.supabase
      .from('comics')
      .insert(comic)
      .select()
      .single();

    if (error) throw error;
    return data as Comic;
  }

  async updateComic(id: string, updates: ComicUpdate) {
    const { data, error } = await this.supabase
      .from('comics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Comic;
  }

  async deleteComic(id: string) {
    const { error } = await this.supabase.from('comics').delete().eq('id', id);

    if (error) throw error;
  }

  async incrementView(comicId: string) {
    const { error } = await this.supabase.rpc('increment_comic_view', {
      comic_uuid: comicId,
    });

    if (error) throw error;
  }

  async getPopularComics(limit = 10) {
    const { data, error } = await this.supabase
      .from('comics')
      .select(
        `
        *,
        profiles:artist_id (
          username,
          avatar_url
        )
      `
      )
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ComicWithArtist[];
  }

  async getLatestComics(limit = 10) {
    const { data, error } = await this.supabase
      .from('comics')
      .select(
        `
        *,
        profiles:artist_id (
          username,
          avatar_url
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ComicWithArtist[];
  }

  async getComicsByGenre(genre: string, limit = 10) {
    const { data, error } = await this.supabase
      .from('comics')
      .select(
        `
        *,
        profiles:artist_id (
          username,
          avatar_url
        )
      `
      )
      .contains('genre', [genre])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ComicWithArtist[];
  }
}

export const comicService = new ComicService();
