export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          role: 'admin' | 'artist' | 'reader';
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          role?: 'admin' | 'artist' | 'reader';
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          role?: 'admin' | 'artist' | 'reader';
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      comics: {
        Row: {
          id: string;
          artist_id: string;
          title: string;
          description: string | null;
          genre: string[];
          cover_url: string | null;
          status: 'ongoing' | 'completed' | 'hiatus';
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          artist_id: string;
          title: string;
          description?: string | null;
          genre?: string[];
          cover_url?: string | null;
          status?: 'ongoing' | 'completed' | 'hiatus';
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          artist_id?: string;
          title?: string;
          description?: string | null;
          genre?: string[];
          cover_url?: string | null;
          status?: 'ongoing' | 'completed' | 'hiatus';
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comics_artist_id_fkey';
            columns: ['artist_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      chapters: {
        Row: {
          id: string;
          comic_id: string;
          chapter_number: number;
          title: string;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          comic_id: string;
          chapter_number: number;
          title: string;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          comic_id?: string;
          chapter_number?: number;
          title?: string;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chapters_comic_id_fkey';
            columns: ['comic_id'];
            referencedRelation: 'comics';
            referencedColumns: ['id'];
          }
        ];
      };
      pages: {
        Row: {
          id: string;
          chapter_id: string;
          image_url: string;
          page_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          image_url: string;
          page_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          image_url?: string;
          page_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'pages_chapter_id_fkey';
            columns: ['chapter_id'];
            referencedRelation: 'chapters';
            referencedColumns: ['id'];
          }
        ];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          comic_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          comic_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          comic_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookmarks_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookmarks_comic_id_fkey';
            columns: ['comic_id'];
            referencedRelation: 'comics';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_comic_view: {
        Args: {
          comic_uuid: string;
        };
        Returns: void;
      };
      increment_chapter_view: {
        Args: {
          chapter_uuid: string;
        };
        Returns: void;
      };
      get_user_role: {
        Args: {
          user_uuid: string;
        };
        Returns: string;
      };
      has_role: {
        Args: {
          user_uuid: string;
          required_role: string;
        };
        Returns: boolean;
      };
      has_any_role: {
        Args: {
          user_uuid: string;
          required_roles: string[];
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
