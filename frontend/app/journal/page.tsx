"use client";
import React, { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { format, subDays, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Save, BookOpen, Check } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useAutoSave } from '@/hooks/useAutoSave';

function JournalEditor({
  dateStr,
  selectedDate,
  existingEntry,
  addJournal,
  updateJournal
}: {
  dateStr: string;
  selectedDate: Date;
  existingEntry: any;
  addJournal: (data: any) => Promise<any>;
  updateJournal: (id: string, data: any) => Promise<void>;
}) {
  const [content, setContent] = useState(existingEntry?.content || '');
  const createdIdRef = useRef<string | null>(null);

  const saveToStore = async (newContent: string) => {
    if (!newContent.trim() && !existingEntry && !createdIdRef.current) return;

    const targetId = existingEntry?._id || createdIdRef.current;

    if (targetId) {
      await updateJournal(targetId, { date: dateStr, content: newContent });
    } else {
      const newJournal = await addJournal({ date: dateStr, content: newContent });
      createdIdRef.current = newJournal._id;
    }
  };

  const { isSaving, forceSave } = useAutoSave(content, saveToStore, 1500);

  return (
    <div className="w-full flex-1 flex flex-col bg-[var(--color-bg-surface)] rounded-2xl shadow-sm border border-[var(--color-border-subtle)] overflow-hidden min-h-0">
      <div className="p-3 sm:p-4 border-b border-[var(--color-border-subtle)] flex justify-between items-center bg-[var(--color-bg-surface-muted)]/50 gap-2">
        <div className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-semibold truncate">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <span className={`text-xs transition-opacity flex items-center gap-1 ${isSaving ? 'opacity-100 text-[var(--color-text-muted)] animate-pulse' : 'opacity-0'}`}>
            Saving...
          </span>
          <button
            onClick={forceSave}
            disabled={isSaving || content === (existingEntry?.content || '')}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving…' : 'Save'}</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 flex flex-col min-h-0">
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Reflect on your day, thoughts, achievements, or lessons..."
          minHeight="100%"
          borderless={true}
          className="border-none flex-1"
        />
      </div>
    </div>
  );
}

export default function JournalPage() {
  const { journals, addJournal, updateJournal, user, setUserMenuOpen } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const existingEntry = journals.find(j => j.date === dateStr);

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const handleToday = () => setSelectedDate(new Date());

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--color-bg-surface-muted)] min-h-0">
      {/* ── Header ── */}
      <div className="bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] px-4 sm:px-8 py-3 sm:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0 shadow-xs">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)] font-heading leading-tight">
                Daily Journal
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] hidden sm:block">
                Reflect on your day, thoughts, and progress
              </p>
            </div>
          </div>

          {user && (
            <button
              onClick={() => setUserMenuOpen(true)}
              className="sm:hidden flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm active:scale-95 transition-transform flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-purple) 100%)' }}
              aria-label="User settings"
            >
              {initials}
            </button>
          )}
        </div>

        {/* Date Selector */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
          <div className="flex items-center bg-[var(--color-bg-surface-muted)] rounded-xl p-0.5 border border-[var(--color-border-subtle)] flex-1 sm:flex-initial">
            <button
              onClick={handlePrevDay}
              className="p-1.5 sm:p-2 hover:bg-[var(--color-bg-surface)] rounded-lg shadow-xs transition-all text-[var(--color-text-secondary)] active:scale-95"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-2 sm:px-4 font-semibold text-xs sm:text-sm text-[var(--color-text-primary)] flex-1 text-center min-w-[120px]">
              {format(selectedDate, 'MMM d, yyyy')}
            </div>
            <button
              onClick={handleNextDay}
              className="p-1.5 sm:p-2 hover:bg-[var(--color-bg-surface)] rounded-lg shadow-xs transition-all text-[var(--color-text-secondary)] active:scale-95"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleToday}
            className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] text-[var(--color-brand-primary)] hover:bg-[var(--color-bg-hover)] transition-colors active:scale-95 flex-shrink-0"
          >
            Today
          </button>
        </div>
      </div>

      {/* ── Editor Container ── */}
      <div className="flex-1 overflow-hidden p-2 sm:p-6 flex flex-col items-center w-full max-w-4xl mx-auto min-h-0 pb-16 md:pb-6">
        <JournalEditor
          key={dateStr}
          dateStr={dateStr}
          selectedDate={selectedDate}
          existingEntry={existingEntry}
          addJournal={addJournal}
          updateJournal={updateJournal}
        />
      </div>
    </div>
  );
}
