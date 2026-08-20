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
  const [greeting, setGreeting] = useState('');

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();

  useEffect(() => {
    const hour = now.getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Filter Agenda (Events for today)
  const todaysEvents = tasks.filter(t => {
    if (t.type !== 'event') return false;
    const taskDate = format(parseISO(t.start_time), 'yyyy-MM-dd');
    return taskDate === todayStr;
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

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
      <div className="w-[60%] flex flex-col p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {greeting}{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-gray-500 font-medium">Here's what you need to focus on today, {format(now, 'EEEE, MMMM do')}.</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Today's Agenda */}
          <div className="xl:col-span-2 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-indigo-900 font-bold">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h2>Today's Agenda</h2>
            </div>
            {todaysEvents.length === 0 ? (
              <p className="text-sm text-indigo-400/80 italic">No events scheduled for today.</p>
            ) : (
              <div className="space-y-3">
                {todaysEvents.map(event => (
                  <div key={event._id} className="flex items-center gap-4 p-3 bg-white/60 rounded-xl border border-white">
                    <div className="flex flex-col items-center justify-center bg-indigo-100 text-indigo-700 rounded-lg w-16 py-1.5 flex-shrink-0">
                      <span className="text-xs font-bold">{format(parseISO(event.start_time), 'HH:mm')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-800 truncate">{event.title}</h3>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          {format(parseISO(event.start_time), 'h:mm a')} - {format(parseISO(event.end_time), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* High Priority Tasks */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h2>Focus Tasks</h2>
            </div>
            {priorityTasks.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No pending tasks for today.</p>
            ) : (
              <div className="space-y-2 flex-1">
                {priorityTasks.map(task => (
                  <div key={task._id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                    <button 
                      onClick={() => toggleTaskStatus(task)}
                      className="mt-0.5 text-gray-300 hover:text-emerald-500 transition-colors"
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

          <GoalsSection
            goals={goals}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
            onDeleteGoal={deleteGoal}
          />

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
      </div>

      {/* Assistant Chat (40%) */}
      <div className="w-[40%] flex flex-col relative z-10">
        <AssistantChat isEmbedded={true} />
      </div>
    </div>
  );
}
