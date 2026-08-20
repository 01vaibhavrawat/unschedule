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
    <div className={`flex h-full flex-shrink-0 flex-col overflow-y-auto overflow-x-hidden bg-[var(--color-bg-surface)] transition-[width,opacity,border] duration-300 ${isOpen ? 'w-64 border-r border-[var(--color-border-muted)] opacity-100' : 'w-0 border-none opacity-0'}`}>
      
      {/* Create Button */}
      <div className="p-4 border-b border-[var(--color-border-subtle)]">
        <button
          id="add-task-btn"
          onClick={onCreateClick}
          className="flex items-center gap-2 rounded-full border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] py-2 pl-2 pr-4 text-sm font-medium text-[var(--color-text-secondary)] shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-text-secondary)]">
            <svg width="36" height="36" viewBox="0 0 36 36">
              <path fill="#5F8D4E" d="M16 16v14h4V20z" />
              <path fill="#5B8DEF" d="M30 16H20l-4 4h14z" />
              <path fill="#D4A93A" d="M6 16v4h10l4-4z" />
              <path fill="#D66A5E" d="M20 16V6h-4v14z" />
              <path fill="none" d="M0 0h36v36H0z" />
            </svg>
          </div>
          Create
          <ChevronDown className="ml-1 h-4 w-4 text-[var(--color-text-muted)]" />
        </button>
      </div>

      <div className="flex-1"></div>

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
