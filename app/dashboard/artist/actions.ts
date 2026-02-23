'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createComicSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional().nullable(),
  genre: z.array(z.string()).min(1, 'At least one genre is required').max(5, 'Maximum 5 genres'),
  status: z.enum(['ongoing', 'completed', 'hiatus']).default('ongoing'),
  coverFile: z.instanceof(File).optional().nullable(),
});

const updateComicSchema = z.object({
  id: z.string().uuid('Invalid comic ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().max(2000, 'Description too long').optional().nullable(),
  genre: z.array(z.string()).min(1, 'At least one genre is required').max(5, 'Maximum 5 genres').optional(),
  status: z.enum(['ongoing', 'completed', 'hiatus']).optional(),
  coverFile: z.instanceof(File).optional().nullable(),
});

// ============================================
// HELPER: UPLOAD COVER TO SUPABASE STORAGE
// ============================================

async function uploadCoverToStorage(file: File, comicId: string): Promise<string> {
  const supabase = await createClient();
  
  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop();
  const fileName = `${timestamp}-${randomString}.${extension}`;
  const filePath = `${comicId}/${fileName}`;

  // Upload to 'covers' bucket
  const { error: uploadError } = await supabase.storage
    .from('covers')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload cover: ${uploadError.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('covers').getPublicUrl(filePath);

  return publicUrl;
}

// ============================================
// CREATE COMIC ACTION
// ============================================

export async function createComicAction(formData: FormData) {
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
        error: 'Unauthorized. Please login.',
      };
    }

    // Verify user is artist or admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || (profile.role !== 'artist' && profile.role !== 'admin')) {
      return {
        success: false,
        error: 'Only artists can create comics.',
      };
    }

    // Parse and validate form data
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string | null,
      genre: JSON.parse(formData.get('genre') as string) as string[],
      status: (formData.get('status') as 'ongoing' | 'completed' | 'hiatus') || 'ongoing',
      coverFile: formData.get('coverFile') as File | null,
    };

    const validation = createComicSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    const validatedData = validation.data;

    // Insert comic into database (without cover_url first)
    const { data: comic, error: insertError } = await supabase
      .from('comics')
      .insert({
        artist_id: user.id,
        title: validatedData.title,
        description: validatedData.description || null,
        genre: validatedData.genre,
        status: validatedData.status,
        cover_url: null, // Will update after upload
      })
      .select()
      .single();

    if (insertError || !comic) {
      return {
        success: false,
        error: `Failed to create comic: ${insertError?.message || 'Unknown error'}`,
      };
    }

    // Upload cover if provided
    let coverUrl: string | null = null;
    if (validatedData.coverFile && validatedData.coverFile.size > 0) {
      try {
        coverUrl = await uploadCoverToStorage(validatedData.coverFile, comic.id);

        // Update comic with cover URL
        const { error: updateError } = await supabase
          .from('comics')
          .update({ cover_url: coverUrl })
          .eq('id', comic.id);

        if (updateError) {
          console.error('Failed to update cover URL:', updateError);
        }
      } catch (uploadError) {
        console.error('Cover upload error:', uploadError);
        // Don't fail the entire operation if cover upload fails
      }
    }

    // Revalidate the artist dashboard page
    revalidatePath('/dashboard/artist');

    return {
      success: true,
      data: { ...comic, cover_url: coverUrl },
    };
  } catch (error) {
    console.error('Create comic error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create comic',
    };
  }
}

// ============================================
// UPDATE COMIC ACTION
// ============================================

export async function updateComicAction(formData: FormData) {
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
        error: 'Unauthorized. Please login.',
      };
    }

    // Parse and validate form data
    const rawData = {
      id: formData.get('id') as string,
      title: formData.get('title') as string | undefined,
      description: formData.get('description') as string | null | undefined,
      genre: formData.get('genre') ? JSON.parse(formData.get('genre') as string) as string[] : undefined,
      status: formData.get('status') as 'ongoing' | 'completed' | 'hiatus' | undefined,
      coverFile: formData.get('coverFile') as File | null,
    };

    const validation = updateComicSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      };
    }

    const validatedData = validation.data;

    // Verify ownership
    const { data: existingComic, error: fetchError } = await supabase
      .from('comics')
      .select('artist_id')
      .eq('id', validatedData.id)
      .single();

    if (fetchError || !existingComic) {
      return {
        success: false,
        error: 'Comic not found',
      };
    }

    if (existingComic.artist_id !== user.id) {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        return {
          success: false,
          error: 'You do not have permission to edit this comic',
        };
      }
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.genre !== undefined) updateData.genre = validatedData.genre;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;

    // Upload new cover if provided
    if (validatedData.coverFile && validatedData.coverFile.size > 0) {
      try {
        const coverUrl = await uploadCoverToStorage(validatedData.coverFile, validatedData.id);
        updateData.cover_url = coverUrl;
      } catch (uploadError) {
        console.error('Cover upload error:', uploadError);
        return {
          success: false,
          error: 'Failed to upload cover image',
        };
      }
    }

    // Update comic in database
    const { data: updatedComic, error: updateError } = await supabase
      .from('comics')
      .update(updateData)
      .eq('id', validatedData.id)
      .select()
      .single();

    if (updateError || !updatedComic) {
      return {
        success: false,
        error: `Failed to update comic: ${updateError?.message || 'Unknown error'}`,
      };
    }

    // Revalidate the artist dashboard page
    revalidatePath('/dashboard/artist');

    return {
      success: true,
      data: updatedComic,
    };
  } catch (error) {
    console.error('Update comic error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update comic',
    };
  }
}

// ============================================
// DELETE COMIC ACTION
// ============================================

export async function deleteComicAction(comicId: string) {
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
        error: 'Unauthorized. Please login.',
      };
    }

    // Verify ownership
    const { data: existingComic, error: fetchError } = await supabase
      .from('comics')
      .select('artist_id, cover_url')
      .eq('id', comicId)
      .single();

    if (fetchError || !existingComic) {
      return {
        success: false,
        error: 'Comic not found',
      };
    }

    if (existingComic.artist_id !== user.id) {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        return {
          success: false,
          error: 'You do not have permission to delete this comic',
        };
      }
    }

    // Delete comic (CASCADE will delete chapters, pages, bookmarks)
    const { error: deleteError } = await supabase
      .from('comics')
      .delete()
      .eq('id', comicId);

    if (deleteError) {
      return {
        success: false,
        error: `Failed to delete comic: ${deleteError.message}`,
      };
    }

    // Delete cover from storage if exists
    if (existingComic.cover_url) {
      try {
        // Extract file path from URL
        const url = new URL(existingComic.cover_url);
        const pathParts = url.pathname.split('/covers/');
        if (pathParts.length > 1) {
          const filePath = pathParts[1];
          await supabase.storage.from('covers').remove([filePath]);
        }
      } catch (storageError) {
        console.error('Failed to delete cover from storage:', storageError);
        // Don't fail the entire operation
      }
    }

    // Revalidate the artist dashboard page
    revalidatePath('/dashboard/artist');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete comic error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete comic',
    };
  }
}
