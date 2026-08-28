"use client";
import React, { useEffect, useState } from 'react';
import { useStore, Task } from '@/store/useStore';
import { format, isBefore, parseISO, startOfDay } from 'date-fns';
import { AssistantChat } from '@/components/AssistantChat';
import { Calendar, CheckCircle2, Zap, Circle, Clock, Plus } from 'lucide-react';
import { GoalsSection } from '@/components/GoalsSection';
import { MiniHabitsSection } from '@/components/MiniHabitsSection';
import { TaskModal } from '@/components/TaskModal';

export default function Home() {
  const { user, tasks, habits, habitLogs, streaks, toggleHabitLog, updateTask, goals, addGoal, updateGoal, deleteGoal, setHabitStatus, addHabit, addTask } = useStore();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();
  const [taskModalOpen, setTaskModalOpen] = useState(false);

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

  const handleSaveTask = async (taskData: any) => {
    await addTask(taskData);
    setTaskModalOpen(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* Dashboard (60%) */}
      <div className="w-[60%] flex flex-col p-3 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {/* First Row: Mini Habits and Goals */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 min-h-[45vh]">
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
                onAddTask={addTask}
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
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col min-h-[30vh]">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h2>Focus Tasks</h2>
              </div>
              <button
                onClick={() => setTaskModalOpen(true)}
                title="Add task"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {priorityTasks.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No pending tasks for today.</p>
            ) : (
              <div className="space-y-2">
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

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        defaultType="task"
        hideTypeSelector={true}
      />
    </div>
  );
}
