// App constants

export const APP_NAME = 'Scrola';
export const APP_DESCRIPTION = 'Platform untuk membaca dan membuat komik online.';

// Genres
export const GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
] as const;

export type Genre = (typeof GENRES)[number];

// Comic status
export const COMIC_STATUS = {
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  HIATUS: 'hiatus',
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  ARTIST: 'artist',
  READER: 'reader',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

// File upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  COMICS: '/comics',
  COMIC_DETAIL: (id: string) => `/comics/${id}`,
  CHAPTER_DETAIL: (comicId: string, chapterId: string) =>
    `/comics/${comicId}/chapters/${chapterId}`,
  ARTIST_DASHBOARD: '/artist',
  ARTIST_COMICS: '/artist/comics',
  ARTIST_COMIC_DETAIL: (id: string) => `/artist/comics/${id}`,
  ARTIST_CHAPTERS: (comicId: string) => `/artist/comics/${comicId}/chapters`,
  ARTIST_CHAPTER_DETAIL: (comicId: string, chapterId: string) =>
    `/artist/comics/${comicId}/chapters/${chapterId}`,
  ADMIN_DASHBOARD: '/admin',
  ADMIN_COMICS: '/admin/comics',
  ADMIN_USERS: '/admin/users',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/signout',
    PROFILE: '/api/auth/profile',
  },
  COMICS: '/api/comics',
  CHAPTERS: '/api/chapters',
  BOOKMARKS: '/api/bookmarks',
} as const;

// Storage buckets
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  COVERS: 'covers',
  PAGES: 'pages',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Terjadi kesalahan. Silakan coba lagi.',
  UNAUTHORIZED: 'Anda tidak memiliki akses ke halaman ini.',
  NOT_FOUND: 'Halaman tidak ditemukan.',
  INVALID_EMAIL: 'Email tidak valid.',
  INVALID_PASSWORD: 'Password harus minimal 6 karakter.',
  EMAIL_TAKEN: 'Email sudah digunakan.',
  USERNAME_TAKEN: 'Username sudah digunakan.',
  LOGIN_FAILED: 'Email atau password salah.',
  NETWORK_ERROR: 'Koneksi bermasalah. Periksa internet Anda.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SIGNUP: 'Registrasi berhasil! Silakan login.',
  LOGIN: 'Login berhasil!',
  LOGOUT: 'Logout berhasil!',
  PROFILE_UPDATED: 'Profil berhasil diperbarui.',
  COMIC_CREATED: 'Komik berhasil dibuat.',
  COMIC_UPDATED: 'Komik berhasil diperbarui.',
  COMIC_DELETED: 'Komik berhasil dihapus.',
  CHAPTER_CREATED: 'Chapter berhasil dibuat.',
  CHAPTER_UPDATED: 'Chapter berhasil diperbarui.',
  CHAPTER_DELETED: 'Chapter berhasil dihapus.',
  BOOKMARK_ADDED: 'Ditambahkan ke bookmark.',
  BOOKMARK_REMOVED: 'Dihapus dari bookmark.',
} as const;
