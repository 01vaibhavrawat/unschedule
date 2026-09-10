import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { RichTextEditor } from './RichTextEditor';
import { ClipboardList } from 'lucide-react';

export function BoardSection() {
  const { board, updateBoard } = useStore();
  const [content, setContent] = useState('');

  // Sync initial content from store
  useEffect(() => {
    if (board && !content) {
      setContent(board.content || '');
    }
  }, [board]);

  // Debounced save
  useEffect(() => {
    if (!board) return;
    
    // Only save if it's different from the store to avoid unnecessary initial saves
    if (content !== board.content) {
      const timer = setTimeout(() => {
        updateBoard(content);
      }, 1000); // 1s debounce
      
      return () => clearTimeout(timer);
    }
  }, [content, board, updateBoard]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 text-gray-900 font-bold flex-shrink-0">
        <ClipboardList className="w-5 h-5 text-indigo-500" />
        <h2>Board</h2>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto border border-gray-100 rounded-xl">
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Jot down important notes, reminders, or anything to keep in sight..."
        />
      </div>
    </div>
  );
}
