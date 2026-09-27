"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, BookOpen, FileText, Home, LogOut, Moon, Sun } from 'lucide-react';
import { useStore } from '@/store/useStore';

export const NavigationRail = () => {
  const pathname = usePathname();
  const { user, logout, theme, toggleTheme } = useStore();
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
    <div className="w-16 h-full flex flex-col items-center py-6 bg-[var(--color-bg-surface)] border-r border-[var(--color-border-subtle)] z-20">
      {/* Brand logo could go here */}
      <div className="w-10 h-10 mb-8 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-purple)] flex items-center justify-center shadow-[var(--shadow-glow)]">
        <span className="text-white font-bold text-lg leading-none">U</span>
      </div>

      <div className="flex flex-col gap-4 flex-1 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`p-3 rounded-xl transition-all duration-300 group relative flex justify-center items-center ${isActive
                  ? 'bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
                }`}
            >
              <Icon className="w-5 h-5" />
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--color-brand-primary)] rounded-r-md" />
              )}
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[var(--color-bg-surface-muted)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
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
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-[var(--shadow-glow)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] ring-offset-2 ring-offset-[var(--color-bg-surface)]"
          style={{ background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-purple) 100%)' }}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          aria-label="User menu"
        >
          {initials}
        </button>

        {menuOpen && (
          <div
            id="sidebar-user-menu-dropdown"
            className="absolute left-full bottom-0 z-50 ml-4 w-60 rounded-xl border border-[var(--color-border-muted)] bg-[var(--color-bg-glass-surface)] backdrop-blur-xl shadow-2xl overflow-hidden"
            role="menu"
          >
            {/* User info */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-soft)]">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-purple) 100%)' }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--color-text-primary)]">{user?.name || 'User'}</p>
                <p className="truncate text-xs text-[var(--color-text-secondary)]">{user?.email || ''}</p>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-2">
              <div
                onClick={() => toggleTheme()}
                className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] cursor-pointer group"
                role="menuitem"
                title="Toggle Theme"
              >
                <div className="flex items-center gap-3">
                  {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                {/* Switch Visual */}
                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-[var(--color-brand-primary)]' : 'bg-[var(--color-border-strong)]'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${theme === 'dark' ? 'translate-x-[18px]' : 'translate-x-1'}`} />
                </div>
              </div>
              <button
                id="sidebar-logout-button"
                onClick={() => { setMenuOpen(false); logout(); }}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-brand-red)] transition-colors hover:bg-[var(--color-brand-red-soft)]"
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
