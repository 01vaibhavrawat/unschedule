"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, BookOpen, FileText, Home, LogOut } from 'lucide-react';
import { useStore } from '@/store/useStore';

export const NavigationRail = () => {
  const pathname = usePathname();
  const { user, logout } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // If there's no user, we might not want to show the navigation rail
  if (!user) return null;

  // Derive initials & avatar colour from name
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Calendar', href: '/calendar', icon: CalendarDays },
    { label: 'Journal', href: '/journal', icon: BookOpen },
    { label: 'Notes', href: '/notes', icon: FileText },
  ];

  return (
    <div className="w-16 h-full flex flex-col items-center py-4 bg-gray-50 border-r border-gray-200">


      <div className="flex flex-col gap-4 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`p-3 rounded-xl transition-all group relative ${isActive
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
            >
              <Icon className="w-6 h-6" />
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── User Menu ──────────────────────────────────────── */}
      <div className="relative mt-auto" ref={menuRef}>
        <button
          id="sidebar-user-menu-button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          style={{ background: 'linear-gradient(135deg, #5C415D 0%, #7a5a7c 100%)' }}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          aria-label="User menu"
        >
          {initials}
        </button>

        {menuOpen && (
          <div
            id="sidebar-user-menu-dropdown"
            className="absolute left-full bottom-0 z-50 ml-4 w-60 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden"
            style={{ boxShadow: '0 8px 30px rgba(92,65,93,0.15), 0 2px 8px rgba(0,0,0,0.08)' }}
            role="menu"
          >
            {/* User info */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #5C415D 0%, #7a5a7c 100%)' }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
                <p className="truncate text-xs text-gray-500">{user?.email || ''}</p>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              <hr className="my-1 border-gray-100" />
              <button
                id="sidebar-logout-button"
                onClick={() => { setMenuOpen(false); logout(); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                role="menuitem"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
