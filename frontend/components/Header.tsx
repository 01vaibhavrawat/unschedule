import React from 'react';
import { Menu, Search, HelpCircle, Settings, Grid, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface HeaderProps {
  currentDate: Date;
  currentView: string;
  onPrevClick: () => void;
  onNextClick: () => void;
  onTodayClick: () => void;
  onViewChange: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  currentView,
  onPrevClick,
  onNextClick,
  onTodayClick,
  onViewChange
}) => {
  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] px-4 py-2">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)]">
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
        <button className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)]">
          <Search className="w-5 h-5" />
        </button>
        <button className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)]">
          <HelpCircle className="w-5 h-5" />
        </button>
        <button className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)]">
          <Settings className="w-5 h-5" />
        </button>
        
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
        
        <button className="ml-2 rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)]">
          <Grid className="w-5 h-5" />
        </button>
        
        <div className="ml-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--color-brand-teal)] font-medium text-[var(--color-text-inverse)]">
          V
        </div>
      </div>
    </header>
  );
};
