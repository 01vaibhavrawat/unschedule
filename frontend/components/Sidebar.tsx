'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Users, ChevronDown, Check, Zap, ChevronRight,
  Target, Plus, Pencil, Trash2, X, Flag, ArrowRight, Sparkles, Share,
  MinusCircle, RotateCcw
} from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, format, isSameMonth, subMonths, addMonths, differenceInDays
} from 'date-fns';
import { RichTextEditor } from './RichTextEditor';

// ── types ──────────────────────────────────────────────────────────────
interface Goal {
  _id: string;
  title: string;
  description?: string;
  color?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onCreateClick: () => void;
  goals: Goal[];
  habits: any[];
  tasks: any[];
  habitLogs: Record<string, any[]>;
  toggleHabitLog: (id: string, date: string) => void;
  todayStr: string;
  onMiniCalendarSelect: (dateStr: string) => void;
  currentDate: Date;
  onAddGoal: (goal: { title: string; description?: string; color?: string }) => Promise<void>;
  onUpdateGoal: (id: string, goal: { title: string; description?: string; color?: string }) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
  streaks?: Record<string, number>;
  setHabitStatus?: (habitId: string, date: string, status: 'completed' | 'skipped' | 'none') => Promise<void>;
}

// ── palette ────────────────────────────────────────────────────────────
const GOAL_COLORS = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f43f5e', label: 'Rose' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#64748b', label: 'Slate' },
];

const DEFAULT_COLOR = GOAL_COLORS[0].value;

// ── GoalsModal ─────────────────────────────────────────────────────────
interface GoalsModalProps {
  goals: Goal[];
  onClose: () => void;
  onAdd: (goal: { title: string; description?: string; color?: string }) => Promise<void>;
  onUpdate: (id: string, goal: { title: string; description?: string; color?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const GoalsModal: React.FC<GoalsModalProps> = ({ goals, onClose, onAdd, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(goals.length === 0);
  const [form, setForm] = useState({ title: '', description: '', color: DEFAULT_COLOR });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding || editingId) {
      setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [isAdding, editingId]);

  const startEdit = (g: Goal) => {
    setIsAdding(false);
    setEditingId(g._id);
    setForm({ title: g.title, description: g.description || '', color: g.color || DEFAULT_COLOR });
  };

  const startAdd = () => {
    setEditingId(null);
    setIsAdding(true);
    setForm({ title: '', description: '', color: DEFAULT_COLOR });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await onUpdate(editingId, { title: form.title.trim(), description: form.description.trim(), color: form.color });
        setEditingId(null);
      } else {
        await onAdd({ title: form.title.trim(), description: form.description.trim(), color: form.color });
        setIsAdding(false);
        setForm({ title: '', description: '', color: DEFAULT_COLOR });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
      if (editingId === id) setEditingId(null);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') cancelEdit();
  };

  const isFormOpen = isAdding || !!editingId;

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{
          width: 520,
          maxHeight: '88vh',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          border: '1px solid rgba(99,102,241,0.12)',
        }}
      >
        {/* ── header ── */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">My Goals</h2>
              <p className="text-xs text-white/70">Your top priorities &amp; direction</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={startAdd}
              disabled={isFormOpen}
              className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-white/30 disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Add goal
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── add / edit form ── */}
        {isFormOpen && (
          <div className="px-6 pt-5 pb-4 border-b border-indigo-50">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              {editingId ? 'Edit goal' : 'New goal'}
            </p>

            {/* color picker */}
            <div className="mb-3 flex flex-wrap gap-2">
              {GOAL_COLORS.map(c => (
                <button
                  key={c.value}
                  title={c.label}
                  onClick={() => setForm(f => ({ ...f, color: c.value }))}
                  className="h-6 w-6 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.value,
                    outline: form.color === c.value ? `2.5px solid ${c.value}` : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>

            <input
              ref={titleRef}
              type="text"
              placeholder="Goal title (e.g. Ship MVP by June)"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              onKeyDown={handleKey}
              className="w-full rounded-xl border border-indigo-100 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 mb-2"
            />
            <div className="mb-2 w-full">
              <RichTextEditor
                placeholder="Why does this matter? (optional)"
                value={form.description}
                onChange={(value) => setForm(f => ({ ...f, description: value }))}
                minHeight="80px"
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={cancelEdit}
                className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title.trim() || saving}
                className="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {saving ? 'Saving…' : editingId ? 'Update' : 'Add Goal'}
                {!saving && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* ── goals list ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {goals.length === 0 && !isFormOpen && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                <Sparkles className="h-7 w-7 text-indigo-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">No goals yet</p>
              <p className="mt-1 text-xs text-gray-400">Add a goal to start aligning your schedule</p>
              <button
                onClick={startAdd}
                className="mt-4 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <Plus className="h-4 w-4" /> Add your first goal
              </button>
            </div>
          )}

          {goals.map((g, idx) => {
            const color = g.color || DEFAULT_COLOR;
            const isEdit = editingId === g._id;
            if (isEdit) return null; // hide card while editing in form above

            return (
              <div
                key={g._id}
                className="group relative flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-gray-200"
              >
                {/* rank badge */}
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {idx + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">{g.title}</p>
                    <Flag className="h-3 w-3 flex-shrink-0" style={{ color }} />
                  </div>
                  {g.description && (
                    <p className="mt-0.5 text-xs text-gray-400 leading-relaxed line-clamp-2">{g.description}</p>
                  )}
                </div>

                {/* actions */}
                <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => startEdit(g)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(g._id)}
                    disabled={deletingId === g._id}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* left accent bar */}
                <div
                  className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            );
          })}
        </div>

        {/* ── footer tip ── */}
        {goals.length > 0 && (
          <div className="px-6 py-3 border-t border-indigo-50 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
            <p className="text-xs text-gray-400">Use these goals when planning tasks to stay aligned</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Sidebar ────────────────────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCreateClick,
  goals,
  habits,
  tasks,
  habitLogs,
  toggleHabitLog,
  todayStr,
  onMiniCalendarSelect,
  currentDate,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  streaks = {},
  setHabitStatus,
}) => {
  const atomicHabitTasks = (tasks || []).filter((t: any) => t.type === 'atomic_habit');
  const [habitsExpanded, setHabitsExpanded] = useState(true);
  const [goalsExpanded, setGoalsExpanded] = useState(true);
  const [goalsModalOpen, setGoalsModalOpen] = useState(false);

  const [miniCalendarMonth, setMiniCalendarMonth] = useState(currentDate);
  useEffect(() => { setMiniCalendarMonth(currentDate); }, [currentDate]);

  const monthStart = startOfMonth(miniCalendarMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) { days.push(day); day = addDays(day, 1); }

  const handleMiniPrev = () => setMiniCalendarMonth(subMonths(miniCalendarMonth, 1));
  const handleMiniNext = () => setMiniCalendarMonth(addMonths(miniCalendarMonth, 1));

  return (
    <>
      <div className={`flex h-full flex-shrink-0 flex-col overflow-y-auto overflow-x-hidden bg-[var(--color-bg-surface)] transition-[width,opacity,border] duration-300 ${isOpen ? 'w-64 border-r border-[var(--color-border-muted)] opacity-100' : 'w-0 border-none opacity-0'}`}>

        {/* Create Button */}
        <div className="p-4">
          <button
            id="add-task-btn"
            onClick={onCreateClick}
            className="flex items-center gap-2 rounded-full border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] py-2 pl-2 pr-4 text-sm font-medium text-[var(--color-text-secondary)] shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-text-secondary)]">
              {/* <svg width="36" height="36" viewBox="0 0 36 36">
                <path fill="#5f6368" d="M16 16v14h4V20z" />
                <path fill="#5f6368" d="M30 16H20l-4 4h14z" />
                <path fill="#5f6368" d="M6 16v4h10l4-4z" />
                <path fill="#5f6368" d="M20 16V6h-4v14z" />
                <path fill="none" d="M0 0h36v36H0z" />
              </svg> */}
              {/* <svg width="36" height="36" viewBox="0 0 36 36">
                <path fill="var(--logo-green)" d="M16 16v14h4V20z" />
                <path fill="var(--logo-blue)" d="M30 16H20l-4 4h14z" />
                <path fill="var(--logo-yellow)" d="M6 16v4h10l4-4z" />
                <path fill="var(--logo-red)" d="M20 16V6h-4v14z" />
                <path fill="none" d="M0 0h36v36H0z" />
              </svg> */}
              <svg width="36" height="36" viewBox="0 0 36 36">
                <path fill="#5F8D4E" d="M16 16v14h4V20z" />
                <path fill="#5B8DEF" d="M30 16H20l-4 4h14z" />
                <path fill="#D4A93A" d="M6 16v4h10l4-4z" />
                <path fill="#D66A5E" d="M20 16V6h-4v14z" />
                <path fill="none" d="M0 0h36v36H0z" />
              </svg>
            </div>
            Create
            <ChevronDown className="ml-1 h-4 w-4 text-[var(--color-text-muted)]" />
          </button>
        </div>


        {/* Search People */}
        {/* <div className="border-b border-[var(--color-border-subtle)] px-4 py-2">
          <div className="flex items-center gap-3 rounded bg-[var(--color-bg-hover-subtle)] px-3 py-2 text-sm text-[var(--color-text-muted)]">
            <Users className="w-4 h-4" />
            <span>Search for people</span>
          </div>
        </div> */}


        {/* ── Goals Section ── */}
        <div id="sidebar-goals" className="border-t border-[var(--color-border-subtle)] py-2">
          {/* section header */}
          <div className="flex items-center justify-between px-4 py-2">
            <div
              className="flex flex-1 cursor-pointer items-center gap-2 hover:bg-[var(--color-bg-hover-subtle)] rounded -ml-1 px-1 py-0.5"
              onClick={() => setGoalsExpanded(!goalsExpanded)}
            >
              <ChevronDown className={`h-4 w-4 text-[var(--color-text-secondary)] transition-transform ${goalsExpanded ? '' : '-rotate-90'}`} />
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">Goals / Priorities</span>
                {goals.length > 0 && (
                  <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600">
                    {goals.length}
                  </span>
                )}
              </div>
            </div>
            {/* expand / manage button */}
            <button
              onClick={() => setGoalsModalOpen(true)}
              title="Manage goals"
              className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* collapsed list */}
          {goalsExpanded && (
            <div className="pb-2">
              {goals.length === 0 ? (
                <button
                  onClick={() => setGoalsModalOpen(true)}
                  className="mx-4 mt-1 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-200 py-3 text-xs font-medium text-indigo-400 transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add your first goal
                </button>
              ) : (
                <div className="px-3 space-y-1 mt-1">
                  {goals.map((g) => {
                    const color = g.color || DEFAULT_COLOR;
                    return (
                      <div
                        key={g._id}
                        className="group flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-[var(--color-bg-hover-subtle)]"
                        onClick={() => setGoalsModalOpen(true)}
                      >
                        <div
                          className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-[var(--color-text-secondary)]">{g.title}</p>
                          {g.description && (
                            <p className="truncate text-[10px] text-[var(--color-text-muted)]">{g.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* manage link */}
                  <button
                    onClick={() => setGoalsModalOpen(true)}
                    className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-indigo-500 transition-colors hover:bg-indigo-50"
                  >
                    <Pencil className="h-3 w-3" />
                    Manage goals
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mini Habits */}
        <div id="sidebar-habits" className="py-2">
          <div
            className="group flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-[var(--color-bg-hover-subtle)]"
            onClick={() => setHabitsExpanded(!habitsExpanded)}
          >
            <div className="flex items-center gap-2">
              <ChevronDown className={`h-4 w-4 text-[var(--color-text-secondary)] transition-transform ${habitsExpanded ? '' : '-rotate-90'}`} />
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Mini Habits</span>
            </div>
          </div>

          {habitsExpanded && (
            <div className="px-3 py-1 space-y-1 text-sm">
              {habits.map(habit => {
                const logs = habitLogs[habit._id] || [];
                const todayLog = logs.find((l: any) => l.date === todayStr);
                const isDone = todayLog?.status === 'completed' || todayLog?.completed === true;
                const isSkipped = todayLog?.status === 'skipped';
                return (
                  <div key={habit._id} className={`flex items-center justify-between py-1 group ${isSkipped ? 'opacity-50 grayscale' : ''}`}>
                    <div className="flex items-center gap-3 cursor-pointer flex-1 min-w-0" onClick={() => toggleHabitLog(habit._id, todayStr)}>
                      <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${isDone ? 'border-[var(--color-brand-success)] bg-[var(--color-brand-success)]' : 'border-[var(--color-text-subtle)] group-hover:border-[var(--color-text-secondary)]'}`}>
                        {isDone && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`truncate ${isDone ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-secondary)]'}`}>{habit.title}</span>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity items-center">
                      {!isSkipped && setHabitStatus && (
                         <button onClick={(e) => { e.stopPropagation(); setHabitStatus(habit._id, todayStr, 'skipped'); }} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 flex-shrink-0" title="Skip today">
                           <MinusCircle className="w-3 h-3" />
                         </button>
                      )}
                      {isSkipped && setHabitStatus && (
                         <button onClick={(e) => { e.stopPropagation(); setHabitStatus(habit._id, todayStr, 'none'); }} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 flex-shrink-0" title="Undo skip">
                           <RotateCcw className="w-3 h-3" />
                         </button>
                      )}

                    </div>
                  </div>
                );
              })}

              {atomicHabitTasks.length > 0 && (
                <div className={habits.length > 0 ? 'pt-2 space-y-2' : 'space-y-2'}>
                  {atomicHabitTasks.map((task: any) => {
                    const streakCount = streaks[task._id] || 0;
                    const logs = habitLogs[task._id] || [];
                    const todayLog = logs.find((l: any) => l.date === todayStr);
                    const isDone = todayLog?.status === 'completed' || todayLog?.completed === true;
                    const isSkipped = todayLog?.status === 'skipped';
                    return (
                      <div
                        key={task._id}
                        className={`group relative overflow-hidden rounded-xl p-3 shadow-sm transition-all hover:shadow-md border border-indigo-100/50 ${isSkipped ? 'bg-gray-50 grayscale opacity-60' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}
                      >
                        <div className="absolute -right-4 -top-4 opacity-10">
                          <Zap className="h-16 w-16 text-indigo-600" />
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex flex-col gap-1 min-w-0 flex-1 pr-2 cursor-pointer" onClick={() => toggleHabitLog(task._id, todayStr)}>
                            <span className={`truncate text-sm font-semibold ${isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.title}</span>
                            <div className="flex items-center gap-1.5">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-xs shadow-inner">
                                🔥
                              </div>
                              <span className="text-xs font-bold text-orange-600 tracking-wide">
                                {streakCount} {streakCount === 1 ? 'Day Streak' : 'Day Streak'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center gap-1 z-20">
                             <button onClick={() => toggleHabitLog(task._id, todayStr)} className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${isDone ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 bg-white text-transparent hover:border-indigo-400'}`}>
                               <Check className="h-4 w-4" />
                             </button>
                             <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                               {!isSkipped && setHabitStatus && (
                                 <button onClick={(e) => { e.stopPropagation(); setHabitStatus(task._id, todayStr, 'skipped'); }} className="text-[10px] text-gray-500 hover:text-indigo-600 font-medium bg-white rounded px-1.5 py-0.5 shadow-sm border border-gray-200">Skip</button>
                               )}
                               {isSkipped && setHabitStatus && (
                                 <button onClick={(e) => { e.stopPropagation(); setHabitStatus(task._id, todayStr, 'none'); }} className="text-[10px] text-gray-500 hover:text-indigo-600 font-medium bg-white rounded px-1.5 py-0.5 shadow-sm border border-gray-200">Undo</button>
                               )}
                             </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {habits.length === 0 && atomicHabitTasks.length === 0 && (
                <div className="py-2 text-xs text-[var(--color-text-muted)] italic">No habits yet</div>
              )}
            </div>
          )}
        </div>


        {/* Mini Calendar */}
        <div className="px-6 pb-4 pt-2">
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-[var(--color-text-secondary)]">
            <span>{format(miniCalendarMonth, 'MMMM yyyy')}</span>
            <div className="flex gap-1">
              <ChevronLeft className="h-4 w-4 cursor-pointer rounded text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]" onClick={handleMiniPrev} />
              <ChevronRight className="h-4 w-4 cursor-pointer rounded text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]" onClick={handleMiniNext} />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="font-medium text-[var(--color-text-muted)]">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
            {days.map((dayItem, i) => {
              const isSelected = format(dayItem, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
              const isToday = format(dayItem, 'yyyy-MM-dd') === todayStr;
              const currentMonth = isSameMonth(dayItem, miniCalendarMonth);
              let bgClass = 'cursor-pointer rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]';
              if (isToday) bgClass = 'cursor-pointer rounded-full bg-[var(--color-brand-primary-hover)] text-[var(--color-text-inverse)]';
              else if (isSelected) bgClass = 'cursor-pointer rounded-full bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary-strong)]';
              else if (!currentMonth) bgClass = 'cursor-pointer rounded-full text-[var(--color-text-subtle)] hover:bg-[var(--color-bg-hover)]';
              return (
                <div
                  key={i}
                  onClick={() => onMiniCalendarSelect(format(dayItem, 'yyyy-MM-dd'))}
                  className={`w-6 h-6 flex items-center justify-center mx-auto transition-colors ${bgClass}`}
                >
                  {format(dayItem, 'd')}
                </div>
              );
            })}
          </div>
        </div>



      </div>

      {/* Goals Management Modal */}
      {goalsModalOpen && (
        <GoalsModal
          goals={goals}
          onClose={() => setGoalsModalOpen(false)}
          onAdd={onAddGoal}
          onUpdate={onUpdateGoal}
          onDelete={onDeleteGoal}
        />
      )}
    </>
  );
};

// ── tiny ChevronLeft (keeps no extra dep) ──────────────────────────────
const ChevronLeft = ({ className, ...props }: any) => (
  <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);
