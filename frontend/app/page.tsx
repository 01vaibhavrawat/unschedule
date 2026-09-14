"use client";
import React, { useState } from 'react';
import { useStore, Task, MiniHabit } from '@/store/useStore';
import { format } from 'date-fns';
import { AssistantChat } from '@/components/AssistantChat';
import { BoardSection } from '@/components/BoardSection';
import { GoalsSection } from '@/components/GoalsSection';
import { MiniHabitsSection } from '@/components/MiniHabitsSection';
import { FocusTasksSection } from '@/components/FocusTasksSection';
import { TaskModal } from '@/components/TaskModal';
import { AtomicHabitModal } from '@/components/AtomicHabitModal';

export default function Home() {
  const {
    tasks,
    habits,
    habitLogs,
    streaks,
    toggleHabitLog,
    updateTask,
    deleteTask,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    setHabitStatus,
    addHabit,
    updateHabit,
    deleteHabit,
    addTask,
  } = useStore();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<MiniHabit | null>(null);

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
    <div className="flex-1 flex overflow-hidden bg-gray-50/50">
      {/* Dashboard (60%) */}
      <div className="w-[60%] flex flex-col p-3 overflow-y-auto lg:overflow-hidden min-h-0">
        <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-2 grid-rows-none lg:grid-rows-2 gap-3">
          {/* Row 1, Col 1: Board */}
          <div className="min-h-[260px] lg:min-h-0 h-full">
            <BoardSection />
          </div>

          {/* Row 1, Col 2: Goals & Priorities */}
          <div className="min-h-[260px] lg:min-h-0 h-full">
            <GoalsSection
              goals={goals}
              onAddGoal={addGoal}
              onUpdateGoal={updateGoal}
              onDeleteGoal={deleteGoal}
            />
          </div>

          {/* Row 2, Col 1: Atomic Habits */}
          <div className="min-h-[260px] lg:min-h-0 h-full">
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

          {/* Row 2, Col 2: Focus Tasks */}
          <div className="min-h-[260px] lg:min-h-0 h-full">
            <FocusTasksSection
              tasks={tasks}
              onToggleTaskStatus={toggleTaskStatus}
              onEditTask={handleEditClick}
              onAddTask={openCreateModal}
            />
          </div>
        </div>
      </div>

      {/* Assistant Chat (40%) */}
      <div className="w-[40%] flex flex-col relative z-10 border-l border-gray-100 bg-white">
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
