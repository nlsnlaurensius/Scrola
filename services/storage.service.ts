import { createClient } from '@/lib/supabase/client';

export class StorageService {
  private supabase = createClient();

  // Helper to generate unique filename
  private generateFileName(file: File): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `${timestamp}-${randomString}.${extension}`;
  }

  // Upload avatar
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileName = this.generateFileName(file);
    const filePath = `avatars/${userId}/${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from('comic-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('comic-assets').getPublicUrl(filePath);

    return publicUrl;
  }

  // Upload comic cover
  async uploadCover(comicId: string, file: File): Promise<string> {
    const fileName = this.generateFileName(file);
    const filePath = `covers/${comicId}/${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from('comic-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('comic-assets').getPublicUrl(filePath);

    return publicUrl;
  }

  // Upload chapter page
  async uploadPage(chapterId: string, file: File, pageOrder: number): Promise<string> {
    const fileName = `page-${pageOrder}-${this.generateFileName(file)}`;
    const filePath = `pages/${chapterId}/${fileName}`;

    const { error: uploadError } = await this.supabase.storage
      .from('comic-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('comic-assets').getPublicUrl(filePath);

    return publicUrl;
  }

  // Upload multiple pages
  async uploadPages(
    chapterId: string,
    files: File[]
  ): Promise<{ url: string; order: number }[]> {
    const uploadPromises = files.map(async (file, index) => {
      const url = await this.uploadPage(chapterId, file, index + 1);
      return { url, order: index + 1 };
    });

    return Promise.all(uploadPromises);
  }

  // Delete file from storage
  async deleteFile(filePath: string) {
    const { error } = await this.supabase.storage
      .from('comic-assets')
      .remove([filePath]);

    if (error) throw error;
  }

  // Get public URL
  getPublicUrl(filePath: string): string {
    const {
      data: { publicUrl },
    } = this.supabase.storage.from('comic-assets').getPublicUrl(filePath);

    return publicUrl;
  }

  // Extract file path from URL
  extractFilePath(url: string): string {
    const urlParts = url.split('/');
    const storageIndex = urlParts.findIndex((part) => part === 'storage');
    if (storageIndex === -1) return '';

    // Get everything after bucket name
    return urlParts.slice(storageIndex + 4).join('/');
  }
}

export const storageService = new StorageService();
