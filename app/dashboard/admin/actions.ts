'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

const updateComicStatusSchema = z.object({
  comic_id: z.string().uuid(),
  status: z.enum(['ongoing', 'completed', 'hiatus']),
});

// ============================================
// SERVER ACTIONS FOR ADMIN
// ============================================

export async function updateComicStatusAction(formData: FormData) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Not authorized. Admin access required.' };
  }

  // Parse and validate
  const rawData = {
    comic_id: formData.get('comic_id') as string,
    status: formData.get('status') as string,
  };

  const validation = updateComicStatusSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { comic_id, status } = validation.data;

  // Update comic status
  const { error: updateError } = await supabase
    .from('comics')
    .update({ status })
    .eq('id', comic_id);

  if (updateError) {
    console.error('Update comic status error:', updateError);
    return { success: false, error: 'Failed to update comic status' };
  }

  revalidatePath('/dashboard/admin/comics');
  revalidatePath('/dashboard/admin');
  return { success: true };
}

export async function deleteComicAdminAction(comicId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Not authorized' };
  }

  // Get comic to delete cover
  const { data: comic } = await supabase
    .from('comics')
    .select('cover_url')
    .eq('id', comicId)
    .single();

  if (comic?.cover_url) {
    const url = comic.cover_url;
    const match = url.match(/covers\/(.+)$/);
    if (match) {
      await supabase.storage.from('covers').remove([match[1]]);
    }
  }

  // Get all chapters and their pages
  const { data: chapters } = await supabase
    .from('chapters')
    .select('id')
    .eq('comic_id', comicId);

  if (chapters) {
    for (const chapter of chapters) {
      const { data: pages } = await supabase
        .from('pages')
        .select('image_url')
        .eq('chapter_id', chapter.id);

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

  // Delete comic (CASCADE will handle chapters, pages, bookmarks)
  const { error } = await supabase.from('comics').delete().eq('id', comicId);

  if (error) {
    console.error('Delete comic error:', error);
    return { success: false, error: 'Failed to delete comic' };
  }

  revalidatePath('/dashboard/admin/comics');
  revalidatePath('/dashboard/admin');
  return { success: true };
}
