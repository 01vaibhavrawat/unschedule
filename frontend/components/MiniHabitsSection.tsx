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
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-gray-900 font-bold">
          <Zap className="w-5 h-5 text-amber-500" />
          <h2>Atomic Habits</h2>
        </div>
        {onAddHabit && (
          <button
            onClick={onAddHabit}
            title="Add habit"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-2 text-sm">
        {habits.map(habit => {
          const streakCount = streaks[habit._id] || 0;
          const logs = habitLogs[habit._id] || [];
          const todayLog = logs.find((l: any) => l.date === todayStr);
          const isDone = todayLog?.status === 'completed' || todayLog?.completed === true;
          const isSkipped = todayLog?.status === 'skipped';
          return (
            <div
              key={habit._id}
              className={`group relative overflow-hidden rounded-xl p-3 shadow-sm transition-all hover:shadow-md border border-amber-100/50 ${isSkipped ? 'bg-gray-50 grayscale opacity-60' : 'bg-gradient-to-br from-amber-50 to-orange-50'}`}
            >
              <div className="absolute -right-4 -top-4 opacity-10">
                <Zap className="h-16 w-16 text-amber-600" />
              </div>
              <div className="relative z-10 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 min-w-0 flex-1 pr-2 cursor-pointer" onClick={() => setExpandedHabitId(prev => prev === habit._id ? null : habit._id)}>
                    <div className="flex items-center gap-1.5">
                      <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${expandedHabitId === habit._id ? 'rotate-90 text-gray-600' : 'text-gray-400'}`} />
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[11px] uppercase tracking-wider font-semibold text-gray-500 ${isDone ? 'opacity-50 line-through' : ''}`}>
                          {habit.trigger ? `When I ${habit.trigger}` : 'Atomic Habit'}
                        </span>
                        <span className={`truncate text-sm font-bold ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {habit.title ? `I will ${habit.title}` : habit.title}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pl-5 mt-1">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-xs shadow-inner">
                        🔥
                      </div>
                      <span className="text-xs font-bold text-orange-600 tracking-wide">
                        {streakCount} {streakCount === 1 ? 'Day Streak' : 'Day Streak'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 z-20">
                     <div className="flex items-center gap-2">
                       {onEditHabit && (
                         <button
                           onClick={(e) => { e.stopPropagation(); onEditHabit(habit); }}
                           className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-amber-600 transition-opacity"
                         >
                           <Edit2 className="h-4 w-4" />
                         </button>
                       )}
                       <button onClick={(e) => { e.stopPropagation(); toggleHabitLog(habit._id, todayStr); }} className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${isDone ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 bg-white text-transparent hover:border-amber-400'}`}>
                         <Check className="h-4 w-4" />
                       </button>
                     </div>
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex gap-1">
                       {!isSkipped && setHabitStatus && (
                         <button onClick={(e) => { e.stopPropagation(); setHabitStatus(habit._id, todayStr, 'skipped'); }} className="text-[10px] text-gray-500 hover:text-amber-600 font-medium bg-white rounded px-1.5 py-0.5 shadow-sm border border-gray-200">Skip</button>
                       )}
                       {isSkipped && setHabitStatus && (
                         <button onClick={(e) => { e.stopPropagation(); setHabitStatus(habit._id, todayStr, 'none'); }} className="text-[10px] text-gray-500 hover:text-amber-600 font-medium bg-white rounded px-1.5 py-0.5 shadow-sm border border-gray-200">Undo</button>
                       )}
                     </div>
                  </div>
                </div>
                {expandedHabitId === habit._id && (
                  <div className="mt-3 border-t border-amber-100/50 pt-3">
                    {habit.identity && (
                       <div className="mb-3 text-[12px] font-medium text-amber-700 bg-amber-100/50 p-2 rounded-lg text-center">
                         "{habit.identity}"
                       </div>
                    )}
                    <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-gray-600">
                      <span>{format(habitCalendarMonth, 'MMM yyyy')}</span>
                      <div className="flex gap-1">
                        <ChevronLeft className="h-4 w-4 cursor-pointer rounded hover:bg-white/50" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setHabitCalendarMonth(subMonths(habitCalendarMonth, 1)); }} />
                        <ChevronRight className="h-4 w-4 cursor-pointer rounded hover:bg-white/50" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setHabitCalendarMonth(addMonths(habitCalendarMonth, 1)); }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="font-medium text-gray-400">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center text-[10px]">
                      {habitDays.map((dayItem, i) => {
                        const dateStr = format(dayItem, 'yyyy-MM-dd');
                        const isCurrentMonth = isSameMonth(dayItem, habitCalendarMonth);
                        const log = logs.find((l: any) => l.date === dateStr);
                        const dayIsDone = log?.status === 'completed' || log?.completed === true;
                        const dayIsSkipped = log?.status === 'skipped';
                        
                        let bgClass = 'text-gray-500';
                        if (!isCurrentMonth) bgClass = 'opacity-30';
                        else if (dayIsDone) bgClass = 'bg-green-500 text-white font-bold rounded-full';
                        else if (dayIsSkipped) bgClass = 'bg-gray-300 text-gray-600 rounded-full';
                        else bgClass = 'hover:bg-white/60 rounded-full';
                        
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
          <div className="py-2 text-xs text-gray-400 italic">No habits yet</div>
        )}
      </div>
    </div>
  );
};
