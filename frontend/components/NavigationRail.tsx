"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, BookOpen, FileText, Home, LogOut, Moon, Sun, Sparkles, Bell, X, User } from 'lucide-react';
import { useStore } from '@/store/useStore';

export const NavigationRail = () => {
  const pathname = usePathname();
  const { user, logout, theme, toggleTheme, assistantOpen, setAssistantOpen, userMenuOpen, setUserMenuOpen } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside on desktop
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeMobileMenu = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  if (!user) return null;

  // Derive initials
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Calendar', href: '/calendar', icon: CalendarDays },
    { label: 'Journal', href: '/journal', icon: BookOpen },
    { label: 'Notes', href: '/notes', icon: FileText },
  ];

  const handleAssistantClick = () => {
    setAssistantOpen(!assistantOpen);
  };

  return (
    <>
      {/* ──────────────────────────────────────────────────────────
          DESKTOP NAVIGATION RAIL (Left vertical bar)
          Visible on md screens and up (>=768px)
      ────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-16 h-full flex-col items-center py-6 bg-[var(--color-bg-surface)] border-r border-[var(--color-border-subtle)] z-30 flex-shrink-0">
        {/* Brand logo */}
        <Link href="/" className="w-10 h-10 mb-8 rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-purple)] flex items-center justify-center shadow-[var(--shadow-glow)] transition-transform hover:scale-105" title="Moola Home">
          <span className="text-white font-bold text-lg leading-none">M</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex flex-col gap-3 flex-1 w-full px-2" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-3 rounded-xl transition-all duration-300 group relative flex justify-center items-center ${
                  isActive
                    ? 'bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--color-brand-primary)] rounded-r-md" />
                )}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[var(--color-bg-surface-muted)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] text-xs font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg pointer-events-none">
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Menu Button */}
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

          {/* Desktop User Dropdown */}
          {menuOpen && (
            <div
              id="sidebar-user-menu-dropdown"
              className="absolute left-full bottom-0 z-50 ml-3 w-64 rounded-2xl border border-[var(--color-border-muted)] bg-[var(--color-bg-glass-surface)] backdrop-blur-2xl shadow-2xl overflow-hidden"
              role="menu"
            >
              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-soft)]">
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
              <div className="p-2 space-y-1">
                <div
                  onClick={() => toggleTheme()}
                  className="flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] cursor-pointer group"
                  role="menuitem"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                    <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                  <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-[var(--color-brand-primary)]' : 'bg-[var(--color-border-strong)]'}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${theme === 'dark' ? 'translate-x-[18px]' : 'translate-x-1'}`} />
                  </div>
                </div>

                <Link
                  href="/notifications"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                  role="menuitem"
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </Link>

                <div className="border-t border-[var(--color-border-subtle)] my-1"></div>

                <button
                  id="sidebar-logout-button"
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-brand-red)] transition-colors hover:bg-[var(--color-brand-red-soft)] cursor-pointer"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────
          MOBILE TOP APP BAR (Only on mobile for Home / Dashboard)
          Gives quick brand, notifications, and profile access
      ────────────────────────────────────────────────────────── */}
      {pathname === '/' && (
        <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-purple)] flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm leading-none">M</span>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-[var(--color-text-primary)]">Moola</span>
              <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-brand-primary)] bg-[var(--color-brand-primary-soft)] px-1.5 py-0.5 rounded-md">MVP</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleTheme()}
              className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] active:scale-95 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            <Link
              href="/notifications"
              className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] active:scale-95 transition-all relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-brand-red)] rounded-full ring-2 ring-[var(--color-bg-surface)]"></span>
            </Link>

            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm ml-1 active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-purple) 100%)' }}
              aria-label="User settings"
            >
              {initials}
            </button>
          </div>
        </header>
      )}

      {/* ──────────────────────────────────────────────────────────
          MOBILE BOTTOM NAVIGATION BAR
          Fixed to bottom on screens < 768px
      ────────────────────────────────────────────────────────── */}
      <nav 
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--color-bg-glass-surface)]/95 backdrop-blur-2xl border-t border-[var(--color-border-subtle)] pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.3)] transition-all"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around px-2 py-1.5 h-14">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all ${
              pathname === '/'
                ? 'text-[var(--color-brand-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold leading-tight">Home</span>
          </Link>

          {/* Calendar */}
          <Link
            href="/calendar"
            className={`flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all ${
              pathname === '/calendar'
                ? 'text-[var(--color-brand-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <CalendarDays className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold leading-tight">Calendar</span>
          </Link>

          {/* Center AI Assistant Button */}
          <button
            onClick={handleAssistantClick}
            className="flex flex-col items-center justify-center -mt-4 group focus:outline-none"
            aria-label="Open AI Assistant"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-[var(--shadow-glow)] transition-all group-active:scale-95 border border-white/20 ${
              assistantOpen
                ? 'bg-gradient-to-br from-[var(--color-brand-purple)] to-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)]'
                : 'bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-purple)]'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[var(--color-brand-primary)] mt-1">AI</span>
          </button>

          {/* Journal */}
          <Link
            href="/journal"
            className={`flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all ${
              pathname === '/journal'
                ? 'text-[var(--color-brand-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold leading-tight">Journal</span>
          </Link>

          {/* Notes */}
          <Link
            href="/notes"
            className={`flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all ${
              pathname === '/notes'
                ? 'text-[var(--color-brand-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-semibold leading-tight">Notes</span>
          </Link>
        </div>
      </nav>

      {/* ──────────────────────────────────────────────────────────
          MOBILE USER MENU MODAL / SHEET
      ────────────────────────────────────────────────────────── */}
      {(menuOpen || userMenuOpen) && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md bg-[var(--color-bg-surface)] border-t border-[var(--color-border-subtle)] rounded-t-3xl p-5 pb-safe shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300">
            {/* Grab handle */}
            <div className="w-12 h-1.5 bg-[var(--color-border-strong)] rounded-full mx-auto -mt-1 mb-2" />

            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm"
                  style={{ background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-purple) 100%)' }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-[var(--color-text-primary)]">{user?.name || 'User'}</p>
                  <p className="truncate text-xs text-[var(--color-text-secondary)]">{user?.email || ''}</p>
                </div>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div
                onClick={() => toggleTheme()}
                className="flex w-full items-center justify-between p-3.5 rounded-xl bg-[var(--color-bg-surface-muted)] text-sm font-semibold text-[var(--color-text-primary)] active:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                  <span>Theme: {theme === 'light' ? 'Light' : 'Dark'}</span>
                </div>
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-[var(--color-brand-primary)]' : 'bg-[var(--color-border-strong)]'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${theme === 'dark' ? 'translate-x-[22px]' : 'translate-x-1'}`} />
                </div>
              </div>

              <Link
                href="/notifications"
                onClick={closeMobileMenu}
                className="flex w-full items-center gap-3 p-3.5 rounded-xl bg-[var(--color-bg-surface-muted)] text-sm font-semibold text-[var(--color-text-primary)] active:bg-[var(--color-bg-hover)] transition-colors"
              >
                <Bell className="w-5 h-5 text-[var(--color-brand-primary)]" />
                <span>Notifications</span>
              </Link>

              <button
                onClick={() => { closeMobileMenu(); logout(); }}
                className="flex w-full items-center justify-center gap-2 p-3.5 rounded-xl bg-[var(--color-brand-red-soft)] text-sm font-bold text-[var(--color-brand-red)] active:opacity-80 transition-colors mt-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
