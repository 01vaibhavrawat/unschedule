'use client';
import React from 'react';
import { Menu, Search, HelpCircle, Settings, Grid, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Bell, Users as UsersIcon } from 'lucide-react';
import { format } from 'date-fns';

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
  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-glass-surface)] backdrop-blur-md px-6 py-4 sticky top-0 z-20 shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-5">
        <button id="sidebar-toggle-button" onClick={onMenuClick} className="rounded-xl p-2 text-[var(--color-text-secondary)] transition-all hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 pr-6 border-r border-[var(--color-border-subtle)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-purple)] text-white shadow-[var(--shadow-glow)]">
            <span className="font-bold text-sm">{format(new Date(), 'd')}</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-[var(--color-text-primary)] font-heading">Calendar</span>
        </div>

        <button
          onClick={onTodayClick}
          className="rounded-lg border border-[var(--color-border-strong)] px-4 py-1.5 text-xs font-semibold text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-bg-hover)] shadow-sm hover:shadow-md"
        >
          Today
        </button>

        <div className="flex items-center gap-1 bg-[var(--color-bg-surface-muted)] rounded-lg p-0.5 border border-[var(--color-border-subtle)]">
          <button onClick={onPrevClick} className="rounded-md p-1.5 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={onNextClick} className="rounded-md p-1.5 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <h2 className="ml-2 text-lg font-bold text-[var(--color-text-primary)] font-heading">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => window.location.href = '/notifications'}
          className="rounded-xl p-2 text-[var(--color-text-secondary)] transition-all hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-brand-primary)] relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {/* Unread dot indicator */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-brand-red)] rounded-full ring-2 ring-[var(--color-bg-surface)]"></span>
        </button>

        <div className="relative">
          <select
            value={currentView}
            onChange={(e) => onViewChange(e.target.value)}
            className="appearance-none cursor-pointer rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-surface-muted)] px-4 py-2 pr-8 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] transition-all shadow-sm"
          >
            <option value="timeGridDay">Day</option>
            <option value="timeGridWeek">Week</option>
            <option value="dayGridMonth">Month</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-text-secondary)]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
    </header>
  );
};
