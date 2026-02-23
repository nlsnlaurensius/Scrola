'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

const updateUserRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['admin', 'artist', 'reader']),
});

const deleteUserSchema = z.object({
  user_id: z.string().uuid(),
});

// ============================================
// SERVER ACTIONS FOR USER MANAGEMENT
// ============================================

/**
 * Update user role
 * Admin can change any user's role
 */
export async function updateUserRoleAction(formData: FormData) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check if current user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null };

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Not authorized. Admin access required.' };
  }

  // Parse and validate
  const rawData = {
    user_id: formData.get('user_id') as string,
    role: formData.get('role') as string,
  };

  const validation = updateUserRoleSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { user_id, role } = validation.data;

  // Prevent admin from changing their own role (self-demotion protection)
  if (user_id === user.id) {
    return {
      success: false,
      error: 'You cannot change your own role for security reasons',
    };
  }

  // Update user role
  const updateData = { role, updated_at: new Date().toISOString() };
  const { error: updateError } = await (supabase
    .from('profiles') as any)
    .update(updateData)
    .eq('id', user_id);

  if (updateError) {
    console.error('Update user role error:', updateError);
    return { success: false, error: 'Failed to update user role' };
  }

  revalidatePath('/dashboard/admin/users');
  revalidatePath('/dashboard/admin');
  return { success: true };
}

/**
 * Delete user account
 * Admin can delete any user except themselves
 * CASCADE delete will handle related data (comics, chapters, bookmarks, etc.)
 */
export async function deleteUserAccountAction(formData: FormData) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check if current user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>();

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Not authorized. Admin access required.' };
  }

  // Parse and validate
  const rawData = {
    user_id: formData.get('user_id') as string,
  };

  const validation = deleteUserSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { user_id } = validation.data;

  // Prevent admin from deleting themselves (self-deletion protection)
  if (user_id === user.id) {
    return {
      success: false,
      error: 'You cannot delete your own account. Please ask another admin.',
    };
  }

  // Get user avatar to delete from storage
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('avatar_url, username')
    .eq('id', user_id)
    .single<{ avatar_url: string | null; username: string }>();

  if (!userProfile) {
    return { success: false, error: 'User not found' };
  }

  // Delete avatar from storage if exists
  if (userProfile.avatar_url) {
    const url = userProfile.avatar_url;
    const match = url.match(/avatars\/(.+)$/);
    if (match) {
      await supabase.storage.from('avatars').remove([match[1]]);
    }
  }

  // If user is an artist, clean up their comics and related storage
  const { data: userComics } = await supabase
    .from('comics')
    .select('id, cover_url')
    .eq('artist_id', user_id) as { data: Array<{ id: string; cover_url: string | null }> | null };

  if (userComics && userComics.length > 0) {
    for (const comic of userComics) {
      // Delete cover image
      if (comic.cover_url) {
        const url = comic.cover_url;
        const match = url.match(/covers\/(.+)$/);
        if (match) {
          await supabase.storage.from('covers').remove([match[1]]);
        }
      }

      // Get all chapters
      const { data: chapters } = await supabase
        .from('chapters')
        .select('id')
        .eq('comic_id', comic.id) as { data: Array<{ id: string }> | null };

      if (chapters) {
        for (const chapter of chapters) {
          // Delete all pages
          const { data: pages } = await supabase
            .from('pages')
            .select('image_url')
            .eq('chapter_id', chapter.id) as { data: Array<{ image_url: string }> | null };

          if (pages && pages.length > 0) {
            const filePaths = pages
              .map((page) => {
                const url = page.image_url;
                const match = url.match(/pages\/(.+)$/);
                return match ? match[1] : null;
              })
              .filter(Boolean) as string[];

            if (filePaths.length > 0) {
              await supabase.storage.from('pages').remove(filePaths);
            }
          }
        }
      }
    }
  }

  // Delete user from profiles table
  // CASCADE will handle: comics, chapters, pages, bookmarks
  // Then delete from auth.users
  const { error: deleteProfileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user_id);

  if (deleteProfileError) {
    console.error('Delete user profile error:', deleteProfileError);
    return { success: false, error: 'Failed to delete user account' };
  }

  revalidatePath('/dashboard/admin/users');
  revalidatePath('/dashboard/admin');
  return { success: true, message: `User @${userProfile.username} has been deleted successfully` };
}
