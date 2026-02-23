'use client';

import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  IconButton,
  Grid,
} from '@mui/material';
import { Bookmark, Visibility } from '@mui/icons-material';
import Link from 'next/link';
import { format } from 'date-fns';
import { toggleBookmarkAction } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Bookmark {
  id: string;
  created_at: string;
  comic: {
    id: string;
    title: string;
    description?: string | null;
    cover_url?: string | null;
    status: string;
    view_count: number;
    profiles: {
      username: string;
    };
  };
}

interface Props {
  bookmarks: Bookmark[];
}

export default function BookmarkedComics({ bookmarks }: Props) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemoveBookmark = async (comicId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!confirm('Remove this comic from bookmarks?')) {
      return;
    }

    setRemoving(comicId);

    const result = await toggleBookmarkAction(comicId);

    if (result.error) {
      alert(result.error);
      setRemoving(null);
      return;
    }

    router.refresh();
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        My Bookmarks ({bookmarks.length})
      </Typography>

      {bookmarks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Bookmark sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No bookmarks yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start exploring comics and bookmark your favorites
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {bookmarks.map((bookmark) => {
            const comic = bookmark.comic as any;
            
            return (
              <Grid item xs={12} sm={6} key={bookmark.id}>
                <Link
                  href={`/comics/${comic.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Card
                    sx={{
                      display: 'flex',
                      height: '100%',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{ width: 100, flexShrink: 0 }}
                      image={comic.cover_url || '/placeholder-cover.jpg'}
                      alt={comic.title}
                    />
                    <CardContent sx={{ flex: 1, p: 2, position: 'relative' }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => handleRemoveBookmark(comic.id, e)}
                        disabled={removing === comic.id}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                        }}
                        title="Remove bookmark"
                      >
                        <Bookmark />
                      </IconButton>

                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          pr: 4,
                        }}
                      >
                        {comic.title}
                      </Typography>

                      <Typography variant="caption" color="text.secondary" display="block">
                        by {comic.profiles?.username || 'Unknown'}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Chip
                          label={comic.status}
                          size="small"
                          color={
                            comic.status === 'ongoing' ? 'success' :
                            comic.status === 'completed' ? 'primary' : 'default'
                          }
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Visibility sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {comic.view_count?.toLocaleString() || 0}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Bookmarked {format(new Date(bookmark.created_at), 'MMM dd, yyyy')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
