'use client';

import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Alert,
  Chip,
  IconButton,
  Badge,
} from '@mui/material';
import { Edit, Save, CameraAlt, Delete } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { updateProfileAction } from '@/app/auth/actions';

interface Profile {
  id: string;
  username: string;
  full_name?: string | null;
  role: string;
  avatar_url?: string | null;
  bio?: string | null;
  created_at: string;
}

interface Props {
  profile: Profile;
}

export default function ProfileSettings({ profile }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: profile.full_name || '',
    bio: profile.bio || '',
  });

  const handleAvatarClick = () => {
    if (editing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const formDataObj = new FormData();
    formDataObj.append('userId', profile.id);
    formDataObj.append('fullName', formData.fullName);
    formDataObj.append('bio', formData.bio);
    
    // Add avatar file if selected
    if (avatarFile) {
      formDataObj.append('avatar', avatarFile);
    }

    const result = await updateProfileAction(formDataObj);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess('Profile updated successfully');
    setLoading(false);
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    router.refresh();
  };

  const roleColors = {
    admin: 'error',
    artist: 'primary',
    reader: 'default',
  } as const;

  return (
    <Box>
      {/* Avatar and Basic Info */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            editing ? (
              <IconButton
                size="small"
                onClick={handleAvatarClick}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  width: 40,
                  height: 40,
                }}
              >
                <CameraAlt fontSize="small" />
              </IconButton>
            ) : null
          }
        >
          <Avatar
            src={avatarPreview || profile.avatar_url || undefined}
            alt={profile.username}
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 2,
              cursor: editing ? 'pointer' : 'default',
              border: '4px solid',
              borderColor: 'background.paper',
              boxShadow: 3,
            }}
            onClick={handleAvatarClick}
          >
            {profile.username[0].toUpperCase()}
          </Avatar>
        </Badge>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: 'none' }}
        />

        {/* Show remove button if new avatar selected */}
        {editing && avatarPreview && (
          <Button
            size="small"
            startIcon={<Delete />}
            onClick={handleRemoveAvatar}
            sx={{ mt: 1 }}
          >
            Remove New Avatar
          </Button>
        )}

        <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>
          @{profile.username}
        </Typography>
        <Chip
          label={profile.role}
          size="small"
          color={roleColors[profile.role as keyof typeof roleColors] || 'default'}
          sx={{ mt: 1 }}
        />
      </Box>

      {/* Editable Fields */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Full Name"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          disabled={!editing}
          fullWidth
        />

        <TextField
          label="Bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          disabled={!editing}
          multiline
          rows={4}
          fullWidth
          placeholder="Tell us about yourself..."
        />

        {editing ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setEditing(false);
                setFormData({
                  fullName: profile.full_name || '',
                  bio: profile.bio || '',
                });
              }}
              disabled={loading}
              fullWidth
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setEditing(true)}
            fullWidth
          >
            Edit Profile
          </Button>
        )}
      </Box>
    </Box>
  );
}
