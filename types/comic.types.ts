import { Database } from './database.types';

export type Comic = Database['public']['Tables']['comics']['Row'];
export type ComicInsert = Database['public']['Tables']['comics']['Insert'];
export type ComicUpdate = Database['public']['Tables']['comics']['Update'];

export type Chapter = Database['public']['Tables']['chapters']['Row'];
export type ChapterInsert = Database['public']['Tables']['chapters']['Insert'];
export type ChapterUpdate = Database['public']['Tables']['chapters']['Update'];

export type Page = Database['public']['Tables']['pages']['Row'];
export type PageInsert = Database['public']['Tables']['pages']['Insert'];
export type PageUpdate = Database['public']['Tables']['pages']['Update'];

export type Bookmark = Database['public']['Tables']['bookmarks']['Row'];
export type BookmarkInsert = Database['public']['Tables']['bookmarks']['Insert'];

export type ComicStatus = 'ongoing' | 'completed' | 'hiatus';

export interface ComicWithArtist extends Comic {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export interface ChapterWithPages extends Chapter {
  pages: Page[];
}

export interface ComicWithChapters extends Comic {
  chapters: Chapter[];
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}
