import Link from "next/link";
import { Button, Container, Typography, Box, Stack, Card, CardMedia, CardContent, Chip } from "@mui/material";
import { AutoStories, Create, TrendingUp, Visibility } from "@mui/icons-material";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server Component - fetch data directly
async function getPopularComics() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data } = await supabase
    .from('comics')
    .select(`
      *,
      profiles:artist_id (username, avatar_url)
    `)
    .order('view_count', { ascending: false })
    .limit(6);

  return data || [];
}

async function getLatestComics() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data } = await supabase
    .from('comics')
    .select(`
      *,
      profiles:artist_id (username, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(6);

  return data || [];
}

export default async function Home() {
  // Check authentication status
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const [popularComics, latestComics] = await Promise.all([
    getPopularComics(),
    getLatestComics(),
  ]);

  return (
    <div className="bg-linear-to-b from-purple-50 to-white dark:from-gray-900 dark:to-black min-h-screen">
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ py: 10, textAlign: 'center' }}>
          <Typography
            variant="h2"
            component="h1"
            fontWeight={700}
            gutterBottom
            sx={{ mb: 3 }}
          >
            Welcome to Scrola
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}
          >
            Discover amazing webtoons and comics, or share your own stories with the world
          </Typography>
          
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Link href="/comics" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AutoStories />}
                sx={{ px: 4, py: 1.5 }}
              >
                Browse Comics
              </Button>
            </Link>
            </Stack>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography
            variant="h4"
            component="h2"
            fontWeight={600}
            textAlign="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Why Scrola?
          </Typography>
          
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={4}
            justifyContent="center"
          >
            {/* Feature 1 */}
            <Box
              sx={{
                flex: 1,
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 1,
              }}
            >
              <AutoStories sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Read Anywhere
              </Typography>
              <Typography color="text.secondary">
                Access thousands of comics and webtoons from any device
              </Typography>
            </Box>

            {/* Feature 2 */}
            <Box
              sx={{
                flex: 1,
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 1,
              }}
            >
              <Create sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Share Your Art
              </Typography>
              <Typography color="text.secondary">
                Become an artist and publish your own comics to readers worldwide
              </Typography>
            </Box>

            {/* Feature 3 */}
            <Box
              sx={{
                flex: 1,
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 1,
              }}
            >
              <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Track Progress
              </Typography>
              <Typography color="text.secondary">
                Bookmark favorites and continue reading where you left off
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Popular Comics Section */}
        {popularComics.length > 0 && (
          <Box sx={{ py: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" component="h2" fontWeight={600}>
                Popular Comics
              </Typography>
              <Link href="/comics?sort=popular" style={{ textDecoration: 'none' }}>
                <Button
                  variant="text"

                >
                  View All
                </Button>
              </Link>
            </Box>
            
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(6, 1fr)',
                },
                gap: 2,
              }}
            >
              {popularComics.map((comic: any) => (
                <Link
                  key={comic.id}
                  href={`/comics/${comic.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={comic.cover_url || '/placeholder-cover.jpg'}
                      alt={comic.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '2.5em',
                        }}
                      >
                        {comic.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                        <Visibility sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {comic.view_count?.toLocaleString() || 0}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </Box>
          </Box>
        )}

        {/* Latest Comics Section */}
        {latestComics.length > 0 && (
          <Box sx={{ py: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" component="h2" fontWeight={600}>
                Latest Updates
              </Typography>
              <Link href="/comics?sort=latest" style={{ textDecoration: 'none' }}>
                <Button
                  variant="text"
                >
                  View All
                </Button>
              </Link>
            </Box>
            
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(6, 1fr)',
                },
                gap: 2,
              }}
            >
              {latestComics.map((comic: any) => (
                <Link
                  key={comic.id}
                  href={`/comics/${comic.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={comic.cover_url || '/placeholder-cover.jpg'}
                      alt={comic.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '2.5em',
                        }}
                      >
                        {comic.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        by {(comic.profiles as any)?.username || 'Unknown'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </Box>
          </Box>
        )}

        {/* CTA Section */}
        {!user && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Ready to start your journey?
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Join thousands of readers and artists on Scrola
            </Typography>
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                sx={{ px: 6, py: 1.5 }}
              >
                Get Started Now
              </Button>
            </Link>
          </Box>
        )}
      </Container>
    </div>
  );
}
