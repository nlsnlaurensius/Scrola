import { createClient } from '@/lib/supabase/client';
import {
  Chapter,
  ChapterInsert,
  ChapterUpdate,
  ChapterWithPages,
  Page,
  PageInsert,
} from '@/types/comic.types';

export class ChapterService {
  private supabase = createClient();

  async getChapters(comicId: string) {
    const { data, error } = await this.supabase
      .from('chapters')
      .select('*')
      .eq('comic_id', comicId)
      .order('chapter_number', { ascending: true });

    if (error) throw error;
    return data as Chapter[];
  }

  async getChapter(id: string) {
    const { data, error } = await this.supabase
      .from('chapters')
      .select(
        `
        *,
        pages (
          id,
          image_url,
          page_order
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ChapterWithPages;
  }

  async createChapter(chapter: ChapterInsert) {
    const { data, error } = await this.supabase
      .from('chapters')
      .insert(chapter as any)
      .select()
      .single();

    if (error) throw error;
    return data as Chapter;
  }

  async updateChapter(id: string, updates: ChapterUpdate) {
    const { data, error } = await this.supabase
      .from('chapters')
      // @ts-ignore - Supabase type inference issue
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Chapter;
  }

  async deleteChapter(id: string) {
    const { error } = await this.supabase
      .from('chapters')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async incrementView(chapterId: string) {
    const { error } = await this.supabase.rpc('increment_chapter_view', {
      chapter_uuid: chapterId,
    } as any);

    if (error) throw error;
  }

  // Pages methods
  async getPages(chapterId: string) {
    const { data, error } = await this.supabase
      .from('pages')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('page_order', { ascending: true });

    if (error) throw error;
    return data as Page[];
  }

  async createPage(page: PageInsert) {
    const { data, error } = await this.supabase
      .from('pages')
      .insert(page as any)
      .select()
      .single();

    if (error) throw error;
    return data as Page;
  }

  async createPages(pages: PageInsert[]) {
    const { data, error } = await this.supabase
      .from('pages')
      .insert(pages as any)
      .select();

    if (error) throw error;
    return data as Page[];
  }

  async updatePageOrder(pageId: string, newOrder: number) {
    const { data, error } = await this.supabase
      .from('pages')
      // @ts-ignore - Supabase type inference issue
      .update({ page_order: newOrder } as any)
      .eq('id', pageId)
      .select()
      .single();

    if (error) throw error;
    return data as Page;
  }

  async deletePage(id: string) {
    const { error } = await this.supabase.from('pages').delete().eq('id', id);

    if (error) throw error;
  }

  async getNextChapter(comicId: string, currentChapterNumber: number) {
    const { data, error } = await this.supabase
      .from('chapters')
      .select('*')
      .eq('comic_id', comicId)
      .gt('chapter_number', currentChapterNumber)
      .order('chapter_number', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Chapter | null;
  }

  async getPreviousChapter(comicId: string, currentChapterNumber: number) {
    const { data, error } = await this.supabase
      .from('chapters')
      .select('*')
      .eq('comic_id', comicId)
      .lt('chapter_number', currentChapterNumber)
      .order('chapter_number', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Chapter | null;
  }
}

export const chapterService = new ChapterService();
