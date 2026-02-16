import { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type UserRole = 'admin' | 'artist' | 'reader';

export interface UserSession {
  user: {
    id: string;
    email: string;
  };
  profile: Profile;
}
