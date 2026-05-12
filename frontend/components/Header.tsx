'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, HelpCircle, Settings, Grid, Calendar as CalendarIcon, ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '@/store/useStore';

interface HeaderProps {
  currentDate: Date;
  currentView: string;
  onPrevClick: () => void;
  onNextClick: () => void;
  onTodayClick: () => void;
  onViewChange: (view: string) => void;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  currentView,
  onPrevClick,
  onNextClick,
  onTodayClick,
  onViewChange,
  onMenuClick
}) => {
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

  // Derive initials & avatar colour from name
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] px-4 py-2">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button id="sidebar-toggle-button" onClick={onMenuClick} className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)]">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 pr-8">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-brand-primary-hover)] text-[var(--color-text-inverse)]">
            <span className="font-bold text-lg">{format(new Date(), 'd')}</span>
          </div>
          <span className="text-xl font-medium tracking-tight text-[var(--color-text-secondary)]">Calendar</span>
        </div>

        <button
          onClick={onTodayClick}
          className="rounded border border-[var(--color-border-strong)] px-4 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover-subtle)]"
        >
          Today
        </button>

        <div className="flex items-center gap-1">
          <button onClick={onPrevClick} className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={onNextClick} className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)]">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <h2 className="ml-2 text-xl font-normal text-[var(--color-text-secondary)]">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* <button className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)]">
          <Search className="w-5 h-5" />
        </button> */}
        {/* <button className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)]">
          <HelpCircle className="w-5 h-5" />
        </button> */}
        {/* <button className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)]">
          <Settings className="w-5 h-5" />
        </button> */}

        <div className="mx-2">
          <select
            value={currentView}
            onChange={(e) => onViewChange(e.target.value)}
            className="cursor-pointer rounded border border-[var(--color-border-strong)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary-hover)]"
          >
            <option value="timeGridDay">Day</option>
            <option value="timeGridWeek">Week</option>
            <option value="dayGridMonth">Month</option>
          </select>
        </div>

        {/* <button className="ml-1 rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)]">
          <Grid className="w-5 h-5" />
        </button> */}

        {/* ── User Menu ──────────────────────────────────────── */}
        <div className="relative ml-2" ref={menuRef}>
          <button
            id="user-menu-button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:ring-offset-1"
            style={{ background: 'linear-gradient(135deg, #5C415D 0%, #7a5a7c 100%)' }}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-label="User menu"
          >
            {initials}
          </button>

          {menuOpen && (
            <div
              id="user-menu-dropdown"
              className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-[var(--color-border-muted)] bg-white shadow-xl overflow-hidden"
              style={{ boxShadow: '0 8px 30px rgba(92,65,93,0.15), 0 2px 8px rgba(0,0,0,0.08)' }}
              role="menu"
            >
              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
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
                {/* <button
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  role="menuitem"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  Profile settings
                </button> */}
                <button
                  id="logout-button"
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
    </header>
  );
};
