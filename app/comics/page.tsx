import Link from 'next/link';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardMedia, 
  CardContent, 
  Chip,
  Pagination,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { createClient } from '@/lib/supabase/server';
import ComicsFilter from './ComicsFilter';

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    genre?: string;
    status?: string;
    sort?: string;
  }>;
}

async function getComics(params: Awaited<Props['searchParams']>) {
  const supabase = await createClient();

  const page = parseInt(params.page || '1');
  const pageSize = 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('comics')
    .select(`
      *,
      profiles:artist_id (username, avatar_url)
    `, { count: 'exact' });

  // Search filter
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  // Status filter
  if (params.status && ['ongoing', 'completed', 'hiatus'].includes(params.status)) {
    query = query.eq('status', params.status as 'ongoing' | 'completed' | 'hiatus');
  }

  // Genre filter
  if (params.genre) {
    query = query.contains('genre', [params.genre]);
  }

  // Sorting
  switch (params.sort) {
    case 'popular':
      query = query.order('view_count', { ascending: false });
      break;
    case 'latest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'title':
      query = query.order('title', { ascending: true });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching comics:', error);
    return { comics: [], count: 0 };
  }

  return { comics: data || [], count: count || 0 };
}

export default async function ComicsPage({ searchParams }: Props) {
  // Await searchParams (Next.js 15 requirement)
  const resolvedParams = await searchParams;
  
  const { comics, count } = await getComics(resolvedParams);
  const page = parseInt(resolvedParams.page || '1');
  const pageSize = 12;
  const totalPages = Math.ceil(count / pageSize);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Browse Comics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover amazing webtoons and comics from talented artists
        </Typography>
      </Box>

      {/* Filter Component (Client Component) */}
      <ComicsFilter 
        currentSearch={resolvedParams.search || ''}
        currentGenre={resolvedParams.genre || ''}
        currentStatus={resolvedParams.status || ''}
        currentSort={resolvedParams.sort || 'latest'}
      />

      {/* Results Count */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {comics.length} of {count} comics
        </Typography>
      </Box>

      {/* Comics Grid */}
      {comics.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No comics found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
              mb: 4,
            }}
          >
            {comics.map((comic: any) => (
              <Link
                key={comic.id}
                href={`/comics/${comic.id}`}
                style={{ textDecoration: 'none' }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="280"
                    image={comic.cover_url || '/placeholder-cover.jpg'}
                    alt={comic.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '3em',
                        mb: 1,
                      }}
                    >
                      {comic.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      by {(comic.profiles as any)?.username || 'Unknown'}
                    </Typography>

                    {/* Genres */}
                    {comic.genre && comic.genre.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        {comic.genre.slice(0, 2).map((g: string) => (
                          <Chip
                            key={g}
                            label={g}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ))}
                      </Box>
                    )}

                    {/* Stats */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {comic.view_count?.toLocaleString() || 0} views
                      </Typography>
                      <Chip
                        label={comic.status}
                        size="small"
                        color={
                          comic.status === 'ongoing' ? 'success' :
                          comic.status === 'completed' ? 'primary' : 'default'
                        }
                        sx={{ ml: 'auto', fontSize: '0.65rem', height: 20 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => {
                  const params = new URLSearchParams();
                  if (resolvedParams.search) params.set('search', resolvedParams.search);
                  if (resolvedParams.genre) params.set('genre', resolvedParams.genre);
                  if (resolvedParams.status) params.set('status', resolvedParams.status);
                  if (resolvedParams.sort) params.set('sort', resolvedParams.sort);
                  params.set('page', value.toString());
                  window.location.href = `/comics?${params.toString()}`;
                }}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
