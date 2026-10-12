import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AtomicHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: {
    title: string;
    trigger: string;
    identity?: string;
    frequency: string[];
  }) => void;
  onDelete?: () => void;
  editingHabit?: {
    _id?: string;
    title: string;
    trigger?: string;
    identity?: string;
    frequency?: string[];
  } | null;
  onToggleHabit?: (habitId: string, date: string) => Promise<void>;
  habitLogs?: Record<string, any[]>;
  streaks?: Record<string, number>;
  todayStr?: string;
}

export const AtomicHabitModal: React.FC<AtomicHabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingHabit,
  onToggleHabit,
  habitLogs,
  streaks = {},
  todayStr,
}) => {
  const [title, setTitle] = useState('');
  const [trigger, setTrigger] = useState('');
  const [identity, setIdentity] = useState('');
  
  // We'll default to all days (Daily) for atomic habits
  const allDays = ['0', '1', '2', '3', '4', '5', '6'];
  const [frequency, setFrequency] = useState<string[]>(allDays);

  useEffect(() => {
    if (!isOpen) return;

    if (editingHabit) {
      setTitle(editingHabit.title || '');
      setTrigger(editingHabit.trigger || '');
      setIdentity(editingHabit.identity || '');
      setFrequency(editingHabit.frequency && editingHabit.frequency.length > 0 ? editingHabit.frequency : allDays);
    } else {
      setTitle('');
      setTrigger('');
      setIdentity('');
      setFrequency(allDays);
    }
  }, [isOpen, editingHabit]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim() || !trigger.trim()) return;

    onSave({
      title: title.trim(),
      trigger: trigger.trim(),
      identity: identity.trim() || undefined,
      frequency,
    });
  };

  const isCompletedForToday =
    editingHabit?._id &&
    todayStr &&
    habitLogs?.[editingHabit._id]?.some(
      (log: any) => log.date === todayStr && log.completed
    );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-[480px] max-h-[90dvh] flex-col overflow-y-auto rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-2xl my-auto animate-in zoom-in-95 duration-200 pointer-events-auto">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="font-bold text-xs sm:text-sm tracking-wider text-white uppercase">
              {editingHabit?._id ? streaks[editingHabit._id] || 0 : 0} DAY STREAK
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 transition-colors text-white hover:bg-black/20 active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">Trigger (When I...)</label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. After I brush my teeth..."
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface-muted)]/50 px-3.5 py-2.5 sm:py-3 text-base sm:text-sm font-medium text-[var(--color-text-primary)] placeholder-gray-400 focus:border-amber-400 focus:bg-[var(--color-bg-surface)] focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all shadow-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">Action (I will...)</label>
            <input
              type="text"
              placeholder="e.g. Read 1 page"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface-muted)]/50 px-3.5 py-2.5 sm:py-3 text-base sm:text-sm font-medium text-[var(--color-text-primary)] placeholder-gray-400 focus:border-amber-400 focus:bg-[var(--color-bg-surface)] focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all shadow-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider ml-1">Identity (I am...)</label>
            <input
              type="text"
              placeholder="e.g. I am someone who reads"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface-muted)]/50 px-3.5 py-2.5 sm:py-3 text-base sm:text-sm font-medium text-[var(--color-text-primary)] placeholder-gray-400 focus:border-amber-400 focus:bg-[var(--color-bg-surface)] focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-4 sm:px-6 py-3.5 rounded-b-2xl">
          <div>
            {editingHabit?._id && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-[var(--color-brand-red)] transition-colors hover:bg-[var(--color-brand-red-soft)] active:scale-95 cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || !trigger.trim()}
              className="rounded-xl bg-amber-500 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition-all hover:bg-amber-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              Save Habit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
