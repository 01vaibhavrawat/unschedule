import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { RichTextEditor } from './RichTextEditor';
import { ClipboardList, Check } from 'lucide-react';

export function BoardSection() {
  const { board, updateBoard } = useStore();
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const isInitialMount = useRef(true);

  // Sync initial content from store
  useEffect(() => {
    if (board && !content && isInitialMount.current) {
      setContent(board.content || '');
      isInitialMount.current = false;
    }
  }, [board, content]);

  // Debounced save with status feedback
  useEffect(() => {
    if (!board || isInitialMount.current) return;
    
    // Only save if it's different from the store
    if (content !== board.content) {
      setSaveStatus('saving');
      const timer = setTimeout(async () => {
        await updateBoard(content);
        setSaveStatus('saved');
      }, 1000); // 1s debounce
      
      return () => clearTimeout(timer);
    }
  }, [content, board, updateBoard]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between gap-2 mb-3 flex-shrink-0">
        <div className="flex items-center gap-2 text-gray-900 font-bold">
          <ClipboardList className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-bold">Board</h2>
        </div>

        {/* Save Status Indicator */}
        <div className="flex items-center h-6">
          {saveStatus === 'saving' && (
            <span className="text-[11px] text-gray-400 font-medium animate-pulse">
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 border border-gray-100 rounded-xl overflow-hidden bg-white">
        <RichTextEditor
          value={content}
          onChange={setContent}
          borderless={true}
          placeholder="Jot down important notes, reminders, or anything to keep in sight..."
        />
      </div>
    </div>
  );
}

