import React, { useState, useEffect } from 'react';
import { Plus, Users, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, subMonths, addMonths } from 'date-fns';
import { MiniHabit } from '@/store/useStore';

interface SidebarProps {
  onCreateClick: () => void;
  goals: any[];
  habits: any[];
  habitLogs: Record<string, any[]>;
  toggleHabitLog: (id: string, date: string) => void;
  todayStr: string;
  onMiniCalendarSelect: (dateStr: string) => void;
  currentDate: Date;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onCreateClick,
  goals,
  habits,
  habitLogs,
  toggleHabitLog,
  todayStr,
  onMiniCalendarSelect,
  currentDate
}) => {
  const [habitsExpanded, setHabitsExpanded] = useState(true);
  const [goalsExpanded, setGoalsExpanded] = useState(true);
  
  const [miniCalendarMonth, setMiniCalendarMonth] = useState(currentDate);

  useEffect(() => {
    setMiniCalendarMonth(currentDate);
  }, [currentDate]);

  const monthStart = startOfMonth(miniCalendarMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const handleMiniPrev = () => setMiniCalendarMonth(subMonths(miniCalendarMonth, 1));
  const handleMiniNext = () => setMiniCalendarMonth(addMonths(miniCalendarMonth, 1));

  return (
    <div className="flex h-full w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-[var(--color-border-muted)] bg-[var(--color-bg-surface)]">
      {/* Create Button Area */}
      <div className="p-4">
        <button 
          onClick={onCreateClick}
          className="flex items-center gap-2 rounded-full border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] py-2 pl-2 pr-4 text-sm font-medium text-[var(--color-text-secondary)] shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-secondary)]">
            <svg width="36" height="36" viewBox="0 0 36 36"><path fill="var(--logo-green)" d="M16 16v14h4V20z"></path><path fill="var(--logo-blue)" d="M30 16H20l-4 4h14z"></path><path fill="var(--logo-yellow)" d="M6 16v4h10l4-4z"></path><path fill="var(--logo-red)" d="M20 16V6h-4v14z"></path><path fill="none" d="M0 0h36v36H0z"></path></svg>
          </div>
          Create
          <ChevronDown className="ml-1 h-4 w-4 text-[var(--color-text-muted)]" />
        </button>
      </div>

      {/* Mini Calendar */}
      <div className="px-6 pb-4 pt-2">
        <div className="mb-2 flex items-center justify-between text-sm font-medium text-[var(--color-text-secondary)]">
          <span>{format(miniCalendarMonth, 'MMMM yyyy')}</span>
          <div className="flex gap-1">
            <ChevronLeft className="h-4 w-4 cursor-pointer rounded text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]" onClick={handleMiniPrev} />
            <ChevronRight className="h-4 w-4 cursor-pointer rounded text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]" onClick={handleMiniNext} />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
          {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="font-medium text-[var(--color-text-muted)]">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {days.map((dayItem, i) => {
            const isSelected = format(dayItem, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
            const isToday = format(dayItem, 'yyyy-MM-dd') === todayStr;
            const currentMonth = isSameMonth(dayItem, miniCalendarMonth);
            
            let bgClass = 'cursor-pointer rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]';
            if (isToday) {
              bgClass = 'cursor-pointer rounded-full bg-[var(--color-brand-primary-hover)] text-[var(--color-text-inverse)]';
            } else if (isSelected) {
              bgClass = 'cursor-pointer rounded-full bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary-strong)]';
            } else if (!currentMonth) {
              bgClass = 'cursor-pointer rounded-full text-[var(--color-text-subtle)] hover:bg-[var(--color-bg-hover)]';
            }

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

      {/* Search People Placeholder */}
      <div className="border-b border-[var(--color-border-subtle)] px-4 py-2">
        <div className="flex items-center gap-3 rounded bg-[var(--color-bg-hover-subtle)] px-3 py-2 text-sm text-[var(--color-text-muted)]">
          <Users className="w-4 h-4" />
          <span>Search for people</span>
        </div>
      </div>

      {/* Habits Section (Replacing My Calendars) */}
      <div className="py-2">
        <div 
          className="group flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-[var(--color-bg-hover-subtle)]"
          onClick={() => setHabitsExpanded(!habitsExpanded)}
        >
          <div className="flex items-center gap-2">
            <ChevronDown className={`h-4 w-4 text-[var(--color-text-secondary)] transition-transform ${habitsExpanded ? '' : '-rotate-90'}`} />
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Mini Habits</span>
          </div>
        </div>
        
        {habitsExpanded && (
          <div className="pl-10 pr-4 py-1 space-y-1 text-sm">
            {habits.map(habit => {
              const logs = habitLogs[habit._id] || [];
              const isDone = logs.some(l => l.date === todayStr && l.completed);
              return (
                <div key={habit._id} className="flex items-center gap-3 py-1 cursor-pointer group" onClick={() => toggleHabitLog(habit._id, todayStr)}>
                  <div className={`flex h-4 w-4 items-center justify-center rounded border ${isDone ? 'border-[var(--color-brand-success)] bg-[var(--color-brand-success)]' : 'border-[var(--color-text-subtle)] group-hover:border-[var(--color-text-secondary)]'}`}>
                    {isDone && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`truncate ${isDone ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-secondary)]'}`}>{habit.title}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Goals Section (Replacing Other Calendars) */}
      <div className="border-t border-[var(--color-border-subtle)] py-2">
        <div 
          className="group flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-[var(--color-bg-hover-subtle)]"
          onClick={() => setGoalsExpanded(!goalsExpanded)}
        >
          <div className="flex items-center gap-2">
            <ChevronDown className={`h-4 w-4 text-[var(--color-text-secondary)] transition-transform ${goalsExpanded ? '' : '-rotate-90'}`} />
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Goals</span>
          </div>
        </div>
        
        {goalsExpanded && (
          <div className="pl-10 pr-4 py-1 space-y-2 text-sm">
             {goals.map((g, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                   <div className="h-3 w-3 rounded-sm bg-[var(--color-brand-purple)]"></div>
                   <span className="truncate text-[var(--color-text-secondary)]">{g.title}</span>
                </div>
             ))}
          </div>
        )}
      </div>

    </div>
  );
};

// Extracted from above to fix un-imported ChevronLeft
const ChevronLeft = ({ className, ...props }: any) => <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
