'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Target, Plus, Pencil, Trash2, X, Flag, ArrowRight, Sparkles, Calendar, Clock } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { Goal } from '@/store/useStore';

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

const calculateProgress = (created_at?: string, deadline?: string) => {
  if (!deadline) return null;
  const end = new Date(deadline);
  const now = new Date();
  const start = created_at ? new Date(created_at) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000); // fallback to 7 days if no created_at
  
  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  let percent = 100;
  if (total > 0) {
    percent = Math.max(0, Math.min(100, (elapsed / total) * 100));
  }
  
  return { daysLeft, percent };
};

// ── clean description helper ───────────────────────────────────────────
export const cleanDescription = (desc?: string): string => {
  if (!desc) return '';
  const normalized = desc.replace(/&nbsp;/g, ' ');
  const textOnly = normalized.replace(/<[^>]*>/g, '').trim();
  if (!textOnly) return '';

  return normalized
    .replace(/<br[^>]*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
    .replace(/<\/?p[^>]*>/gi, '')
    .trim();
};

// ── GoalsModal ─────────────────────────────────────────────────────────
interface GoalsModalProps {
  goals: Goal[];
  onClose: () => void;
  onAdd: (goal: { title: string; description?: string; color?: string; deadline?: string }) => Promise<void>;
  onUpdate: (id: string, goal: { title: string; description?: string; color?: string; deadline?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const GoalsModal: React.FC<GoalsModalProps> = ({ goals, onClose, onAdd, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(goals.length === 0);
  const [form, setForm] = useState({ title: '', description: '', color: DEFAULT_COLOR, deadline: '' });
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
    setForm({ title: g.title, description: cleanDescription(g.description || ''), color: g.color || DEFAULT_COLOR, deadline: g.deadline || '' });
  };

  const startAdd = () => {
    setEditingId(null);
    setIsAdding(true);
    setForm({ title: '', description: '', color: DEFAULT_COLOR, deadline: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const cleanedDescription = cleanDescription(form.description);
    try {
      if (editingId) {
        await onUpdate(editingId, { title: form.title.trim(), description: cleanedDescription, color: form.color, deadline: form.deadline });
        setEditingId(null);
      } else {
        await onAdd({ title: form.title.trim(), description: cleanedDescription, color: form.color, deadline: form.deadline });
        setIsAdding(false);
        setForm({ title: '', description: '', color: DEFAULT_COLOR, deadline: '' });
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
            <div className="mb-2 flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  title="Deadline (optional)"
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="w-full rounded-xl border border-indigo-100 bg-white pl-9 pr-4 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
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
                  {cleanDescription(g.description) && (
                    <p className="mt-0.5 text-xs text-gray-400 leading-relaxed line-clamp-2">{cleanDescription(g.description)}</p>
                  )}
                  {g.deadline && (() => {
                    const progress = calculateProgress(g.created_at, g.deadline);
                    if (!progress) return null;
                    const isUrgent = progress.daysLeft <= 3;
                    return (
                      <div className="mt-3 w-full max-w-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider ${isUrgent ? 'text-rose-500' : 'text-gray-400'}`}>
                            {progress.daysLeft < 0 ? 'Overdue' : progress.daysLeft === 0 ? 'Due Today' : `${progress.daysLeft} Days Left`}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${progress.percent}%`,
                              backgroundColor: isUrgent ? '#f43f5e' : color 
                            }}
                          />
                        </div>
                      </div>
                    );
                  })()}
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

// ── GoalsSection ───────────────────────────────────────────────────────
export interface GoalsSectionProps {
  goals: Goal[];
  onAddGoal: (goal: { title: string; description?: string; color?: string }) => Promise<void>;
  onUpdateGoal: (id: string, goal: { title: string; description?: string; color?: string }) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [goalsModalOpen, setGoalsModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-indigo-900 font-bold">
          <Target className="w-5 h-5 text-indigo-500" />
          <h2>Goals & Priorities</h2>
        </div>
        <button
          onClick={() => setGoalsModalOpen(true)}
          title="Manage goals"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 -mr-1">
        {goals.length === 0 ? (
          <button
            onClick={() => setGoalsModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-200 py-6 text-sm font-medium text-indigo-400 transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <Plus className="h-4 w-4" />
            Add your first goal
          </button>
        ) : (
          <div className="space-y-2">
            {goals.map((g) => {
              const color = g.color || DEFAULT_COLOR;
              return (
                <div
                  key={g._id}
                  className="group flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50 border border-transparent hover:border-gray-100"
                  onClick={() => setGoalsModalOpen(true)}
                >
                  <div
                    className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800">{g.title}</p>
                    {cleanDescription(g.description) && (
                      <p className="truncate text-xs text-gray-500 mt-0.5">{cleanDescription(g.description)}</p>
                    )}
                    {g.deadline && (() => {
                      const progress = calculateProgress(g.created_at, g.deadline);
                      if (!progress) return null;
                      const isUrgent = progress.daysLeft <= 3;
                      return (
                        <div className="mt-2 w-full max-w-[200px]">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-[9px] font-semibold uppercase tracking-wider ${isUrgent ? 'text-rose-500' : 'text-gray-400'}`}>
                              {progress.daysLeft < 0 ? 'Overdue' : progress.daysLeft === 0 ? 'Due Today' : `${progress.daysLeft} Days Left`}
                            </span>
                          </div>
                          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${progress.percent}%`,
                                backgroundColor: isUrgent ? '#f43f5e' : color 
                              }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {goalsModalOpen && (
        <GoalsModal
          goals={goals}
          onClose={() => setGoalsModalOpen(false)}
          onAdd={onAddGoal}
          onUpdate={onUpdateGoal}
          onDelete={onDeleteGoal}
        />
      )}
    </div>
  );
};
