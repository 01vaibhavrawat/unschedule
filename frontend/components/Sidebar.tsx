'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, X, Plus } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, format, isSameMonth, subMonths, addMonths
} from 'date-fns';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onCreateClick: () => void;
  todayStr: string;
  onMiniCalendarSelect: (dateStr: string) => void;
  currentDate: Date;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
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

  const handleDateClick = (dateStr: string) => {
    onMiniCalendarSelect(dateStr);
    if (onClose) onClose();
  };

  const handleCreate = () => {
    onCreateClick();
    if (onClose) onClose();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col overflow-y-auto overflow-x-hidden bg-[var(--color-bg-surface)]">
      {/* Mobile Drawer Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)]">
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">Calendar Options</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Create Button */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-border-subtle)]">
        <button
          id="add-task-btn"
          onClick={handleCreate}
          className="flex items-center justify-center gap-2.5 w-full rounded-xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-purple)] py-3 px-4 text-sm font-bold text-white shadow-[var(--shadow-glow)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Mini Calendar */}
      <div className="px-5 pb-4 pt-4">
        <div className="mb-3 flex items-center justify-between text-sm font-semibold text-[var(--color-text-primary)]">
          <span>{format(miniCalendarMonth, 'MMMM yyyy')}</span>
          <div className="flex gap-1">
            <button
              onClick={handleMiniPrev}
              className="p-1 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleMiniNext}
              className="p-1 rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="font-semibold text-[var(--color-text-muted)] text-[11px]">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {days.map((dayItem, i) => {
            const isSelected = format(dayItem, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
            const isToday = format(dayItem, 'yyyy-MM-dd') === todayStr;
            const currentMonth = isSameMonth(dayItem, miniCalendarMonth);
            let bgClass = 'cursor-pointer rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]';
            if (isToday) bgClass = 'cursor-pointer rounded-full bg-[var(--color-brand-primary)] text-white font-bold shadow-xs';
            else if (isSelected) bgClass = 'cursor-pointer rounded-full bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary)] font-bold';
            else if (!currentMonth) bgClass = 'cursor-pointer rounded-full text-[var(--color-text-muted)]/50 hover:bg-[var(--color-bg-hover)]';
            return (
              <button
                key={i}
                onClick={() => handleDateClick(format(dayItem, 'yyyy-MM-dd'))}
                className={`w-7 h-7 flex items-center justify-center mx-auto transition-colors text-xs ${bgClass}`}
              >
                {format(dayItem, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Inline Sidebar */}
      <aside className={`hidden md:flex h-full flex-shrink-0 flex-col transition-[width,opacity] duration-300 z-10 ${
        isOpen ? 'w-64 border-r border-[var(--color-border-subtle)] opacity-100' : 'w-0 border-none opacity-0 overflow-hidden'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Modal Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-250 border-r border-[var(--color-border-subtle)]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
