"use client";
import React, { useState } from 'react';
import { useStore, MiniHabit } from '@/store/useStore';
import { format } from 'date-fns';
import { AssistantChat } from '@/components/AssistantChat';
import { BoardSection } from '@/components/BoardSection';
import { GoalsSection } from '@/components/GoalsSection';
import { MiniHabitsSection } from '@/components/MiniHabitsSection';
import { AtomicHabitModal } from '@/components/AtomicHabitModal';

export default function Home() {
  const {
    habits,
    habitLogs,
    streaks,
    toggleHabitLog,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    setHabitStatus,
    addHabit,
    updateHabit,
    deleteHabit,
  } = useStore();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();
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

  return (
    <div className="flex-1 flex overflow-hidden bg-gray-50/50">
      {/* Dashboard (60%) */}
      <div className="w-[60%] flex flex-col p-3 overflow-y-auto lg:overflow-hidden min-h-0">
        <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[1fr_1fr] gap-3">
          {/* Row 1: Board (Full width) */}
          <div className="lg:col-span-2 min-h-[260px] lg:min-h-0 h-full">
            <BoardSection />
          </div>

          {/* Row 2, Col 1: Goals & Priorities */}
          <div className="min-h-[260px] lg:min-h-0 h-full">
            <GoalsSection
              goals={goals}
              onAddGoal={addGoal}
              onUpdateGoal={updateGoal}
              onDeleteGoal={deleteGoal}
            />
          </div>

          {/* Row 2, Col 2: Atomic Habits */}
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
        </div>
      </div>

      {/* Assistant Chat (40%) */}
      <div className="w-[40%] flex flex-col relative z-10 border-l border-gray-100 bg-white">
        <AssistantChat isEmbedded={true} />
      </div>

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
