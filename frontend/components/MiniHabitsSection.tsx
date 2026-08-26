'use client';
import React, { useState, useEffect } from 'react';
import { Zap, ChevronRight, Check, MinusCircle, RotateCcw, ChevronLeft, Calendar } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, format, isSameMonth, subMonths, addMonths
} from 'date-fns';

export interface MiniHabitsSectionProps {
  habits: any[];
  atomicHabitTasks: any[];
  habitLogs: Record<string, any[]>;
  toggleHabitLog: (id: string, date: string) => void;
  todayStr: string;
  currentDate: Date;
  streaks?: Record<string, number>;
  setHabitStatus?: (habitId: string, date: string, status: 'completed' | 'skipped' | 'none') => Promise<void>;
}

export const MiniHabitsSection: React.FC<MiniHabitsSectionProps> = ({
  habits,
  atomicHabitTasks,
  habitLogs,
  toggleHabitLog,
  todayStr,
  currentDate,
  streaks = {},
  setHabitStatus,
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
      <div className="flex items-center gap-2 mb-3 text-gray-900 font-bold">
        <Zap className="w-5 h-5 text-amber-500" />
        <h2>Mini Habits</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-2 text-sm">
        {habits.map(habit => {
          const logs = habitLogs[habit._id] || [];
          const todayLog = logs.find((l: any) => l.date === todayStr);
          const isDone = todayLog?.status === 'completed' || todayLog?.completed === true;
          const isSkipped = todayLog?.status === 'skipped';
          return (
            <div key={habit._id} className={`flex flex-col py-1 group ${isSkipped ? 'opacity-50 grayscale' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0" onClick={() => { toggleHabitLog(habit._id, todayStr); setExpandedHabitId(prev => prev === habit._id ? null : habit._id); }}>
                  <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${expandedHabitId === habit._id ? 'rotate-90 text-gray-700' : 'text-gray-300 group-hover:text-gray-400'}`} />
                  <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${isDone ? 'border-amber-500 bg-amber-500' : 'border-gray-300 group-hover:border-gray-500'}`}>
                    {isDone && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`truncate ${isDone ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{habit.title}</span>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity items-center">
                  {!isSkipped && setHabitStatus && (
                     <button onClick={(e) => { e.stopPropagation(); setHabitStatus(habit._id, todayStr, 'skipped'); }} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 flex-shrink-0" title="Skip today">
                       <MinusCircle className="w-3 h-3" />
                     </button>
                  )}
                  {isSkipped && setHabitStatus && (
                     <button onClick={(e) => { e.stopPropagation(); setHabitStatus(habit._id, todayStr, 'none'); }} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 flex-shrink-0" title="Undo skip">
                       <RotateCcw className="w-3 h-3" />
                     </button>
                  )}
                </div>
              </div>
              {expandedHabitId === habit._id && (
                <div className="mt-3 px-2 pb-2 pl-7">
                  <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-gray-600">
                    <span>{format(habitCalendarMonth, 'MMM yyyy')}</span>
                    <div className="flex gap-1">
                      <ChevronLeft className="h-4 w-4 cursor-pointer rounded hover:bg-gray-100" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setHabitCalendarMonth(subMonths(habitCalendarMonth, 1)); }} />
                      <ChevronRight className="h-4 w-4 cursor-pointer rounded hover:bg-gray-100" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setHabitCalendarMonth(addMonths(habitCalendarMonth, 1)); }} />
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
                      else if (dayIsDone) bgClass = 'bg-amber-500 text-white font-bold rounded-full';
                      else if (dayIsSkipped) bgClass = 'bg-gray-200 text-gray-500 rounded-full';
                      else bgClass = 'hover:bg-gray-100 rounded-full';
                      
                      return (
                        <div key={i} className={`w-4 h-4 flex items-center justify-center mx-auto transition-colors ${bgClass}`} title={`${dateStr}${dayIsDone ? ' (Completed)' : dayIsSkipped ? ' (Skipped)' : ''}`}>
                          {format(dayItem, 'd')}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {atomicHabitTasks.length > 0 && (
          <div className={habits.length > 0 ? 'pt-2 space-y-2' : 'space-y-2'}>
            {atomicHabitTasks.map((task: any) => {
              const streakCount = streaks[task._id] || 0;
              const logs = habitLogs[task._id] || [];
              const todayLog = logs.find((l: any) => l.date === todayStr);
              const isDone = todayLog?.status === 'completed' || todayLog?.completed === true;
              const isSkipped = todayLog?.status === 'skipped';
              return (
                <div
                  key={task._id}
                  className={`group relative overflow-hidden rounded-xl p-3 shadow-sm transition-all hover:shadow-md border border-indigo-100/50 ${isSkipped ? 'bg-gray-50 grayscale opacity-60' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}
                >
                  <div className="absolute -right-4 -top-4 opacity-10">
                    <Zap className="h-16 w-16 text-indigo-600" />
                  </div>
                  <div className="relative z-10 flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1 min-w-0 flex-1 pr-2 cursor-pointer" onClick={() => { toggleHabitLog(task._id, todayStr); setExpandedHabitId(prev => prev === task._id ? null : task._id); }}>
                        <div className="flex items-center gap-1.5">
                          <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${expandedHabitId === task._id ? 'rotate-90 text-gray-600' : 'text-gray-400'}`} />
                          <span className={`truncate text-sm font-semibold ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 pl-5">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-xs shadow-inner">
                            🔥
                          </div>
                          <span className="text-xs font-bold text-orange-600 tracking-wide">
                            {streakCount} {streakCount === 1 ? 'Day Streak' : 'Day Streak'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1 z-20">
                         <button onClick={() => toggleHabitLog(task._id, todayStr)} className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${isDone ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 bg-white text-transparent hover:border-indigo-400'}`}>
                           <Check className="h-4 w-4" />
                         </button>
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                           {!isSkipped && setHabitStatus && (
                             <button onClick={(e) => { e.stopPropagation(); setHabitStatus(task._id, todayStr, 'skipped'); }} className="text-[10px] text-gray-500 hover:text-indigo-600 font-medium bg-white rounded px-1.5 py-0.5 shadow-sm border border-gray-200">Skip</button>
                           )}
                           {isSkipped && setHabitStatus && (
                             <button onClick={(e) => { e.stopPropagation(); setHabitStatus(task._id, todayStr, 'none'); }} className="text-[10px] text-gray-500 hover:text-indigo-600 font-medium bg-white rounded px-1.5 py-0.5 shadow-sm border border-gray-200">Undo</button>
                           )}
                         </div>
                      </div>
                    </div>
                    {expandedHabitId === task._id && (
                      <div className="mt-3 border-t border-indigo-100/50 pt-3">
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
          </div>
        )}

        {habits.length === 0 && atomicHabitTasks.length === 0 && (
          <div className="py-2 text-xs text-gray-400 italic">No habits yet</div>
        )}
      </div>
    </div>
  );
};
