'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Typography,
  Box,
} from '@mui/material';
import { format } from 'date-fns';

interface User {
  id: string;
  username: string;
  full_name?: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

interface Props {
  users: User[];
}

export default function AdminUsersTable({ users }: Props) {
  const roleColors = {
    admin: 'error',
    artist: 'primary',
    reader: 'default',
  } as const;

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Joined</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography variant="body2" color="text.secondary">
                  No users found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={user.avatar_url} alt={user.username}>
                      {user.username[0].toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">
                      {user.full_name || user.username}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    @{user.username}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    size="small"
                    color={roleColors[user.role as keyof typeof roleColors] || 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(user.created_at), 'MMM dd, yyyy')}
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
