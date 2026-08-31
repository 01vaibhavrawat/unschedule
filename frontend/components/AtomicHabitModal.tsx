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
    <div className="fixed top-0 left-0 z-[100] flex h-full w-full items-center justify-center p-4 shadow-xl">
      <div
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
      />

      <div className="relative z-10 flex w-full max-w-[480px] flex-col overflow-visible rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-modal)] pointer-events-auto">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-500">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="font-bold text-sm tracking-wide text-white">
              {editingHabit?._id ? streaks[editingHabit._id] || 0 : 0} DAY STREAK
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 transition-colors text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Trigger (When I...)</label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. After I brush my teeth..."
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-[15px] font-medium text-gray-800 placeholder-gray-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-400/10 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Action (I will...)</label>
            <input
              type="text"
              placeholder="e.g. Read 1 page"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-[15px] font-medium text-gray-800 placeholder-gray-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-400/10 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Identity (I am...)</label>
            <input
              type="text"
              placeholder="e.g. I am someone who reads"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-[15px] font-medium text-gray-800 placeholder-gray-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-400/10 transition-all"
            />
          </div>
          
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-6 py-4 rounded-b-2xl">
          <div>
            {editingHabit?._id && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded px-3 py-2 text-sm font-medium text-[var(--color-brand-red-strong)] transition-colors hover:bg-[var(--color-brand-red-soft)]"
              >
                Delete
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {editingHabit?._id && onToggleHabit && todayStr && (
              <button
                type="button"
                onClick={() => onToggleHabit(editingHabit._id!, todayStr)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isCompletedForToday
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isCompletedForToday ? '✓ Completed' : 'Mark Complete'}
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={!title.trim() || !trigger.trim()}
              className="rounded-full bg-amber-500 px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
