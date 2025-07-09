'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Video,
  Image,
  Upload,
  Settings,
  Edit3,
  Youtube,
  FolderOpen,
  BarChart3,
  Clock,
  Zap
} from 'lucide-react';

interface SidebarProps {
  userId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  description?: string;
}

export default function Sidebar({ userId, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  if (!userId) {
    return null;
  }

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview and analytics'
    },
    {
      name: 'Channels',
      href: `/${userId}/channels`,
      icon: Youtube,
      description: 'Manage YouTube channels'
    },
    {
      name: 'Content',
      href: `/${userId}/content`,
      icon: FolderOpen,
      description: 'Manage your content library'
    },
    {
      name: 'Posts',
      href: `/${userId}/content/posts`,
      icon: Image,
      description: 'Downloaded Instagram posts'
    },
    {
      name: 'Videos',
      href: `/${userId}/content/videos`,
      icon: Video,
      description: 'Generated videos'
    },
    {
      name: 'Editor',
      href: `/${userId}/editor`,
      icon: Edit3,
      description: 'Video editing tools'
    },
    {
      name: 'Upload',
      href: `/${userId}/upload`,
      icon: Upload,
      description: 'Upload to YouTube'
    },
    {
      name: 'Settings',
      href: `/${userId}/settings`,
      icon: Settings,
      description: 'App preferences'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <span className="text-lg font-semibold text-gray-900">Menu</span>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`group flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon
                      className={`flex-shrink-0 h-5 w-5 mr-3 ${
                        active ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Videos Created</span>
                  <span className="font-medium text-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Posts Downloaded</span>
                  <span className="font-medium text-gray-900">45</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Channels Connected</span>
                  <span className="font-medium text-gray-900">2</span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-6 p-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg text-white">
              <div className="flex items-center mb-2">
                <Zap className="h-5 w-5 mr-2" />
                <span className="font-medium">Need Help?</span>
              </div>
              <p className="text-sm text-red-100 mb-3">
                Check out our guides and tutorials to get the most out of AutoTube.
              </p>
              <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors">
                View Documentation
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-2" />
              <span>Last sync: 2 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}