import React, { useState, useEffect } from 'react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: { title: string; start_time: string; end_time: string }) => void;
  initialStart?: Date | null;
  initialEnd?: Date | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialStart, 
  initialEnd 
}) => {
  const [title, setTitle] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setTitle('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    
    // We assume backend expects standard ISO strings for start/end
    const startIso = initialStart ? initialStart.toISOString() : new Date().toISOString();
    
    // Default duration is 1 hour if no initialEnd is provided
    let endIso;
    if (initialEnd) {
      endIso = initialEnd.toISOString();
    } else {
      const defaultEnd = new Date(startIso);
      defaultEnd.setHours(defaultEnd.getHours() + 1);
      endIso = defaultEnd.toISOString();
    }

    onSave({
      title,
      start_time: startIso,
      end_time: endIso,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-700 font-semibold text-white">
          Create New Task
        </div>
        
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Task Name</label>
            <input 
              type="text"
              autoFocus
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="e.g. Deep Work Session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') onClose();
              }}
            />
          </div>
          
          <div className="text-xs text-slate-500">
            {initialStart && (
              <p>Time: {initialStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                 {initialEnd ? ` - ${initialEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
              </p>
            )}
          </div>
        </div>
        
        <div className="p-5 bg-slate-800/50 flex justify-end gap-3 border-t border-slate-700">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!title.trim()}
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};
