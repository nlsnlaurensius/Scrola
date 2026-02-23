'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnDef,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { updateUserRoleAction, deleteUserAccountAction } from './actions';

// ============================================
// CLIENT COMPONENT: USER MANAGEMENT TABLE
// Manage all platform users with TanStack Table
// ============================================

interface User {
  id: string;
  username: string;
  full_name?: string | null;
  role: 'admin' | 'artist' | 'reader';
  avatar_url?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

interface UserManagementTableProps {
  users: User[];
  currentUserId: string;
}

export function UserManagementTable({ users, currentUserId }: UserManagementTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // View Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'artist' | 'reader'>('reader');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleEditOpen = (user: User) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingUser) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append('user_id', editingUser.id);
      formData.append('role', selectedRole);

      const result = await updateUserRoleAction(formData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'User role updated successfully',
          severity: 'success',
        });
        setEditModalOpen(false);
        router.refresh();
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to update user role',
          severity: 'error',
        });
      }

      setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
    });
  };

  const handleDeleteOpen = (user: User) => {
    setDeletingUser(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append('user_id', deletingUser.id);

      const result = await deleteUserAccountAction(formData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message || 'User deleted successfully',
          severity: 'success',
        });
        setDeleteModalOpen(false);
        router.refresh();
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to delete user',
          severity: 'error',
        });
      }

      setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 4000);
    });
  };

  const roleColors = {
    admin: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', chip: 'error' as const },
    artist: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', chip: 'primary' as const },
    reader: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', chip: 'default' as const },
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'username',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={row.original.avatar_url || undefined}
            alt={row.original.username}
            sx={{ width: 40, height: 40 }}
          >
            {row.original.username[0].toUpperCase()}
          </Avatar>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {row.original.full_name || row.original.username}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{row.original.username}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Chip
          label={row.original.role.charAt(0).toUpperCase() + row.original.role.slice(1)}
          size="small"
          color={roleColors[row.original.role].chip}
        />
      ),
      filterFn: (row, id, value) => {
        return value.length === 0 || value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Join Date',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300 text-sm">
          {format(new Date(row.original.created_at), 'MMM dd, yyyy')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isCurrentUser = row.original.id === currentUserId;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleView(row.original)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              View
            </button>
            <button
              onClick={() => handleEditOpen(row.original)}
              disabled={isCurrentUser || isPending}
              className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={isCurrentUser ? 'Cannot edit your own role' : 'Edit user role'}
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteOpen(row.original)}
              disabled={isCurrentUser || isPending}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={isCurrentUser ? 'Cannot delete your own account' : 'Delete user'}
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Get unique roles for faceted filter
  const roleFilter = columnFilters.find((f) => f.id === 'role')?.value as string[] || [];

  const toggleRoleFilter = (role: string) => {
    const currentFilter = roleFilter;
    const newFilter = currentFilter.includes(role)
      ? currentFilter.filter((r) => r !== role)
      : [...currentFilter, role];
    
    setColumnFilters((old) =>
      old.filter((f) => f.id !== 'role').concat(newFilter.length > 0 ? [{ id: 'role', value: newFilter }] : [])
    );
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No users found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No users are registered on the platform yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div>
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search users by name or username..."
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Role Faceted Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Role:
          </label>
          <div className="flex flex-wrap gap-2">
            {(['admin', 'artist', 'reader'] as const).map((role) => {
              const isActive = roleFilter.includes(role);
              const config = roleColors[role];
              return (
                <button
                  key={role}
                  onClick={() => toggleRoleFilter(role)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? `${config.bg} ${config.text} ring-2 ring-offset-2 ring-purple-500 dark:ring-offset-gray-800`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                  {isActive && ' ✓'}
                </button>
              );
            })}
            {roleFilter.length > 0 && (
              <button
                onClick={() => setColumnFilters((old) => old.filter((f) => f.id !== 'role'))}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing{' '}
            <span className="font-medium">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>{' '}
            of <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> users
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Rows:</label>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
          <Typography variant="h6" className="text-gray-900 dark:text-white">
            User Profile Details
          </Typography>
        </DialogTitle>
        <DialogContent className="bg-white dark:bg-gray-800 mt-4">
          {selectedUser && (
            <Box className="space-y-4">
              {/* Avatar and Name */}
              <div className="flex items-center gap-4 pb-4 border-b dark:border-gray-700">
                <Avatar
                  src={selectedUser.avatar_url || undefined}
                  alt={selectedUser.username}
                  sx={{ width: 80, height: 80 }}
                >
                  {selectedUser.username[0].toUpperCase()}
                </Avatar>
                <div>
                  <Typography variant="h6" className="text-gray-900 dark:text-white font-bold">
                    {selectedUser.full_name || selectedUser.username}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                    @{selectedUser.username}
                  </Typography>
                  <Chip
                    label={selectedUser.role}
                    size="small"
                    color={roleColors[selectedUser.role].chip}
                    sx={{ mt: 1 }}
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-3">
                <div>
                  <Typography variant="caption" className="text-gray-500 dark:text-gray-400 font-medium">
                    Bio
                  </Typography>
                  <Typography variant="body2" className="text-gray-900 dark:text-white mt-1">
                    {selectedUser.bio || 'No bio provided'}
                  </Typography>
                </div>

                <div>
                  <Typography variant="caption" className="text-gray-500 dark:text-gray-400 font-medium">
                    User ID
                  </Typography>
                  <Typography variant="body2" className="text-gray-900 dark:text-white mt-1 font-mono text-xs">
                    {selectedUser.id}
                  </Typography>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="caption" className="text-gray-500 dark:text-gray-400 font-medium">
                      Joined
                    </Typography>
                    <Typography variant="body2" className="text-gray-900 dark:text-white mt-1">
                      {format(new Date(selectedUser.created_at), 'PPP')}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="caption" className="text-gray-500 dark:text-gray-400 font-medium">
                      Last Updated
                    </Typography>
                    <Typography variant="body2" className="text-gray-900 dark:text-white mt-1">
                      {format(new Date(selectedUser.updated_at), 'PPP')}
                    </Typography>
                  </div>
                </div>
              </div>
            </Box>
          )}
        </DialogContent>
        <DialogActions className="bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
          <Button onClick={() => setViewModalOpen(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
          <Typography variant="h6" className="text-gray-900 dark:text-white">
            Edit User Role
          </Typography>
        </DialogTitle>
        <DialogContent className="bg-white dark:bg-gray-800 mt-4">
          {editingUser && (
            <Box className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b dark:border-gray-700">
                <Avatar src={editingUser.avatar_url || undefined} alt={editingUser.username}>
                  {editingUser.username[0].toUpperCase()}
                </Avatar>
                <div>
                  <Typography variant="subtitle1" className="text-gray-900 dark:text-white font-semibold">
                    {editingUser.full_name || editingUser.username}
                  </Typography>
                  <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                    @{editingUser.username}
                  </Typography>
                </div>
              </div>

              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedRole}
                  label="Role"
                  onChange={(e) => setSelectedRole(e.target.value as typeof selectedRole)}
                >
                  <MenuItem value="reader">Reader</MenuItem>
                  <MenuItem value="artist">Artist</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="caption" className="text-gray-600 dark:text-gray-400 block">
                Changing a user's role will affect their permissions and access level.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions className="bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
          <Button onClick={() => setEditModalOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            color="primary"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="bg-red-50 dark:bg-red-900/20 border-b dark:border-red-800">
          <Typography variant="h6" className="text-red-800 dark:text-red-200 font-bold">
            ⚠️ Delete User Account
          </Typography>
        </DialogTitle>
        <DialogContent className="bg-white dark:bg-gray-800 mt-4">
          {deletingUser && (
            <Box className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Avatar src={deletingUser.avatar_url || undefined} alt={deletingUser.username}>
                  {deletingUser.username[0].toUpperCase()}
                </Avatar>
                <div>
                  <Typography variant="subtitle1" className="text-gray-900 dark:text-white font-semibold">
                    {deletingUser.full_name || deletingUser.username}
                  </Typography>
                  <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                    @{deletingUser.username}
                  </Typography>
                  <Chip
                    label={deletingUser.role}
                    size="small"
                    color={roleColors[deletingUser.role].chip}
                    sx={{ ml: 1 }}
                  />
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <Typography variant="body2" className="text-red-800 dark:text-red-200 font-medium mb-2">
                  This action cannot be undone. Deleting this user will:
                </Typography>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                  <li>Permanently delete their account</li>
                  <li>Remove all their comics and chapters</li>
                  <li>Delete all their bookmarks and data</li>
                  <li>Remove all associated media files</li>
                </ul>
              </div>

              <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
                Are you absolutely sure you want to delete this user?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions className="bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
          <Button onClick={() => setDeleteModalOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      {snackbar.open && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-xl text-white ${
            snackbar.severity === 'success' ? 'bg-green-600' : 'bg-red-600'
          } animate-slide-up z-50`}
        >
          <div className="flex items-center gap-3">
            {snackbar.severity === 'success' ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="font-medium">{snackbar.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
