'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ============================================
// BOOKMARK ACTIONS
// ============================================

export async function toggleBookmarkAction(comicId: string) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to bookmark comics',
        isBookmarked: false,
      };
    }

    // Check if bookmark already exists
    const { data: existingBookmark, error: checkError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('comic_id', comicId)
      .maybeSingle() as { data: any; error: any };

    if (checkError) {
      console.error('Error checking bookmark:', checkError);
      return {
        success: false,
        error: 'Failed to check bookmark status',
        isBookmarked: false,
      };
    }

    if (existingBookmark) {
      // Remove bookmark
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id);

      if (deleteError) {
        return {
          success: false,
          error: `Failed to remove bookmark: ${deleteError.message}`,
          isBookmarked: true,
        };
      }

      revalidatePath(`/comics/${comicId}`);
      return {
        success: true,
        isBookmarked: false,
        message: 'Bookmark removed',
      };
    } else {
      // Add bookmark
      const { error: insertError } = await supabase.from('bookmarks').insert({
        user_id: user.id,
        comic_id: comicId,
      } as any);

      if (insertError) {
        return {
          success: false,
          error: `Failed to add bookmark: ${insertError.message}`,
          isBookmarked: false,
        };
      }

      revalidatePath(`/comics/${comicId}`);
      return {
        success: true,
        isBookmarked: true,
        message: 'Bookmark added',
      };
    }
  } catch (error) {
    console.error('Bookmark action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle bookmark',
      isBookmarked: false,
    };
  }
}

// Get bookmark status for a comic
export async function getBookmarkStatus(comicId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { isBookmarked: false, bookmarkCount: 0 };
    }

    // Check if user has bookmarked this comic
    const { data: bookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('comic_id', comicId)
      .maybeSingle();

    // Get total bookmark count for this comic
    const { count } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('comic_id', comicId);

    return {
      isBookmarked: !!bookmark,
      bookmarkCount: count || 0,
    };
  } catch (error) {
    console.error('Get bookmark status error:', error);
    return { isBookmarked: false, bookmarkCount: 0 };
  }
}
