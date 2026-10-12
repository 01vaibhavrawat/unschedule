'use client';
import React from 'react';
import { Menu, ChevronLeft, ChevronRight, Bell, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
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
  const { user, setUserMenuOpen } = useStore();
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-glass-surface)] backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3 sticky top-0 z-20 shadow-xs">
      {/* ── Main Top Bar ── */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left side: Menu, Title & Month */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            id="sidebar-toggle-button"
            onClick={onMenuClick}
            className="rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-all flex-shrink-0 cursor-pointer"
            aria-label="Toggle calendar sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 sm:pr-4 sm:border-r sm:border-[var(--color-border-subtle)] min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-purple)] text-white shadow-sm flex-shrink-0">
              <span className="font-bold text-xs sm:text-sm">{format(currentDate, 'd')}</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-[var(--color-text-primary)] font-heading truncate leading-tight">
                {format(currentDate, 'MMMM yyyy')}
              </h1>
              <p className="text-[11px] text-[var(--color-text-muted)] font-medium hidden sm:block">
                Weekly Planner
              </p>
            </div>
          </div>

          {/* Desktop Navigation Controls */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onTodayClick}
              className="rounded-lg border border-[var(--color-border-strong)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-all shadow-xs"
            >
              Today
            </button>

            <div className="flex items-center gap-0.5 bg-[var(--color-bg-surface-muted)] rounded-lg p-0.5 border border-[var(--color-border-subtle)]">
              <button
                onClick={onPrevClick}
                className="rounded-md p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                aria-label="Previous period"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNextClick}
                className="rounded-md p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                aria-label="Next period"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right side: View selector, Notifications & Mobile Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="relative">
            <select
              value={currentView}
              onChange={(e) => onViewChange(e.target.value)}
              className="appearance-none cursor-pointer rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-surface-muted)] px-3 py-1.5 sm:py-2 pr-7 text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] transition-all shadow-xs"
              aria-label="Select calendar view"
            >
              <option value="timeGridDay">Day</option>
              <option value="timeGridWeek">Week</option>
              <option value="dayGridMonth">Month</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-text-secondary)]">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <Link
            href="/notifications"
            className="rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-brand-primary)] transition-all relative flex-shrink-0"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-brand-red)] rounded-full ring-2 ring-[var(--color-bg-surface)]"></span>
          </Link>

          {user && (
            <button
              onClick={() => setUserMenuOpen(true)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm active:scale-95 transition-transform flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-purple) 100%)' }}
              aria-label="User settings"
            >
              {initials}
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile-Only Secondary Bar for Date Nav ── */}
      <div className="md:hidden flex items-center justify-between pt-2 mt-2 border-t border-[var(--color-border-subtle)] text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={onTodayClick}
            className="rounded-lg border border-[var(--color-border-strong)] px-2.5 py-1 font-semibold text-[var(--color-text-primary)] bg-[var(--color-bg-surface)] active:bg-[var(--color-bg-hover)]"
          >
            Today
          </button>
          <div className="flex items-center bg-[var(--color-bg-surface-muted)] rounded-lg border border-[var(--color-border-subtle)]">
            <button
              onClick={onPrevClick}
              className="p-1 text-[var(--color-text-secondary)] active:bg-[var(--color-bg-hover)] rounded-l-lg"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNextClick}
              className="p-1 text-[var(--color-text-secondary)] active:bg-[var(--color-bg-hover)] rounded-r-lg"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <span className="font-semibold text-[var(--color-text-secondary)]">
          {format(currentDate, 'EEE, MMM d')}
        </span>
      </div>
    </header>
  );
};
