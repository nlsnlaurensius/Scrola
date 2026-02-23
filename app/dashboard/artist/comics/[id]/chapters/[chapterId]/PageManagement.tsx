'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  LinearProgress,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
  Grid,
} from '@mui/material';
import { CloudUpload, Delete, DragIndicator } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { uploadPagesAction, deletePageAction } from '../../actions';

interface Page {
  id: string;
  image_url: string;
  page_order: number;
  created_at: string;
}

interface Props {
  chapterId: string;
  comicId: string;
  initialPages: Page[];
}

export default function PageManagement({ chapterId, comicId, initialPages }: Props) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('chapter_id', chapterId);
      formData.append('comic_id', comicId);

      // Append all files
      Array.from(files).forEach((file) => {
        formData.append('pages', file);
      });

      // Upload all files at once using Server Action
      const result = await uploadPagesAction(formData);

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadProgress(100);
      setSuccess(`Successfully uploaded ${result.count} page(s)`);
      
      // Refresh the page data
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'Failed to upload pages');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) {
      return;
    }

    try {
      const result = await deletePageAction(pageId, comicId);
      
      if (!result.success) {
        throw new Error(result.error || 'Delete failed');
      }

      setSuccess('Page deleted successfully');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete page');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Pages ({pages.length})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload images for this chapter. Images will be displayed in the order they are uploaded.
        </Typography>
      </Box>

      {/* Upload Section */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUpload />}
          disabled={uploading}
          fullWidth
          sx={{ py: 2 }}
        >
          {uploading ? 'Uploading...' : 'Upload Pages'}
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={handleFileSelect}
          />
        </Button>

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Uploading... {Math.round(uploadProgress)}%
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
      </Box>

      {/* Pages Grid */}
      {pages.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, bgcolor: 'grey.50', borderRadius: 1 }}>
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No pages yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload images to create your first pages
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {pages
            .sort((a, b) => a.page_order - b.page_order)
            .map((page) => (
              <Grid item xs={6} sm={4} md={3} key={page.id}>
                <Card sx={{ position: 'relative' }}>
                  <Chip
                    label={`Page ${page.page_order}`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 1,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                    }}
                  />
                  <CardMedia
                    component="img"
                    height="200"
                    image={page.image_url}
                    alt={`Page ${page.page_order}`}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardActions sx={{ justifyContent: 'center', p: 1 }}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(page.id)}
                      title="Delete page"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}

      {/* Help Text */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
        <Typography variant="body2" color="info.dark" sx={{ mb: 1 }}>
          <strong>Tips:</strong>
        </Typography>
        <Box 
          component="ul" 
          sx={{ 
            margin: '8px 0', 
            paddingLeft: '20px',
            color: 'info.dark',
            fontSize: '0.875rem'
          }}
        >
          <li>Supported formats: JPG, PNG, WebP</li>
          <li>Recommended width: 800-1200px</li>
          <li>You can upload multiple images at once</li>
          <li>Pages will be numbered automatically in upload order</li>
        </Box>
      </Box>
    </Box>
  );
}
