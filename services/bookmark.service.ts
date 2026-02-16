import { createClient } from '@/lib/supabase/client';
import { Bookmark, BookmarkInsert } from '@/types/comic.types';
import { ComicWithArtist } from '@/types/comic.types';

export class BookmarkService {
  private supabase = createClient();

  async getBookmarks(userId: string) {
    const { data, error } = await this.supabase
      .from('bookmarks')
      .select(
        `
        *,
        comics (
          *,
          profiles:artist_id (
            username,
            avatar_url
          )
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((bookmark) => ({
      ...bookmark,
      comics: bookmark.comics as unknown as ComicWithArtist,
    }));
  }

  async isBookmarked(userId: string, comicId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('comic_id', comicId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  async addBookmark(bookmark: BookmarkInsert) {
    const { data, error } = await this.supabase
      .from('bookmarks')
      .insert(bookmark)
      .select()
      .single();

    if (error) throw error;
    return data as Bookmark;
  }

  async removeBookmark(userId: string, comicId: string) {
    const { error } = await this.supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('comic_id', comicId);

    if (error) throw error;
  }

  async toggleBookmark(userId: string, comicId: string) {
    const isBookmarked = await this.isBookmarked(userId, comicId);

    if (isBookmarked) {
      await this.removeBookmark(userId, comicId);
      return false;
    } else {
      await this.addBookmark({ user_id: userId, comic_id: comicId });
      return true;
    }
  }

  async getBookmarkCount(comicId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('comic_id', comicId);

    if (error) throw error;
    return count || 0;
  }
}

export const bookmarkService = new BookmarkService();
