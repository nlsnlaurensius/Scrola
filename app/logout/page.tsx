'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CircularProgress, Box, Typography } from '@mui/material';

export default function LogoutPage() {
  useEffect(() => {
    const performLogout = async () => {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
        
        // Use window.location for hard redirect to ensure clean logout
        window.location.href = '/login';
      } catch (error) {
        console.error('Logout error:', error);
        // Redirect even on error
        window.location.href = '/login';
      }
    };

    performLogout();
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography>Logging out...</Typography>
    </Box>
  );
}
