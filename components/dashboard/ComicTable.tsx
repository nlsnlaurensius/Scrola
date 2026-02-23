'use client';

import { useState, useMemo, useTransition } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import Link from 'next/link';
import { Comic } from '@/types/comic.types';
import { createComicAction, updateComicAction, deleteComicAction } from '@/app/dashboard/artist/actions';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

// ============================================
// TYPES & CONSTANTS
// ============================================

interface ComicTableProps {
  comics: Comic[];
  artistId: string;
}

interface ComicFormData {
  title: string;
  description: string;
  genre: string[];
  status: 'ongoing' | 'completed' | 'hiatus';
  coverFile: File | null;
  coverPreview: string | null;
}

const GENRE_OPTIONS = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Thriller',
];

// ============================================
// COMIC TABLE COMPONENT
// ============================================

export function ComicTable({ comics, artistId }: ComicTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<ComicFormData>({
    title: '',
    description: '',
    genre: [],
    status: 'ongoing',
    coverFile: null,
    coverPreview: null,
  });

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [comicToDelete, setComicToDelete] = useState<Comic | null>(null);

  // Notification
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // ============================================
  // TABLE COLUMNS DEFINITION
  // ============================================

  const columns = useMemo<ColumnDef<Comic>[]>(
    () => [
      {
        accessorKey: 'cover_url',
        header: 'Cover',
        cell: ({ row }) => (
          <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden shrink-0">
            {row.original.cover_url ? (
              <img
                src={row.original.cover_url}
                alt={row.original.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No Cover
              </div>
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div className="min-w-[200px]">
            <div className="font-medium text-gray-900">{row.original.title}</div>
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {row.original.description || 'No description'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'genre',
        header: 'Genre',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1 min-w-[150px]">
            {row.original.genre.slice(0, 2).map((g) => (
              <Chip key={g} label={g} size="small" />
            ))}
            {row.original.genre.length > 2 && (
              <Chip label={`+${row.original.genre.length - 2}`} size="small" variant="outlined" />
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const statusColors = {
            ongoing: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            hiatus: 'bg-yellow-100 text-yellow-800',
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[row.original.status]}`}
            >
              {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
            </span>
          );
        },
      },
      {
        accessorKey: 'view_count',
        header: 'Views',
        cell: ({ row }) => row.original.view_count.toLocaleString(),
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => format(new Date(row.original.created_at), 'MMM dd, yyyy'),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Link href={`/dashboard/artist/comics/${row.original.id}`}>
              <IconButton size="small" color="secondary" title="Manage Chapters">
                <ListIcon fontSize="small" />
              </IconButton>
            </Link>
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEdit(row.original)}
              title="Edit"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(row.original)}
              title="Delete"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>
        ),
        enableSorting: false,
      },
    ],
    []
  );

  // ============================================
  // TABLE INSTANCE
  // ============================================

  const table = useReactTable({
    data: comics,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      title: '',
      description: '',
      genre: [],
      status: 'ongoing',
      coverFile: null,
      coverPreview: null,
    });
    setOpenModal(true);
  };

  const handleEdit = (comic: Comic) => {
    setModalMode('edit');
    setSelectedComic(comic);
    setFormData({
      title: comic.title,
      description: comic.description || '',
      genre: comic.genre,
      status: comic.status,
      coverFile: null,
      coverPreview: comic.cover_url,
    });
    setOpenModal(true);
  };

  const handleDeleteClick = (comic: Comic) => {
    setComicToDelete(comic);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!comicToDelete) return;

    setSubmitting(true);
    const result = await deleteComicAction(comicToDelete.id);
    setSubmitting(false);

    if (result.success) {
      setSnackbar({
        open: true,
        message: 'Comic deleted successfully!',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setComicToDelete(null);
      startTransition(() => {
        router.refresh();
      });
    } else {
      setSnackbar({
        open: true,
        message: result.error || 'Failed to delete comic',
        severity: 'error',
      });
    }
  };

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: 'Please upload an image file',
        severity: 'error',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: 'File size must be less than 5MB',
        severity: 'error',
      });
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      coverFile: file,
      coverPreview: previewUrl,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      setSnackbar({
        open: true,
        message: 'Title is required',
        severity: 'error',
      });
      return;
    }

    if (formData.genre.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one genre',
        severity: 'error',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Build FormData for Server Action
      const submitData = new FormData();

      if (modalMode === 'create') {
        submitData.append('title', formData.title.trim());
        submitData.append('description', formData.description.trim());
        submitData.append('genre', JSON.stringify(formData.genre));
        submitData.append('status', formData.status);
        if (formData.coverFile) {
          submitData.append('coverFile', formData.coverFile);
        }

        const result = await createComicAction(submitData);

        if (result.success) {
          setSnackbar({
            open: true,
            message: 'Comic created successfully!',
            severity: 'success',
          });
          setOpenModal(false);
          startTransition(() => {
            router.refresh();
          });
        } else {
          setSnackbar({
            open: true,
            message: result.error || 'Failed to create comic',
            severity: 'error',
          });
        }
      } else if (selectedComic) {
        submitData.append('id', selectedComic.id);
        submitData.append('title', formData.title.trim());
        submitData.append('description', formData.description.trim());
        submitData.append('genre', JSON.stringify(formData.genre));
        submitData.append('status', formData.status);
        if (formData.coverFile) {
          submitData.append('coverFile', formData.coverFile);
        }

        const result = await updateComicAction(submitData);

        if (result.success) {
          setSnackbar({
            open: true,
            message: 'Comic updated successfully!',
            severity: 'success',
          });
          setOpenModal(false);
          startTransition(() => {
            router.refresh();
          });
        } else {
          setSnackbar({
            open: true,
            message: result.error || 'Failed to update comic',
            severity: 'error',
          });
        }
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center flex-1 w-full sm:w-auto">
          <TextField
            size="small"
            placeholder="Search comics..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="flex-1 sm:w-80"
          />
          <FormControl size="small" className="w-24">
            <InputLabel>Show</InputLabel>
            <Select
              value={pageSize}
              label="Show"
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                table.setPageSize(Number(e.target.value));
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Add Comic
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {
                        {
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string]
                      }
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No comics found. Create your first comic!
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-gray-900 dark:text-gray-100">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {table.getState().pagination.pageIndex * pageSize + 1} to{' '}
            {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, comics.length)} of{' '}
            {comics.length} results
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                table.setPageSize(Number(e.target.value));
              }}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="small" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <Button size="small" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={openModal} onClose={() => !submitting && setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>{modalMode === 'create' ? 'Create New Comic' : 'Edit Comic'}</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <TextField
              fullWidth
              label="Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={submitting}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={submitting}
            />

            <FormControl fullWidth required>
              <InputLabel>Genre</InputLabel>
              <Select
                multiple
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value as string[] })}
                disabled={submitting}
                label="Genre"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {GENRE_OPTIONS.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'ongoing' | 'completed' | 'hiatus' })
                }
                disabled={submitting}
              >
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="hiatus">Hiatus</MenuItem>
              </Select>
            </FormControl>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
              <div className="flex items-start gap-4">
                {formData.coverPreview && (
                  <div className="w-32 h-40 bg-gray-200 rounded overflow-hidden shrink-0">
                    <img
                      src={formData.coverPreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    disabled={submitting}
                    id="cover-upload"
                    className="hidden"
                  />
                  <label htmlFor="cover-upload">
                    <Button variant="outlined" component="span" disabled={submitting}>
                      {formData.coverFile ? 'Change Cover' : 'Upload Cover'}
                    </Button>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: 400x600px, Max 5MB, JPG/PNG
                  </p>
                  {formData.coverFile && (
                    <p className="text-xs text-green-600 mt-1">✓ {formData.coverFile.name}</p>
                  )}
                </div>
              </div>
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : modalMode === 'create' ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !submitting && setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <p>
            Are you sure you want to delete <strong>"{comicToDelete?.title}"</strong>? This action cannot be
            undone and will delete all chapters and pages associated with this comic.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
