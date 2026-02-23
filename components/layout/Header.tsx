'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  Person,
  Logout,
  Login,
  AppRegistration,
} from '@mui/icons-material';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    router.push('/logout');
  };

  const handleNavigation = (path: string) => {
    handleUserMenuClose();
    handleMobileMenuClose();
    router.push(path);
  };

  return (
    <AppBar position="sticky" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', marginRight: '32px', textDecoration: 'none' }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
              <Image
                src="/scrola-logo.png"
                alt="Scrola"
                width={120}
                height={40}
                style={{ objectFit: 'contain', width: 'auto', height: '32px' }}
                priority
              />
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: '#1a1a1a',
                  '.dark &': {
                    color: '#00ff81',
                  },
                }}
              >
                Scrola
              </Typography>
            </Box>
          </Link>

          {/* Mobile Menu Icon */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
            >
              <MenuItem onClick={() => handleNavigation('/')}>Home</MenuItem>
              <MenuItem onClick={() => handleNavigation('/comics')}>Browse Comics</MenuItem>
              {isAuthenticated && profile?.role === 'artist' && (
                <MenuItem onClick={() => handleNavigation('/dashboard/artist')}>My Comics</MenuItem>
              )}
              {isAuthenticated && profile?.role === 'admin' && (
                <MenuItem onClick={() => handleNavigation('/dashboard/admin')}>Admin</MenuItem>
              )}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', flexGrow: 1, textDecoration: 'none', marginRight: '8px' }}>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
              <Image
                src="/scrola-logo.png"
                alt="Scrola"
                width={100}
                height={34}
                style={{ objectFit: 'contain', width: 'auto', height: 'clamp(20px, 5vw, 28px)', maxHeight: '28px' }}
                priority
              />
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontWeight: 700,
                  fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                  color: '#1a1a1a',
                  '.dark &': {
                    color: '#00ff81',
                  },
                }}
              >
                Scrola
              </Typography>
            </Box>
          </Link>

          {/* Desktop Navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button
              color="inherit"
              component={Link}
              href="/"
              sx={{ fontWeight: pathname === '/' ? 600 : 400 }}
            >
              Home
            </Button>
            <Button
              color="inherit"
              component={Link}
              href="/comics"
              sx={{ fontWeight: pathname?.startsWith('/comics') ? 600 : 400 }}
            >
              Browse Comics
            </Button>
            {isAuthenticated && profile?.role === 'artist' && (
              <Button
                color="inherit"
                component={Link}
                href="/dashboard/artist"
                sx={{ fontWeight: pathname?.startsWith('/dashboard/artist') ? 600 : 400 }}
              >
                My Comics
              </Button>
            )}
            {isAuthenticated && profile?.role === 'admin' && (
              <Button
                color="inherit"
                component={Link}
                href="/dashboard/admin"
                sx={{ fontWeight: pathname?.startsWith('/dashboard/admin') ? 600 : 400 }}
              >
                Admin
              </Button>
            )}
          </Box>

          {/* User Menu */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isAuthenticated ? (
              <>
                <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                  <Avatar
                    alt={profile?.username || 'User'}
                    src={profile?.avatar_url || undefined}
                    sx={{ width: 40, height: 40 }}
                  >
                    {profile?.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem disabled>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {profile?.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {profile?.role}
                      </Typography>
                    </Box>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={() => handleNavigation('/profile')}>
                    <Person sx={{ mr: 1 }} fontSize="small" />
                    Profile
                  </MenuItem>
                  {(profile?.role === 'artist' || profile?.role === 'admin') && (
                    <MenuItem onClick={() => handleNavigation(profile?.role === 'admin' ? '/dashboard/admin' : '/dashboard/artist')}>
                      <Dashboard sx={{ mr: 1 }} fontSize="small" />
                      Dashboard
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <Logout sx={{ mr: 1 }} fontSize="small" />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  color="inherit"
                  startIcon={<Login />}
                  component={Link}
                  href="/login"
                  variant="outlined"
                  size="small"
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  startIcon={<AppRegistration />}
                  component={Link}
                  href="/register"
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)',
                    },
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
