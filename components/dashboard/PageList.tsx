'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deletePageAction } from '@/app/dashboard/artist/comics/[id]/actions';
import { format } from 'date-fns';

// ============================================
// CLIENT COMPONENT: PAGE LIST
// Display and manage uploaded pages
// ============================================

interface Page {
  id: string;
  page_order: number;
  image_url: string;
  created_at: string;
}

interface PageListProps {
  pages: Page[];
  comicId: string;
}

export function PageList({ pages, comicId }: PageListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (pageId: string, pageOrder: number) => {
    if (!confirm(`Are you sure you want to delete Page ${pageOrder}?`)) {
      return;
    }

    setDeletingId(pageId);

    startTransition(async () => {
      const result = await deletePageAction(pageId, comicId);

      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to delete page');
      }

      setDeletingId(null);
    });
  };

  if (pages.length === 0) {
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No pages yet</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload images to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {pages.map((page) => (
        <div key={page.id} className="relative group">
          <div className="aspect-2/3 w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
            <img
              src={page.image_url}
              alt={`Page ${page.page_order}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all rounded-lg flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={() => handleDelete(page.id, page.page_order)}
              disabled={isPending && deletingId === page.id}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && deletingId === page.id ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </>
              )}
            </button>
          </div>

          {/* Page Info */}
          <div className="mt-2 text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Page {page.page_order}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(page.created_at), 'MMM dd, yyyy')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
