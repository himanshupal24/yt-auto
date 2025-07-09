'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Settings, User, LogOut, Menu, X } from 'lucide-react';

interface NavbarProps {
  user?: {
    id: string;
    name?: string;
    email: string;
    avatarUrl?: string;
  } | null;
  onToggleSidebar?: () => void;
}

export default function Navbar({ user, onToggleSidebar }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Video upload completed', time: '2 min ago', read: false },
    { id: 2, message: 'New content downloaded', time: '10 min ago', read: false },
    { id: 3, message: 'Channel connected successfully', time: '1 hour ago', read: true },
  ]);
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="bg-red-600 text-white p-2 rounded-lg">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">AutoTube</span>
          </Link>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name || user.email}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                  <span className="text-sm text-gray-700 hidden md:block">
                    {user.name || user.email}
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b">
                        {user.email}
                      </div>
                      <Link
                        href={`/${user.id}/settings`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile user menu */}
      {user && isProfileOpen && (
        <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <Link
              href={`/${user.id}/settings`}
              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsProfileOpen(false)}
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}