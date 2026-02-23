# Scrola 

Web app untuk baca komik dengan sistem role-based access.

## Tech Stack

- **Next.js 15** (App Router)
- **Supabase** (Auth, PostgreSQL, Storage)
- **Material-UI** + **Tailwind CSS**
- **TanStack Table v8** (untuk data table)
- **TypeScript**

## Fitur Utama

### Authentication & Authorization
- Login/Register pakai Supabase Auth
- Role-Based Access Control (RBAC):
  - **Admin**: Moderasi user dan komik
  - **Artist**: Upload dan manage komik sendiri
  - **Reader**: Baca dan bookmark komik

### CRUD Operations
- **Komik**: Create, edit, delete komik (Artist/Admin)
- **Chapter**: Manage chapter per komik
- **Pages**: Upload multiple image files ke Supabase Storage
- **Bookmarks**: Simpan komik favorit

### Data Management
- **TanStack Table** dengan fitur:
  - Pagination
  - Multi-column sorting
  - Global search
  - Dynamic page size
- Implementasi di dashboard Artist dan Admin

### Database & Security
- **Row Level Security (RLS)**: Policy-based access control di level database
- **Remote Procedure Call (RPC)**: Function untuk increment view count
- 5 tabel custom: `profiles`, `comics`, `chapters`, `pages`, `bookmarks`
- Storage bucket untuk cover image dan chapter pages

### UI/UX
- Dark/Light mode toggle
- Responsive design (mobile-first)
- Server Components untuk performa optimal

## Setup Local

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd scrola
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   Buat file `.env.local` di root folder, isi dengan kredensial Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Setup database**
   
   - Buka Supabase SQL Editor
   - Import file `schema.sql` yang ada di root project
   - Jalankan query untuk buat tables dan RLS policies

5. **Run development server**
   ```bash
   npm run dev
   ```
   
   Buka [http://localhost:3000](http://localhost:3000)

## Project Structure

```
scrola/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login, register
│   ├── (dashboard)/       # Admin & Artist dashboard
│   ├── comics/            # Public comic pages
│   └── profile/           # User profile & bookmarks
├── components/            # React components
│   ├── dashboard/         # Table components (TanStack)
│   ├── comics/            # Comic-related UI
│   └── layout/            # Header, Footer
├── services/              # Business logic layer
├── hooks/                 # Custom React hooks
├── lib/                   # Utils & Supabase config
└── types/                 # TypeScript definitions
```

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Database Schema

- **profiles**: User data + role
- **comics**: Comic metadata + artist relation
- **chapters**: Chapter info per comic
- **pages**: Image URLs per chapter
- **bookmarks**: User favorites (many-to-many)

Detail lengkap ada di `schema.sql` dan `TECHNICAL_DOCUMENTATION.md`.

## Notes

- RLS policies aktif di semua tabel untuk security
- Upload file limited per Supabase Storage quota
- TypeScript strict mode enabled
- Beberapa type assertion (`as any`) dipake karena issue Supabase type generation
