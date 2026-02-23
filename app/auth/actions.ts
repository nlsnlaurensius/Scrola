'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Helper to create Supabase server client
async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// ============================================
// REGISTER ACTION (for useFormState)
// ============================================
export async function registerAction(
  prevState: { error: string | null; success: boolean } | null,
  formData: FormData
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;
  const fullName = formData.get('fullName') as string;

  // Validation
  if (!email || !password || !username) {
    return { error: 'Email, password, and username are required', success: false };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters', success: false };
  }

  const supabase = await createClient();

  // Check if username already exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle();

  if (existingUser) {
    return { error: 'Username already taken', success: false };
  }

  // Create auth user with metadata (will be captured by database trigger)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName || null,
      },
    },
  });

  if (authError) {
    return { error: authError.message, success: false };
  }

  if (!authData.user) {
    return { error: 'Failed to create user', success: false };
  }

  // Profile will be created automatically by database trigger
  // Wait a bit to ensure trigger has executed
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Verify profile was created
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { 
      error: 'Profile creation failed. Please ensure the database trigger is set up correctly in Supabase. Run the updated schema.sql file.',
      success: false
    };
  }

  return { error: null, success: true };
}

// ============================================
// LOGIN ACTION (for useFormState)
// ============================================
export async function loginAction(
  prevState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = formData.get('redirect') as string | null;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Redirect after successful login
  redirect(redirectTo || '/');
}

// ============================================
// LOGOUT ACTION
// ============================================
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

// ============================================
// UPDATE PROFILE ACTION
// ============================================
export async function updateProfileAction(formData: FormData) {
  const userId = formData.get('userId') as string;
  const fullName = formData.get('fullName') as string;
  const bio = formData.get('bio') as string;
  const avatarUrl = formData.get('avatarUrl') as string;
  const avatarFile = formData.get('avatar') as File | null;

  if (!userId) {
    return { error: 'User ID is required' };
  }

  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return { error: 'Unauthorized' };
  }

  // Update profile
  const updates: any = { updated_at: new Date().toISOString() };
  if (fullName) updates.full_name = fullName;
  if (bio) updates.bio = bio;
  if (avatarUrl) updates.avatar_url = avatarUrl;

  // Handle avatar upload if file is provided
  if (avatarFile && avatarFile.size > 0) {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = avatarFile.name.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${extension}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        return { error: `Upload failed: ${uploadError.message}` };
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update avatar_url in profile
      updates.avatar_url = publicUrl;
    } catch (err) {
      return { error: 'Failed to upload avatar' };
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  // Revalidate profile page to show updated avatar
  revalidatePath('/profile');

  return { success: true };
}

// ============================================
// TOGGLE BOOKMARK ACTION
// ============================================
export async function toggleBookmarkAction(comicId: string) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to bookmark comics' };
  }

  // Check if bookmark exists
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('comic_id', comicId)
    .maybeSingle();

  if (existing) {
    // Remove bookmark
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('comic_id', comicId);

    if (error) {
      return { error: error.message };
    }

    return { success: true, bookmarked: false };
  } else {
    // Add bookmark
    const { error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        comic_id: comicId,
      });

    if (error) {
      return { error: error.message };
    }

    return { success: true, bookmarked: true };
  }
}

// ============================================
// CREATE COMIC ACTION
// ============================================
export async function createComicAction(formData: FormData) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Verify user is artist or admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['artist', 'admin'].includes(profile.role)) {
    return { error: 'Only artists and admins can create comics' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const genre = formData.get('genre') as string; // JSON string
  const coverUrl = formData.get('coverUrl') as string;
  const status = formData.get('status') as string;

  if (!title) {
    return { error: 'Title is required' };
  }

  const comicData: any = {
    artist_id: user.id,
    title,
    description: description || null,
    genre: genre ? JSON.parse(genre) : [],
    cover_url: coverUrl || null,
    status: status || 'ongoing',
  };

  const { data, error } = await supabase
    .from('comics')
    .insert(comicData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

// ============================================
// UPDATE COMIC ACTION
// ============================================
export async function updateComicAction(comicId: string, formData: FormData) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Verify ownership or admin
  const { data: comic } = await supabase
    .from('comics')
    .select('artist_id')
    .eq('id', comicId)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!comic || (comic.artist_id !== user.id && profile?.role !== 'admin')) {
    return { error: 'Unauthorized' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const genre = formData.get('genre') as string;
  const coverUrl = formData.get('coverUrl') as string;
  const status = formData.get('status') as string;

  const updates: any = { updated_at: new Date().toISOString() };
  if (title) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (genre) updates.genre = JSON.parse(genre);
  if (coverUrl !== undefined) updates.cover_url = coverUrl;
  if (status) updates.status = status;

  const { data, error } = await supabase
    .from('comics')
    .update(updates)
    .eq('id', comicId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

// ============================================
// DELETE COMIC ACTION
// ============================================
export async function deleteComicAction(comicId: string) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Verify ownership or admin
  const { data: comic } = await supabase
    .from('comics')
    .select('artist_id')
    .eq('id', comicId)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!comic || (comic.artist_id !== user.id && profile?.role !== 'admin')) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('comics')
    .delete()
    .eq('id', comicId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

// ============================================
// CREATE CHAPTER ACTION
// ============================================
export async function createChapterAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const comicId = formData.get('comicId') as string;
  const chapterNumber = parseInt(formData.get('chapterNumber') as string);
  const title = formData.get('title') as string;

  if (!comicId || !chapterNumber || !title) {
    return { error: 'Comic ID, chapter number, and title are required' };
  }

  // Verify ownership
  const { data: comic } = await supabase
    .from('comics')
    .select('artist_id')
    .eq('id', comicId)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!comic || (comic.artist_id !== user.id && profile?.role !== 'admin')) {
    return { error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('chapters')
    .insert({
      comic_id: comicId,
      chapter_number: chapterNumber,
      title,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

// ============================================
// DELETE CHAPTER ACTION
// ============================================
export async function deleteChapterAction(chapterId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Verify ownership
  const { data: chapter } = await supabase
    .from('chapters')
    .select('comic_id, comics(artist_id)')
    .eq('id', chapterId)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!chapter || ((chapter.comics as any)?.artist_id !== user.id && profile?.role !== 'admin')) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', chapterId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

// ============================================
// CREATE PAGE ACTION
// ============================================
export async function createPageAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const chapterId = formData.get('chapterId') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const pageOrder = parseInt(formData.get('pageOrder') as string);

  if (!chapterId || !imageUrl || pageOrder === undefined) {
    return { error: 'Chapter ID, image URL, and page order are required' };
  }

  const { data, error } = await supabase
    .from('pages')
    .insert({
      chapter_id: chapterId,
      image_url: imageUrl,
      page_order: pageOrder,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}
