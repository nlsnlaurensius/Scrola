'use client';

import { useState } from 'react';
import { AdminComicTable } from '@/components/dashboard/AdminComicTable';
import { UserManagementTable } from './users/UserManagementTable';

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

interface AdminDashboardTabsProps {
  comics: Comic[];
  users: User[];
  currentUserId: string;
}

export function AdminDashboardTabs({ comics, users, currentUserId }: AdminDashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'comics' | 'users'>('comics');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('comics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'comics'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
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
              <span>Comics Management</span>
              <span className="ml-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {comics.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
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
              <span>User Management</span>
              <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {users.length}
              </span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card dark:shadow-card-dark border border-gray-100 dark:border-gray-700">
        {activeTab === 'comics' ? (
          <AdminComicTable comics={comics} />
        ) : (
          <UserManagementTable users={users} currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
}
