'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ThemeToggleCompact } from '@/components/ui/ThemeToggle';
import { 
  Home, 
  Book, 
  AddCircle as PlusCircle, 
  People as Users, 
  Logout as LogOut,
  Menu,
  Close as X
} from '@mui/icons-material';
import { useState } from 'react';

interface SidebarProps {
  role: 'artist' | 'admin';
  username: string;
  avatarUrl?: string;
}

export function Sidebar({ role, username, avatarUrl }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Navigation items based on role
  const artistMenuItems = [
    { 
      label: 'Dashboard', 
      href: '/dashboard/artist', 
      icon: Home 
    },
    { 
      label: 'My Comics', 
      href: '/dashboard/artist/comics', 
      icon: Book 
    },
    { 
      label: 'Create Comic', 
      href: '/dashboard/artist/comics/create', 
      icon: PlusCircle 
    },
  ];

  const adminMenuItems = [
    { 
      label: 'Dashboard', 
      href: '/dashboard/admin', 
      icon: Home 
    },
    { 
      label: 'All Comics', 
      href: '/dashboard/admin/comics', 
      icon: Book 
    },
    { 
      label: 'Users', 
      href: '/dashboard/admin/users', 
      icon: Users 
    },
  ];

  const menuItems = role === 'admin' ? adminMenuItems : artistMenuItems;

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/scrola-logo.png"
            alt="Scrola"
            width={110}
            height={38}
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-light/10 dark:bg-primary-dark/10 flex items-center justify-center">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={username} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-primary-light dark:text-primary-dark font-semibold">
                {username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark font-medium' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <Icon sx={{ fontSize: 20 }} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {/* Theme Toggle */}
        <div className="mb-2">
          <ThemeToggleCompact />
        </div>
        
        <Link
          href="/profile"
          onClick={() => setIsMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Users sx={{ fontSize: 20 }} />
          <span>Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut sx={{ fontSize: 20 }} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {isMobileOpen ? <X sx={{ fontSize: 24 }} /> : <Menu sx={{ fontSize: 24 }} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar for Mobile */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 z-40 w-64 h-full transition-transform duration-300
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
}
