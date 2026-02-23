'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';

interface Props {
  currentSearch: string;
  currentGenre: string;
  currentStatus: string;
  currentSort: string;
}

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 
  'Sports', 'Supernatural', 'Thriller'
];

const STATUSES = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus', label: 'Hiatus' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest Updates' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'oldest', label: 'Oldest First' },
];

export default function ComicsFilter({ 
  currentSearch, 
  currentGenre, 
  currentStatus, 
  currentSort 
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(currentSearch);
  const [genre, setGenre] = useState(currentGenre);
  const [status, setStatus] = useState(currentStatus);
  const [sort, setSort] = useState(currentSort);

  const updateFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    
    if (genre) {
      params.set('genre', genre);
    } else {
      params.delete('genre');
    }
    
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    
    if (sort) {
      params.set('sort', sort);
    } else {
      params.delete('sort');
    }
    
    // Reset to page 1 when filtering
    params.delete('page');
    
    router.push(`/comics?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch('');
    setGenre('');
    setStatus('');
    setSort('latest');
    router.push('/comics');
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Stack spacing={2}>
        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search comics by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              updateFilters();
            }
          }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />

        {/* Filters Row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Genre</InputLabel>
            <Select
              value={genre}
              label="Genre"
              onChange={(e: SelectChangeEvent) => setGenre(e.target.value)}
            >
              <MenuItem value="">All Genres</MenuItem>
              {GENRES.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e: SelectChangeEvent) => setStatus(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sort}
              label="Sort By"
              onChange={(e: SelectChangeEvent) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<FilterList />}
            onClick={updateFilters}
            fullWidth
          >
            Apply Filters
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{ minWidth: 120 }}
          >
            Reset
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
