"use client";
import React, { useEffect, useState } from 'react';
import { useStore, Task } from '@/store/useStore';
import { format, isBefore, parseISO, startOfDay } from 'date-fns';
import { AssistantChat } from '@/components/AssistantChat';
import { Calendar, CheckCircle2, Zap, Circle, Clock } from 'lucide-react';
import { GoalsSection } from '@/components/GoalsSection';
import { MiniHabitsSection } from '@/components/MiniHabitsSection';

export default function Home() {
  const { user, tasks, habits, habitLogs, streaks, toggleHabitLog, updateTask, goals, addGoal, updateGoal, deleteGoal, setHabitStatus } = useStore();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();

  // Filter High-Priority / Due Tasks
  const priorityTasks = tasks.filter(t => {
    if (t.type !== 'task' || t.status === 'completed') return false;
    const taskDate = format(parseISO(t.start_time), 'yyyy-MM-dd');
    const isOverdue = isBefore(parseISO(t.start_time), startOfDay(now));
    return taskDate === todayStr || isOverdue;
  });

  const atomicHabitTasks = tasks.filter(t => t.type === 'atomic_habit');

  const toggleTaskStatus = (task: Task) => {
    updateTask(task._id, { status: task.status === 'completed' ? 'pending' : 'completed' });
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* Dashboard (60%) */}
      <div className="w-[60%] flex flex-col p-8 h-full">
        <div className="flex flex-col h-full gap-6">
          {/* First Row: Mini Habits and Goals */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-0">
            <div className="min-h-0 h-full flex flex-col">
              <MiniHabitsSection
                habits={habits}
                atomicHabitTasks={atomicHabitTasks}
                habitLogs={habitLogs}
                toggleHabitLog={toggleHabitLog}
                todayStr={todayStr}
                currentDate={now}
                streaks={streaks}
                setHabitStatus={setHabitStatus}
              />
            </div>

            <div className="min-h-0 h-full flex flex-col">
              <GoalsSection
                goals={goals}
                onAddGoal={addGoal}
                onUpdateGoal={updateGoal}
                onDeleteGoal={deleteGoal}
              />
            </div>
          </div>

          {/* Second Row: Focus Tasks */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col flex-1 min-h-0">
            <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2>Focus Tasks</h2>
            </div>
            {priorityTasks.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No pending tasks for today.</p>
            ) : (
              <div className="space-y-2 flex-1 overflow-y-auto pr-1 -mr-1">
                {priorityTasks.map(task => (
                  <div key={task._id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className="mt-0.5 text-gray-300 hover:text-emerald-500 transition-colors flex-shrink-0"
                    >
                      <Circle className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-700 block truncate">{task.title}</span>
                      {isBefore(parseISO(task.start_time), startOfDay(now)) && (
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Overdue</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assistant Chat (40%) */}
      <div className="w-[40%] flex flex-col relative z-10">
        <AssistantChat isEmbedded={true} />
      </div>
    </div>
  );
}
