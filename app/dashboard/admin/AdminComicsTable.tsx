'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import { format } from 'date-fns';
import { Visibility } from '@mui/icons-material';
import Link from 'next/link';

interface Comic {
  id: string;
  title: string;
  status: string;
  view_count: number;
  cover_url?: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

interface Props {
  comics: Comic[];
}

export default function AdminComicsTable({ comics }: Props) {
  const statusColors = {
    ongoing: 'success',
    completed: 'primary',
    hiatus: 'warning',
  } as const;

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Comic</TableCell>
            <TableCell>Artist</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Views</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {comics.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="body2" color="text.secondary">
                  No comics found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            comics.map((comic) => (
              <TableRow key={comic.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {comic.cover_url && (
                      <Box
                        component="img"
                        src={comic.cover_url}
                        alt={comic.title}
                        sx={{
                          width: 40,
                          height: 50,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                    )}
                    <Link
                      href={`/comics/${comic.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{
                          '&:hover': {
                            color: 'primary.main',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {comic.title}
                      </Typography>
                    </Link>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    @{(comic.profiles as any)?.username || 'Unknown'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={comic.status}
                    size="small"
                    color={statusColors[comic.status as keyof typeof statusColors] || 'default'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {comic.view_count?.toLocaleString() || 0}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(comic.created_at), 'MMM dd, yyyy')}
                  </Typography>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
