import React, { useState, useEffect } from 'react';
import { X, GripHorizontal, Clock, Users, Video, MapPin, AlignLeft, Calendar as CalendarIcon } from 'lucide-react';

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
    <div 
      className="fixed top-0 left-0 w-full h-full z-[9999] flex items-center justify-center p-4 shadow-xl"
    >
      {/* Click outside to close */}
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />
      
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-full max-w-[480px] overflow-hidden relative z-10 flex flex-col pointer-events-auto border border-gray-100">
        
        {/* Top Handle / Close Bar */}
        <div className="flex justify-between items-center px-4 py-3 bg-[#f8f9fa] border-b border-gray-100">
          <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500 transition-colors">
            <GripHorizontal className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="px-6 py-4">
          {/* Title Input */}
          <div className="ml-10 mb-4">
            <input 
              type="text"
              autoFocus
              className="w-full text-[22px] text-gray-700 bg-transparent border-b-2 border-blue-600 pb-1 focus:outline-none placeholder-gray-500 font-normal"
              placeholder="Add title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') onClose();
              }}
            />
          </div>

          {/* Type Tabs */}
          <div className="ml-10 flex items-center gap-2 mb-6">
            <button className="px-3 py-1.5 bg-[#e8f0fe] text-[#1a73e8] text-sm font-medium rounded-md hover:bg-blue-100 transition-colors">
              Event
            </button>
            <button className="px-3 py-1.5 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
              Task
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
              Appointment schedule
              <span className="bg-[#1a73e8] text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">New</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Time Row */}
            <div className="flex items-start gap-4">
              <Clock className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <div className="text-sm text-gray-700">
                  {initialStart ? (
                    <>
                      {initialStart.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} &nbsp;
                      {initialStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()} &ndash; 
                      {initialEnd ? ` ${initialEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()}` : ''}
                    </>
                  ) : 'Select time'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Time zone · Does not repeat</div>
              </div>
            </div>

            {/* Guests Row */}
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-gray-500" />
              <div className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">Add guests</div>
            </div>

            {/* Meet Row */}
            <div className="flex items-center gap-4">
              <Video className="w-5 h-5 text-blue-500" />
              <button className="bg-[#f1f3f4] hover:bg-[#e8eaed] text-gray-700 text-sm font-medium py-2 px-4 rounded transition-colors w-full text-left">
                Add Google Meet video conferencing
              </button>
            </div>

            {/* Location Row */}
            <div className="flex items-center gap-4">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">Add location</div>
            </div>

            {/* Description Row */}
            <div className="flex items-center gap-4">
              <AlignLeft className="w-5 h-5 text-gray-500" />
              <div className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">Add description or a Google Drive attachment</div>
            </div>

            {/* Calendar Owner Row */}
            <div className="flex items-start gap-4">
              <CalendarIcon className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <div className="text-sm text-gray-700 flex items-center gap-2">
                  Vaibhav Rawat <span className="w-3 h-3 bg-[#039be5] rounded-full inline-block"></span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Busy · Default visibility · Notify 30 minutes before</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="px-6 py-4 bg-white flex justify-end items-center gap-4 mt-2">
          <button 
            type="button"
            className="text-sm font-medium text-[#1a73e8] hover:bg-blue-50 px-3 py-2 rounded transition-colors"
          >
            More options
          </button>
          <button 
            onClick={handleSave}
            disabled={!title.trim()}
            className="bg-[#1a73e8] hover:bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};
