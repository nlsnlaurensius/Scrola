'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { uploadPagesAction } from '@/app/dashboard/artist/comics/[id]/actions';

// ============================================
// CLIENT COMPONENT: PAGE UPLOAD FORM
// Multi-file upload for chapter pages
// ============================================

interface PageUploadFormProps {
  chapterId: string;
  comicId: string;
}

export function PageUploadForm({ chapterId, comicId }: PageUploadFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Validate files
    const validFiles = selectedFiles.filter((file) => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setError('Each file must be less than 10MB');
        return false;
      }
      return true;
    });

    setFiles(validFiles);

    // Generate previews
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (files.length === 0) {
      setError('Please select at least one image');
      return;
    }

    const formData = new FormData();
    formData.append('chapter_id', chapterId);
    formData.append('comic_id', comicId);

    files.forEach((file) => {
      formData.append('pages', file);
    });

    startTransition(async () => {
      const result = await uploadPagesAction(formData);

      if (result.success) {
        setSuccess(`Successfully uploaded ${result.count} page(s)`);
        setFiles([]);
        setPreviews([]);
        
        // Clear file input
        const fileInput = document.getElementById('page_upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        router.refresh();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to upload pages');
      }
    });
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Input */}
      <div>
        <label htmlFor="page_upload" className="block text-sm font-medium text-gray-700 mb-2">
          Select Images
        </label>
        <input
          type="file"
          id="page_upload"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={isPending}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
        />
        <p className="mt-1 text-sm text-gray-500">
          Select multiple images to upload. Max 10MB per image. Images will be added to the end of the chapter.
        </p>
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">{files.length} file(s) selected:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={isPending}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <p className="mt-1 text-xs text-gray-500 truncate">{files[index].name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Submit Button */}
      {files.length > 0 && (
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
              Uploading {files.length} page(s)...
            </>
          ) : (
            `Upload ${files.length} Page(s)`
          )}
        </button>
      )}
    </form>
  );
}
