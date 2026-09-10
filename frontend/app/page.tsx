"use client";
import React, { useEffect, useState } from 'react';
import { useStore, Task } from '@/store/useStore';
import { format, isBefore, parseISO, startOfDay } from 'date-fns';
import { AssistantChat } from '@/components/AssistantChat';
import { Calendar, CheckCircle2, Zap, Circle, Clock, Plus } from 'lucide-react';
import { GoalsSection } from '@/components/GoalsSection';
import { MiniHabitsSection } from '@/components/MiniHabitsSection';
import { TaskModal } from '@/components/TaskModal';
import { AtomicHabitModal } from '@/components/AtomicHabitModal';
import { MiniHabit } from '@/store/useStore';
import { BoardSection } from '@/components/BoardSection';

export default function Home() {
  const { user, tasks, habits, habitLogs, streaks, toggleHabitLog, updateTask, deleteTask, goals, addGoal, updateGoal, deleteGoal, setHabitStatus, addHabit, updateHabit, deleteHabit, addTask } = useStore();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<MiniHabit | null>(null);

  // Filter and Sort Tasks
  const sortedTasks = [...tasks].filter(t => t.type !== 'atomic_habit').sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  const handleSaveHabit = async (habitData: any) => {
    if (editingHabit) {
      await updateHabit(editingHabit._id, habitData);
    } else {
      await addHabit(habitData);
    }
    setHabitModalOpen(false);
  };

  const handleDeleteHabit = async () => {
    if (editingHabit) {
      await deleteHabit(editingHabit._id);
    }
    setHabitModalOpen(false);
  };

  const openCreateHabitModal = () => {
    setEditingHabit(null);
    setHabitModalOpen(true);
  };

  const handleEditHabitClick = (habit: MiniHabit) => {
    setEditingHabit(habit);
    setHabitModalOpen(true);
  };

  const toggleTaskStatus = (task: Task) => {
    updateTask(task._id, { status: task.status === 'completed' ? 'pending' : 'completed' });
  };

  const handleSaveTask = async (taskData: any) => {
    if (editingTask) {
      const { _id, user_id, ...rest } = editingTask as any;
      updateTask(editingTask._id, { ...rest, ...taskData });
    } else {
      await addTask(taskData);
    }
    setTaskModalOpen(false);
  };

  const handleDeleteTask = () => {
    if (editingTask) {
      deleteTask(editingTask._id);
    }
    setTaskModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* Dashboard (60%) */}
      <div className="w-[60%] flex flex-col p-3 overflow-y-auto">
        <div className="flex flex-col gap-3 h-full">
          {/* First Row: Board */}
          <div className="flex-1 min-h-[200px]">
            <BoardSection />
          </div>

          {/* Second Row: Mini Habits and Goals */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 flex-1 min-h-[200px]">
            <div className="min-h-0 h-full flex flex-col">
              <MiniHabitsSection
                habits={habits}
                habitLogs={habitLogs}
                toggleHabitLog={toggleHabitLog}
                todayStr={todayStr}
                currentDate={now}
                streaks={streaks}
                setHabitStatus={setHabitStatus}
                onAddHabit={openCreateHabitModal}
                onEditHabit={handleEditHabitClick}
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

          {/* Third Row: Focus Tasks */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col flex-1 min-h-[200px]">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h2>Focus Tasks</h2>
              </div>
              <button
                onClick={openCreateModal}
                title="Add task"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {sortedTasks.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No tasks found. Click "+" to create one.</p>
            ) : (
              <div className="space-y-2 overflow-y-auto min-h-0 pr-1">
                {sortedTasks.map(task => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task._id}
                      className={`flex items-start gap-3 p-3 border rounded-xl transition-all cursor-pointer hover:shadow-sm ${isCompleted ? 'border-gray-100 opacity-60 bg-gray-50' : 'border-gray-100 hover:border-emerald-200 bg-white'
                        }`}
                      onClick={() => handleEditClick(task)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskStatus(task);
                        }}
                        className={`mt-0.5 transition-colors flex-shrink-0 ${isCompleted ? 'text-emerald-500' : 'text-gray-300 hover:text-emerald-500'
                          }`}
                      >
                        <Circle className={`w-5 h-5 ${isCompleted ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium block truncate ${isCompleted ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{format(new Date(task.start_time), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{format(new Date(task.start_time), 'h:mm a')} - {format(new Date(task.end_time), 'h:mm a')}</span>
                          </div>
                          {isBefore(parseISO(task.start_time), startOfDay(now)) && !isCompleted && (
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Overdue</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
        onDelete={handleDeleteTask}
        editingTask={editingTask}
        defaultType="task"
        hideTypeSelector={true}
      />
      <AtomicHabitModal
        isOpen={habitModalOpen}
        onClose={() => setHabitModalOpen(false)}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
        editingHabit={editingHabit}
        onToggleHabit={toggleHabitLog}
        habitLogs={habitLogs}
        streaks={streaks}
        todayStr={todayStr}
      />
    </div>
  );
}
