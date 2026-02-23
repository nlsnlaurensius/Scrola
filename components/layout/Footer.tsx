'use client';

import Image from 'next/image';
import { Box, Container, Typography, Link, Stack, Divider } from '@mui/material';
import { GitHub, Twitter, Instagram } from '@mui/icons-material';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        bgcolor: 'grey.200',
        '.dark &': {
          bgcolor: 'grey.900',
        },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Logo & Description */}
          <Box>
            
            <Typography variant="body2" color="text.secondary" maxWidth={400}>
              A platform for reading and creating digital comics. Find your favorite stories or share your work with the world.
            </Typography>
          </Box>

          <Divider />

          {/* Links */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 4 }}
            justifyContent="space-between"
          >
            {/* Navigation Links */}
            <Stack direction="row" spacing={3}>
              <Link href="/" color="text.secondary" underline="hover">
                Home
              </Link>
              <Link href="/comics" color="text.secondary" underline="hover">
                Browse
              </Link>
              <Link href="/about" color="text.secondary" underline="hover">
                About
              </Link>
              <Link href="/contact" color="text.secondary" underline="hover">
                Contact
              </Link>
            </Stack>

            {/* Social Media */}
            <Stack direction="row" spacing={2}>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                color="text.secondary"
              >
                <GitHub />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                color="text.secondary"
              >
                <Twitter />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                color="text.secondary"
              >
                <Instagram />
              </Link>
            </Stack>
          </Stack>

          <Divider />

          {/* Copyright */}
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              © {currentYear} Scrola. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Link href="/privacy" color="text.secondary" variant="body2" underline="hover">
                Privacy Policy
              </Link>
              <Link href="/terms" color="text.secondary" variant="body2" underline="hover">
                Terms of Service
              </Link>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
