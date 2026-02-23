'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { updateComicStatusAction, deleteComicAdminAction } from '@/app/dashboard/admin/actions';

// ============================================
// CLIENT COMPONENT: ADMIN COMIC TABLE
// Manage all comics across platform
// ============================================

interface Comic {
  id: string;
  title: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  genre: string[];
  view_count: number;
  created_at: string;
  cover_url?: string | null;
  profiles?: {
    username: string;
    avatar_url?: string | null;
  };
}

interface AdminComicTableProps {
  comics: Comic[];
}

export function AdminComicTable({ comics }: AdminComicTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const handleStatusChange = async (comicId: string, newStatus: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('comic_id', comicId);
      formData.append('status', newStatus);

      const result = await updateComicStatusAction(formData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Status updated successfully',
          severity: 'success',
        });
        router.refresh();
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to update status',
          severity: 'error',
        });
      }

      setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 3000);
    });
  };

  const handleDelete = async (comicId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will delete all chapters and pages.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteComicAdminAction(comicId);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Comic deleted successfully',
          severity: 'success',
        });
        router.refresh();
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to delete comic',
          severity: 'error',
        });
      }

      setTimeout(() => setSnackbar((prev) => ({ ...prev, open: false })), 3000);
    });
  };

  const columns: ColumnDef<Comic>[] = [
    {
      accessorKey: 'cover_url',
      header: 'Cover',
      cell: ({ row }) => (
        <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden shrink-0">
          {row.original.cover_url ? (
            <img
              src={row.original.cover_url}
              alt={row.original.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-gray-900">{row.original.title}</p>
          <p className="text-sm text-gray-500">
            by {row.original.profiles?.username || 'Unknown'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'genre',
      header: 'Genres',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.genre.slice(0, 2).map((g) => (
            <span
              key={g}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
            >
              {g}
            </span>
          ))}
          {row.original.genre.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              +{row.original.genre.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <select
          value={row.original.status}
          onChange={(e) => handleStatusChange(row.original.id, e.target.value)}
          disabled={isPending}
          className={`px-3 py-1 rounded-lg text-sm font-medium border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            row.original.status === 'ongoing'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : row.original.status === 'completed'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-orange-50 text-orange-700 border-orange-200'
          }`}
        >
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="hiatus">On Hiatus</option>
        </select>
      ),
    },
    {
      accessorKey: 'view_count',
      header: 'Views',
      cell: ({ row }) => (
        <span className="text-gray-700">{row.original.view_count.toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-gray-600 text-sm">
          {format(new Date(row.original.created_at), 'MMM dd, yyyy')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/comics/${row.original.id}`}
            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
          >
            View
          </Link>
          <button
            onClick={() => handleDelete(row.original.id, row.original.title)}
            disabled={isPending}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: comics,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  if (comics.length === 0) {
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No comics yet</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comics will appear here once created by artists.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Search and Filters */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search comics, artists..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <select
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="hiatus">On Hiatus</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              comics.length
            )}{' '}
            of {comics.length} comics
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Show:</label>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            Next
          </button>
        </div>
      </div>

      {/* Snackbar */}
      {snackbar.open && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${
            snackbar.severity === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {snackbar.message}
        </div>
      )}
    </div>
  );
}
