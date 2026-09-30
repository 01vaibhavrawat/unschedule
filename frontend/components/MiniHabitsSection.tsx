'use client';
import React, { useState, useEffect } from 'react';
import { Zap, ChevronRight, Check, MinusCircle, RotateCcw, ChevronLeft, Calendar, Plus, Edit2 } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, format, isSameMonth, subMonths, addMonths
} from 'date-fns';

export interface MiniHabitsSectionProps {
  habits: any[];
  habitLogs: Record<string, any[]>;
  toggleHabitLog: (id: string, date: string) => void;
  todayStr: string;
  currentDate: Date;
  streaks?: Record<string, number>;
  setHabitStatus?: (habitId: string, date: string, status: 'completed' | 'skipped' | 'none') => Promise<void>;
  onAddHabit?: () => void;
  onEditHabit?: (habit: any) => void;
}

export const MiniHabitsSection: React.FC<MiniHabitsSectionProps> = ({
  habits,
  habitLogs,
  toggleHabitLog,
  todayStr,
  currentDate,
  streaks = {},
  setHabitStatus,
  onAddHabit,
  onEditHabit,
}) => {
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [habitCalendarMonth, setHabitCalendarMonth] = useState(currentDate);

  useEffect(() => { setHabitCalendarMonth(currentDate); }, [currentDate]);

  const habitMonthStart = startOfMonth(habitCalendarMonth);
  const habitMonthEnd = endOfMonth(habitMonthStart);
  const habitStartDate = startOfWeek(habitMonthStart);
  const habitEndDate = endOfWeek(habitMonthEnd);

  const habitDays: Date[] = [];
  let habitDay = habitStartDate;
  while (habitDay <= habitEndDate) { habitDays.push(habitDay); habitDay = addDays(habitDay, 1); }

  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border-subtle)] p-4 shadow-sm flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between gap-2 mb-3 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Zap className="w-5 h-5 text-[var(--color-brand-break)] flex-shrink-0" />
          <h2 className="text-base font-bold text-[var(--color-text-primary)] truncate">Habits</h2>
          {habits.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-brand-break-soft)] text-[var(--color-brand-break)] border border-[var(--color-brand-break-soft)] flex-shrink-0">
              {habits.length}
            </span>
          )}
        </div>
        {onAddHabit && (
          <button
            onClick={onAddHabit}
            title="Add habit"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-brand-break-soft)] hover:text-[var(--color-brand-break)] transition-colors flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 space-y-2 text-sm">
        {habits.map(habit => {
          const streakCount = streaks[habit._id] || 0;
          const logs = habitLogs[habit._id] || [];
          const todayLog = logs.find((l: any) => l.date === todayStr);
          const isDone = todayLog?.status === 'completed' || todayLog?.completed === true;
          const isSkipped = todayLog?.status === 'skipped';
          return (
            <div
              key={habit._id}
              className={`group relative overflow-hidden rounded-xl p-3 shadow-sm transition-all hover:shadow-md border border-[var(--color-brand-break-soft)] ${isSkipped ? 'bg-[var(--color-bg-surface-muted)] grayscale opacity-60' : 'bg-gradient-to-br from-[var(--color-bg-surface)] to-[var(--color-brand-break-soft)]'}`}
            >
              <div className="absolute -right-4 -top-4 opacity-10">
                <Zap className="h-16 w-16 text-[var(--color-brand-break)]" />
              </div>
              <div className="relative z-10 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 min-w-0 flex-1 pr-2 cursor-pointer" onClick={() => setExpandedHabitId(prev => prev === habit._id ? null : habit._id)}>
                    <div className="flex items-center gap-1.5">
                      <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${expandedHabitId === habit._id ? 'rotate-90 text-[var(--color-text-secondary)]' : 'text-[var(--color-text-muted)]'}`} />
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-secondary)] ${isDone ? 'opacity-50 line-through' : ''}`}>
                          {habit.trigger ? `When I ${habit.trigger}` : 'Habit'}
                        </span>
                        <span className={`truncate text-sm font-bold ${isDone ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-primary)]'}`}>
                          {habit.title ? `I will ${habit.title}` : habit.title}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pl-5 mt-1">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand-break-soft)] text-xs shadow-inner">
                        🔥
                      </div>
                      <span className="text-xs font-bold text-[var(--color-brand-break)] tracking-wide">
                        {streakCount} {streakCount === 1 ? 'Day Streak' : 'Day Streak'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 z-20">
                     <div className="flex items-center gap-2">
                       {onEditHabit && (
                         <button
                           onClick={(e) => { e.stopPropagation(); onEditHabit(habit); }}
                           className="opacity-0 group-hover:opacity-100 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-brand-break)] transition-opacity"
                         >
                           <Edit2 className="h-4 w-4" />
                         </button>
                       )}
                       <button onClick={(e) => { e.stopPropagation(); toggleHabitLog(habit._id, todayStr); }} className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${isDone ? 'bg-[var(--color-brand-success)] border-[var(--color-brand-success)] text-white' : 'border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] text-transparent hover:border-[var(--color-brand-break)]'}`}>
                         <Check className="h-4 w-4" />
                       </button>
                     </div>
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex gap-1">
                       {!isSkipped && setHabitStatus && (
                         <button onClick={(e) => { e.stopPropagation(); setHabitStatus(habit._id, todayStr, 'skipped'); }} className="text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-break)] font-medium bg-[var(--color-bg-surface)] rounded px-1.5 py-0.5 shadow-sm border border-[var(--color-border-default)]">Skip</button>
                       )}
                       {isSkipped && setHabitStatus && (
                         <button onClick={(e) => { e.stopPropagation(); setHabitStatus(habit._id, todayStr, 'none'); }} className="text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-break)] font-medium bg-[var(--color-bg-surface)] rounded px-1.5 py-0.5 shadow-sm border border-[var(--color-border-default)]">Undo</button>
                       )}
                     </div>
                  </div>
                </div>
                {expandedHabitId === habit._id && (
                  <div className="mt-3 border-t border-[var(--color-brand-break-soft)] pt-3">
                    {habit.identity && (
                       <div className="mb-3 text-[12px] font-medium text-[var(--color-brand-break)] bg-[var(--color-brand-break-soft)] p-2 rounded-lg text-center">
                         "{habit.identity}"
                       </div>
                    )}
                    <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-[var(--color-text-secondary)]">
                      <span>{format(habitCalendarMonth, 'MMM yyyy')}</span>
                      <div className="flex gap-1">
                        <ChevronLeft className="h-4 w-4 cursor-pointer rounded hover:bg-[var(--color-bg-surface)]/50" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setHabitCalendarMonth(subMonths(habitCalendarMonth, 1)); }} />
                        <ChevronRight className="h-4 w-4 cursor-pointer rounded hover:bg-[var(--color-bg-surface)]/50" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setHabitCalendarMonth(addMonths(habitCalendarMonth, 1)); }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="font-medium text-[var(--color-text-muted)]">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center text-[10px]">
                      {habitDays.map((dayItem, i) => {
                        const dateStr = format(dayItem, 'yyyy-MM-dd');
                        const isCurrentMonth = isSameMonth(dayItem, habitCalendarMonth);
                        const log = logs.find((l: any) => l.date === dateStr);
                        const dayIsDone = log?.status === 'completed' || log?.completed === true;
                        const dayIsSkipped = log?.status === 'skipped';
                        
                        let bgClass = 'text-[var(--color-text-secondary)]';
                        if (!isCurrentMonth) bgClass = 'opacity-30';
                        else if (dayIsDone) bgClass = 'bg-[var(--color-brand-success)] text-white font-bold rounded-full';
                        else if (dayIsSkipped) bgClass = 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] rounded-full';
                        else bgClass = 'hover:bg-[var(--color-bg-surface)]/60 rounded-full';
                        
                        return (
                          <div key={i} className={`w-5 h-5 flex items-center justify-center mx-auto transition-colors ${bgClass}`} title={`${dateStr}${dayIsDone ? ' (Completed)' : dayIsSkipped ? ' (Skipped)' : ''}`}>
                            {format(dayItem, 'd')}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {habits.length === 0 && (
          <div className="py-2 text-xs text-[var(--color-text-muted)] italic">No habits yet</div>
        )}
      </div>
    </div>
  );
};
