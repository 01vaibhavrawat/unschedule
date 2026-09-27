'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, format, isSameMonth, subMonths, addMonths
} from 'date-fns';

interface SidebarProps {
  isOpen: boolean;
  onCreateClick: () => void;
  todayStr: string;
  onMiniCalendarSelect: (dateStr: string) => void;
  currentDate: Date;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCreateClick,
  todayStr,
  onMiniCalendarSelect,
  currentDate,
}) => {
  const [miniCalendarMonth, setMiniCalendarMonth] = useState(currentDate);
  useEffect(() => { setMiniCalendarMonth(currentDate); }, [currentDate]);

  const monthStart = startOfMonth(miniCalendarMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) { days.push(day); day = addDays(day, 1); }

  const handleMiniPrev = () => setMiniCalendarMonth(subMonths(miniCalendarMonth, 1));
  const handleMiniNext = () => setMiniCalendarMonth(addMonths(miniCalendarMonth, 1));

  return (
    <div className={`flex h-full flex-shrink-0 flex-col overflow-y-auto overflow-x-hidden bg-[var(--color-bg-surface)] transition-[width,opacity,border] duration-300 z-10 ${isOpen ? 'w-64 border-r border-[var(--color-border-subtle)] opacity-100' : 'w-0 border-none opacity-0'}`}>
      
      {/* Create Button */}
      <div className="p-5 border-b border-[var(--color-border-subtle)]">
        <button
          id="add-task-btn"
          onClick={onCreateClick}
          className="flex items-center gap-3 w-full rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-purple)] py-3 px-4 text-sm font-bold text-white shadow-[var(--shadow-glow)] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex h-5 w-5 items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          Create
          <ChevronDown className="ml-auto h-4 w-4 text-white/80" />
        </button>
      </div>


      {/* Mini Calendar */}
      <div className="px-6 pb-4 pt-4 border-t border-[var(--color-border-subtle)]">
        <div className="mb-2 flex items-center justify-between text-sm font-medium text-[var(--color-text-secondary)]">
          <span>{format(miniCalendarMonth, 'MMMM yyyy')}</span>
          <div className="flex gap-1">
            <ChevronLeft className="h-4 w-4 cursor-pointer rounded text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]" onClick={handleMiniPrev} />
            <ChevronRight className="h-4 w-4 cursor-pointer rounded text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]" onClick={handleMiniNext} />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="font-medium text-[var(--color-text-muted)]">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {days.map((dayItem, i) => {
            const isSelected = format(dayItem, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
            const isToday = format(dayItem, 'yyyy-MM-dd') === todayStr;
            const currentMonth = isSameMonth(dayItem, miniCalendarMonth);
            let bgClass = 'cursor-pointer rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]';
            if (isToday) bgClass = 'cursor-pointer rounded-full bg-[var(--color-brand-primary-hover)] text-[var(--color-text-inverse)]';
            else if (isSelected) bgClass = 'cursor-pointer rounded-full bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary-strong)]';
            else if (!currentMonth) bgClass = 'cursor-pointer rounded-full text-[var(--color-text-subtle)] hover:bg-[var(--color-bg-hover)]';
            return (
              <div
                key={i}
                onClick={() => onMiniCalendarSelect(format(dayItem, 'yyyy-MM-dd'))}
                className={`w-6 h-6 flex items-center justify-center mx-auto transition-colors ${bgClass}`}
              >
                {format(dayItem, 'd')}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
