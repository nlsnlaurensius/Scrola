'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

const createChapterSchema = z.object({
  comic_id: z.string().uuid(),
  chapter_number: z.number().int().positive(),
  title: z.string().min(1).max(200),
});

const updateChapterSchema = createChapterSchema.extend({
  id: z.string().uuid(),
});

// ============================================
// SERVER ACTIONS FOR CHAPTER MANAGEMENT
// ============================================

export async function createChapterAction(formData: FormData) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Parse and validate form data
  const rawData = {
    comic_id: formData.get('comic_id') as string,
    chapter_number: parseInt(formData.get('chapter_number') as string),
    title: formData.get('title') as string,
  };

  const validation = createChapterSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { comic_id, chapter_number, title } = validation.data;

  // Verify user owns the comic
  const { data: comic } = await supabase
    .from('comics')
    .select('artist_id')
    .eq('id', comic_id)
    .single();

  if (!comic || comic.artist_id !== user.id) {
    return { success: false, error: 'Not authorized to edit this comic' };
  }

  // Check if chapter_number already exists for this comic
  const { data: existingChapter } = await supabase
    .from('chapters')
    .select('id')
    .eq('comic_id', comic_id)
    .eq('chapter_number', chapter_number)
    .maybeSingle();

  if (existingChapter) {
    return {
      success: false,
      error: `Chapter ${chapter_number} already exists for this comic`,
    };
  }

  // Insert chapter
  const { error: insertError } = await supabase.from('chapters').insert({
    comic_id,
    chapter_number,
    title,
  });

  if (insertError) {
    console.error('Insert chapter error:', insertError);
    return { success: false, error: 'Failed to create chapter' };
  }

  revalidatePath(`/dashboard/artist/comics/${comic_id}`);
  return { success: true };
}

export async function updateChapterAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const rawData = {
    id: formData.get('id') as string,
    comic_id: formData.get('comic_id') as string,
    chapter_number: parseInt(formData.get('chapter_number') as string),
    title: formData.get('title') as string,
  };

  const validation = updateChapterSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { id, comic_id, chapter_number, title } = validation.data;

  // Verify ownership
  const { data: comic } = await supabase
    .from('comics')
    .select('artist_id')
    .eq('id', comic_id)
    .single();

  if (!comic || comic.artist_id !== user.id) {
    return { success: false, error: 'Not authorized' };
  }

  // Check for duplicate chapter_number (excluding current chapter)
  const { data: existingChapter } = await supabase
    .from('chapters')
    .select('id')
    .eq('comic_id', comic_id)
    .eq('chapter_number', chapter_number)
    .neq('id', id)
    .maybeSingle();

  if (existingChapter) {
    return {
      success: false,
      error: `Chapter ${chapter_number} already exists`,
    };
  }

  // Update chapter
  const { error: updateError } = await supabase
    .from('chapters')
    .update({ chapter_number, title })
    .eq('id', id);

  if (updateError) {
    console.error('Update chapter error:', updateError);
    return { success: false, error: 'Failed to update chapter' };
  }

  revalidatePath(`/dashboard/artist/comics/${comic_id}`);
  return { success: true };
}

export async function deleteChapterAction(chapterId: string, comicId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Verify ownership
  const { data: comic } = await supabase
    .from('comics')
    .select('artist_id')
    .eq('id', comicId)
    .single();

  if (!comic || comic.artist_id !== user.id) {
    return { success: false, error: 'Not authorized' };
  }

  // Get all pages for this chapter to delete from storage
  const { data: pages } = await supabase
    .from('pages')
    .select('image_url')
    .eq('chapter_id', chapterId);

  // Delete page images from storage
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

  // Delete chapter (CASCADE will delete pages)
  const { error } = await supabase.from('chapters').delete().eq('id', chapterId);

  if (error) {
    console.error('Delete chapter error:', error);
    return { success: false, error: 'Failed to delete chapter' };
  }

  revalidatePath(`/dashboard/artist/comics/${comicId}`);
  return { success: true };
}

// ============================================
// SERVER ACTION FOR PAGE UPLOAD
// ============================================

export async function uploadPagesAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const chapterId = formData.get('chapter_id') as string;
  const comicId = formData.get('comic_id') as string;
  const files = formData.getAll('pages') as File[];

  if (!chapterId || !files || files.length === 0) {
    return { success: false, error: 'Chapter ID and files are required' };
  }

  // Verify ownership
  const { data: comic } = await supabase
    .from('comics')
    .select('artist_id')
    .eq('id', comicId)
    .single();

  if (!comic || comic.artist_id !== user.id) {
    return { success: false, error: 'Not authorized' };
  }

  // Get current max page_order
  const { data: existingPages } = await supabase
    .from('pages')
    .select('page_order')
    .eq('chapter_id', chapterId)
    .order('page_order', { ascending: false })
    .limit(1);

  let currentOrder = existingPages && existingPages.length > 0 ? existingPages[0].page_order : 0;

  // Upload each file
  const uploadedPages = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;

    const fileExt = file.name.split('.').pop();
    const fileName = `${chapterId}/${Date.now()}-${currentOrder + 1}.${fileExt}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pages')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      continue; // Skip this file
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('pages').getPublicUrl(uploadData.path);

    currentOrder++;
    uploadedPages.push({
      chapter_id: chapterId,
      page_order: currentOrder,
      image_url: publicUrl,
    });
  }

  if (uploadedPages.length === 0) {
    return { success: false, error: 'No files were uploaded successfully' };
  }

  // Insert page records
  const { error: insertError } = await supabase.from('pages').insert(uploadedPages);

  if (insertError) {
    console.error('Insert pages error:', insertError);
    return { success: false, error: 'Failed to save page records' };
  }

  revalidatePath(`/dashboard/artist/comics/${comicId}/chapters/${chapterId}`);
  return { success: true, count: uploadedPages.length };
}

export async function deletePageAction(pageId: string, comicId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Verify ownership
  const { data: comic } = await supabase
    .from('comics')
    .select('artist_id')
    .eq('id', comicId)
    .single();

  if (!comic || comic.artist_id !== user.id) {
    return { success: false, error: 'Not authorized' };
  }

  // Get page to delete image from storage
  const { data: page } = await supabase
    .from('pages')
    .select('image_url, chapter_id')
    .eq('id', pageId)
    .single();

  if (page) {
    const url = page.image_url;
    const match = url.match(/pages\/(.+)$/);
    if (match) {
      await supabase.storage.from('pages').remove([match[1]]);
    }
  }

  // Delete page record
  const { error } = await supabase.from('pages').delete().eq('id', pageId);

  if (error) {
    console.error('Delete page error:', error);
    return { success: false, error: 'Failed to delete page' };
  }

  if (page) {
    revalidatePath(`/dashboard/artist/comics/${comicId}/chapters/${page.chapter_id}`);
  }

  return { success: true };
}
