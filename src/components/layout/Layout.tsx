/**
 * Main layout component with navigation
 */

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
// import { useSession, signOut } from 'next-auth/react'; // DEMO: Disabled for competition
import { useDemoSession as useSession, signOut } from '@/src/lib/demo-session';
import { Sparkles, Shirt, User, Settings, PlusCircle, LogOut } from 'lucide-react';
import { cn } from '@/src/utils';

export interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  // DEMO: Skip signin page check for competition

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // DEMO: Always show content for competition

  const navigation = [
    {
      name: 'Wardrobe',
      href: '/wardrobe',
      icon: Shirt,
      current: router.pathname.startsWith('/wardrobe')
    },
    {
      name: 'Style Me',
      href: '/style',
      icon: Sparkles,
      current: router.pathname.startsWith('/style')
    },
    {
      name: 'Add Items',
      href: '/add',
      icon: PlusCircle,
      current: router.pathname.startsWith('/add')
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      current: router.pathname.startsWith('/profile')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  AI Stylist
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-8">
              {session ? (
                <>
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                          item.current
                            ? 'text-purple-600 bg-purple-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  
                  {/* User Menu */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {session.user?.image && (
                        <img
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span>{session.user?.name}</span>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : null /* DEMO: Hide sign-in button for competition */}
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center">
              <button className="text-gray-600 hover:text-gray-900 p-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium',
                    item.current
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center py-2 text-xs font-medium',
                  item.current
                    ? 'text-purple-600'
                    : 'text-gray-600'
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Padding for mobile bottom nav */}
      <div className="sm:hidden h-16" />
    </div>
  );
};

export default Layout;