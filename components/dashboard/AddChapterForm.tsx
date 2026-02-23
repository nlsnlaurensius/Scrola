'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createChapterAction } from '@/app/dashboard/artist/comics/[id]/actions';

// ============================================
// CLIENT COMPONENT: ADD CHAPTER FORM
// ============================================

interface AddChapterFormProps {
  comicId: string;
  suggestedChapterNumber: number;
}

export function AddChapterForm({ comicId, suggestedChapterNumber }: AddChapterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [chapterNumber, setChapterNumber] = useState(suggestedChapterNumber);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('comic_id', comicId);
    formData.append('chapter_number', chapterNumber.toString());
    formData.append('title', title);

    startTransition(async () => {
      const result = await createChapterAction(formData);

      if (result.success) {
        router.push(`/dashboard/artist/comics/${comicId}`);
        router.refresh();
      } else {
        setError(result.error || 'Failed to create chapter');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Chapter Number */}
      <div>
        <label htmlFor="chapter_number" className="block text-sm font-medium text-gray-700 mb-2">
          Chapter Number
        </label>
        <input
          type="number"
          id="chapter_number"
          name="chapter_number"
          value={chapterNumber}
          onChange={(e) => setChapterNumber(parseInt(e.target.value) || 1)}
          min="1"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          The chapter number for ordering. Next available: {suggestedChapterNumber}
        </p>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Chapter Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., The Beginning"
          maxLength={200}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="mt-1 text-sm text-gray-500">{title.length}/200 characters</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating...
            </>
          ) : (
            'Create Chapter'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
