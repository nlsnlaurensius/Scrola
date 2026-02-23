'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Image as ImageIcon,
  Visibility,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { createChapterAction, deleteChapterAction } from '@/app/auth/actions';
import Link from 'next/link';

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  view_count: number;
  created_at: string;
  pages: any[];
}

interface Props {
  comicId: string;
  initialChapters: Chapter[];
}

export default function ChapterManagementTable({ comicId, initialChapters }: Props) {
  const router = useRouter();
  const [chapters, setChapters] = useState(initialChapters);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'delete'>('create');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [chapterNumber, setChapterNumber] = useState('');
  const [title, setTitle] = useState('');

  const handleOpenCreate = () => {
    setDialogMode('create');
    setChapterNumber((chapters.length + 1).toString());
    setTitle('');
    setError('');
    setOpenDialog(true);
  };

  const handleOpenDelete = (chapter: Chapter) => {
    setDialogMode('delete');
    setSelectedChapter(chapter);
    setError('');
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedChapter(null);
    setError('');
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('comicId', comicId);
    formData.append('chapterNumber', chapterNumber);
    formData.append('title', title);

    const result = await createChapterAction(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    handleClose();
    router.refresh();
  };

  const handleDelete = async () => {
    if (!selectedChapter) return;

    setLoading(true);
    setError('');

    const result = await deleteChapterAction(selectedChapter.id);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    handleClose();
    router.refresh();
  };

  const getPageCount = (chapter: Chapter) => {
    if (Array.isArray(chapter.pages)) {
      return chapter.pages.length;
    }
    if (chapter.pages && typeof chapter.pages === 'object' && 'count' in chapter.pages) {
      return (chapter.pages as any).count || 0;
    }
    return 0;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Chapters ({chapters.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
        >
          Add Chapter
        </Button>
      </Box>

      {/* Table */}
      {chapters.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No chapters yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first chapter to start publishing pages
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Chapter #</TableCell>
                <TableCell>Title</TableCell>
                <TableCell align="center">Pages</TableCell>
                <TableCell align="center">Views</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chapters.map((chapter) => (
                <TableRow key={chapter.id} hover>
                  <TableCell>
                    <Chip label={`Ch. ${chapter.chapter_number}`} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {chapter.title}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <ImageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {getPageCount(chapter)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {chapter.view_count?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(chapter.created_at), 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      component={Link}
                      href={`/artist/comics/${comicId}/chapters/${chapter.id}`}
                      title="Manage Pages"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleOpenDelete(chapter)}
                      title="Delete Chapter"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Delete Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New Chapter' : 'Delete Chapter'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {dialogMode === 'create' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Chapter Number"
                type="number"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Chapter Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                placeholder="e.g., The Beginning"
              />
            </Box>
          ) : (
            <Typography>
              Are you sure you want to delete{' '}
              <strong>Chapter {selectedChapter?.chapter_number}: {selectedChapter?.title}</strong>?
              <br />
              <br />
              This action cannot be undone and will delete all pages in this chapter.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          {dialogMode === 'create' ? (
            <Button
              onClick={handleCreate}
              variant="contained"
              disabled={loading || !chapterNumber || !title}
            >
              {loading ? 'Creating...' : 'Create Chapter'}
            </Button>
          ) : (
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
