"use client";
import React, { useState, useEffect } from 'react';
import { useStore, MiniHabit } from '@/store/useStore';
import { format } from 'date-fns';
import { AssistantChat } from '@/components/AssistantChat';
import { BoardSection } from '@/components/BoardSection';
import { GoalsSection } from '@/components/GoalsSection';
import { MiniHabitsSection } from '@/components/MiniHabitsSection';
import { AtomicHabitModal } from '@/components/AtomicHabitModal';
import { LayoutDashboard, Sparkles } from 'lucide-react';

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
    assistantOpen,
    setAssistantOpen,
  } = useStore();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const now = new Date();
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<MiniHabit | null>(null);
  const [mobileTab, setMobileTab] = useState<'planner' | 'assistant'>('planner');

  // Sync mobileTab with assistantOpen state when triggered from bottom bar
  useEffect(() => {
    if (assistantOpen) {
      setMobileTab('assistant');
    }
  }, [assistantOpen]);

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
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[var(--color-bg-surface-muted)]/50">
      
      {/* ── Mobile Tab Switcher (Visible on < md screens) ── */}
      <div className="md:hidden px-3 pt-2 pb-1.5 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] shrink-0 z-10">
        <div className="flex bg-[var(--color-bg-surface-muted)] p-1 rounded-xl shadow-inner max-w-md mx-auto">
          <button
            onClick={() => {
              setMobileTab('planner');
              setAssistantOpen(false);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'planner'
                ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[var(--color-brand-primary)]" />
            <span>Planner</span>
          </button>
          <button
            onClick={() => {
              setMobileTab('assistant');
              setAssistantOpen(true);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'assistant'
                ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-purple)]" />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>

      {/* ── Planner / Dashboard Section ── */}
      <div 
        className={`flex-col min-h-0 overflow-y-auto transition-all ${
          // On desktop (md+): takes 60% and always visible
          // On mobile (<md): full width, visible only when planner tab is active
          mobileTab === 'planner'
            ? 'flex flex-1 md:w-[60%] p-3 sm:p-4 pb-24 md:pb-3'
            : 'hidden md:flex md:w-[60%] p-3 sm:p-4 pb-3'
        }`}
      >
        <div className="min-h-0 flex flex-col md:grid md:grid-cols-2 md:grid-rows-[1fr_1fr] gap-3 sm:gap-4 flex-1">
          {/* Row 1: Board (Full width) */}
          <div className="md:col-span-2 min-h-[220px] sm:min-h-[260px] md:min-h-0 flex flex-col">
            <BoardSection />
          </div>

          {/* Row 2, Col 1: Goals & Priorities */}
          <div className="min-h-[220px] sm:min-h-[260px] md:min-h-0 flex flex-col">
            <GoalsSection
              goals={goals}
              onAddGoal={addGoal}
              onUpdateGoal={updateGoal}
              onDeleteGoal={deleteGoal}
            />
          </div>

          {/* Row 2, Col 2: Atomic Habits */}
          <div className="min-h-[220px] sm:min-h-[260px] md:min-h-0 flex flex-col">
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

      {/* ── AI Assistant Chat Section ── */}
      <div 
        className={`flex-col relative z-10 border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] ${
          // On desktop (md+): takes 40% and always visible
          // On mobile (<md): full width and visible only when assistant tab is active
          mobileTab === 'assistant'
            ? 'flex flex-1 w-full md:w-[40%] pb-16 md:pb-0'
            : 'hidden md:flex md:w-[40%]'
        }`}
      >
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
