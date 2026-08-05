"use client";
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { format, subDays, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Save, BookOpen } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function JournalPage() {
  const { journals, addJournal, updateJournal } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const existingEntry = journals.find(j => j.date === dateStr);

  useEffect(() => {
    if (existingEntry) {
      setContent(existingEntry.content);
    } else {
      setContent('');
    }
    setSaveMessage('');
  }, [existingEntry, dateStr]);

  const handleSave = async (currentContent: string, currentExistingEntry: any, currentDateStr: string) => {
    if (!currentContent.trim()) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      if (currentExistingEntry) {
        await updateJournal(currentExistingEntry._id, { date: currentDateStr, content: currentContent });
      } else {
        await addJournal({ date: currentDateStr, content: currentContent });
      }
      setSaveMessage('Saved');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Error saving entry');
    } finally {
      setIsSaving(false);
    }
  };

  const onManualSave = () => handleSave(content, existingEntry, dateStr);

  useEffect(() => {
    if (!content.trim()) return;
    if (existingEntry && existingEntry.content === content) return;

    const timeoutId = setTimeout(() => {
      handleSave(content, existingEntry, dateStr);
    }, 1500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const handleToday = () => setSelectedDate(new Date());

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Daily Journal</h1>
            <p className="text-sm text-gray-500 mt-1">Reflect on your day</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button onClick={handlePrevDay} className="p-2 hover:bg-white rounded shadow-sm transition-all text-gray-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 font-medium text-gray-700 min-w-[140px] text-center">
              {format(selectedDate, 'MMMM d, yyyy')}
            </div>
            <button onClick={handleNextDay} className="p-2 hover:bg-white rounded shadow-sm transition-all text-gray-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button onClick={handleToday} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
            Today
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="text-sm text-gray-500 font-medium">
              Entry for {format(selectedDate, 'EEEE, MMMM do')}
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm transition-opacity ${saveMessage ? 'opacity-100' : 'opacity-0'} ${saveMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                {saveMessage}
              </span>
              <button
                onClick={onManualSave}
                disabled={isSaving || !content.trim()}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your thoughts here..."
              minHeight="100%"
              className="border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
