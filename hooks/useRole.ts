'use client';

import { useAuth } from './useAuth';
import { UserRole } from '@/types/user.types';

export function useRole() {
  const { profile, loading } = useAuth();

  const hasRole = (role: UserRole): boolean => {
    return profile?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return profile ? roles.includes(profile.role) : false;
  };

  return {
    role: profile?.role,
    loading,
    hasRole,
    hasAnyRole,
    isAdmin: hasRole('admin'),
    isArtist: hasAnyRole(['artist', 'admin']),
    isReader: hasRole('reader'),
  };
}
