import { createClient } from '@/lib/supabase/client';
import { ProfileInsert } from '@/types/user.types';

export class AuthService {
  private supabase = createClient();

  async signUp(email: string, password: string, username: string, fullName?: string) {
    // Check if username is already taken
    const { data: existingProfile } = await this.supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (existingProfile) {
      throw new Error('Username already taken');
    }

    // Sign up user
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Create profile
      const profile: ProfileInsert = {
        id: data.user.id,
        username,
        full_name: fullName || null,
        role: 'reader',
      };

      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert(profile);

      if (profileError) throw profileError;
    }

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getSession() {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async getUser() {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, updates: Partial<ProfileInsert>) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  }

  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  }
}

export const authService = new AuthService();
