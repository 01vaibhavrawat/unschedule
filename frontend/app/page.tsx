"use client";
import React, { useEffect } from 'react';
import { useStore, Task, MiniHabit } from '@/store/useStore';
import { CheckCircle2, User, Calendar, Plus, Trophy, Goal as GoalIcon } from 'lucide-react';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';

const DynamicCalendar = dynamic(() => import('@/components/CalendarComponent'), {
  ssr: false,
  loading: () => <div className="h-[700px] w-full bg-slate-900 animate-pulse rounded-xl flex items-center justify-center text-slate-500">Loading Calendar view...</div>
});

export default function Home() {
  const { tasks, habits, goals, habitLogs, streaks, fetchInitialData, toggleHabitLog, updateTask, addTask } = useStore();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* HEADER: Basic Stats */}
      <header className="flex justify-between items-center bg-card-bg border border-slate-700 p-4 rounded-xl shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Unschedule
          </h1>
          <p className="text-sm text-slate-400">Your daily momentum builder.</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-3xl font-black text-blue-400">{tasks.filter(t => t.status === 'completed').length}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tasks Done</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Goals & Habits */}
        <div className="flex flex-col gap-6 md:col-span-1">
          {/* GOALS */}
          <section className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <GoalIcon className="h-5 w-5 text-purple-400" /> Goals & Priorities
            </h2>
            <div className="space-y-3">
              {goals.length === 0 ? <p className="text-sm text-slate-400">No goals set.</p> : goals.map((goal, i) => (
                <div key={i} className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <h3 className="font-semibold text-sm">{goal.title}</h3>
                </div>
              ))}
              <button className="w-full text-sm py-2 rounded border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-colors">
                 + Add Goal
              </button>
            </div>
          </section>

          {/* MINI HABITS */}
          <section className="p-5 rounded-xl shadow border" style={{ backgroundColor: 'rgb(6, 78, 59, 0.3)', borderColor: 'var(--habit-border)' }}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--habit-text)' }}>
              <CheckCircle2 className="h-5 w-5" /> Mini Habits
            </h2>
            <div className="space-y-3">
              {habits.length === 0 ? <p className="text-sm text-emerald-600/50">Grow small daily routines.</p> : habits.map(habit => {
                const logs = habitLogs[habit._id] || [];
                const isDoneToday = logs.some((l: any) => l.date === today && l.completed);
                const currentStreak = streaks[habit._id] || 0;
                
                return (
                  <div key={habit._id} className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/50 border border-emerald-800 cursor-pointer hover:bg-emerald-900 transition-colors" onClick={() => toggleHabitLog(habit._id, today)}>
                    <div>
                      <h4 className="text-sm font-medium text-emerald-100">{habit.title}</h4>
                      <div className="text-xs text-emerald-400/70 mt-1 flex gap-2">
                        <span>Streak: {currentStreak} 🔥</span>
                      </div>
                    </div>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all ${isDoneToday ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-700'}`}>
                      {isDoneToday && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                )
              })}
              <button className="w-full text-sm py-2 rounded border border-dashed border-emerald-700 text-emerald-600 hover:text-emerald-400 hover:border-emerald-500 transition-colors">
                + Add Habit
              </button>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Weekly Calendar */}
        <div className="md:col-span-2">
          <section className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow h-full min-h-[500px]">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Calendar className="h-5 w-5 text-blue-400" /> Schedule
                </h2>
             </div>
             
             <DynamicCalendar 
                tasks={tasks}
                onUpdateTask={updateTask}
                onCreateTask={addTask}
             />
          </section>
        </div>

      </div>
    </main>
  );
}
