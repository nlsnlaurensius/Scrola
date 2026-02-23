import { redirect } from 'next/navigation';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import { createClient } from '@/lib/supabase/server';
import ProfileSettings from './ProfileSettings';
import BookmarkedComics from './BookmarkedComics';

async function getCurrentUser() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: any };

  return profile;
}

async function getBookmarkedComics(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('bookmarks')
    .select(`
      id,
      created_at,
      comic:comic_id (
        id,
        title,
        description,
        cover_url,
        status,
        view_count,
        profiles:artist_id (username)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function ProfilePage() {
  const profile = await getCurrentUser();

  if (!profile) {
    redirect('/login');
  }

  const bookmarks = await getBookmarkedComics(profile.id);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your profile and view your bookmarked comics
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <ProfileSettings profile={profile} />
          </Paper>
        </Grid>

        {/* Bookmarked Comics */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <BookmarkedComics bookmarks={bookmarks} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
