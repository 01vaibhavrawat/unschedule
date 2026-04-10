import React, { useState } from 'react';
import { Plus, Users, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { MiniHabit } from '@/store/useStore';

interface SidebarProps {
  onCreateClick: () => void;
  goals: any[];
  habits: any[];
  habitLogs: Record<string, any[]>;
  toggleHabitLog: (id: string, date: string) => void;
  todayStr: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onCreateClick,
  goals,
  habits,
  habitLogs,
  toggleHabitLog,
  todayStr
}) => {
  const [habitsExpanded, setHabitsExpanded] = useState(true);
  const [goalsExpanded, setGoalsExpanded] = useState(true);

  return (
    <div className="w-64 flex-shrink-0 flex flex-col h-full bg-white border-r border-gray-200 overflow-y-auto">
      {/* Create Button Area */}
      <div className="p-4">
        <button 
          onClick={onCreateClick}
          className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm hover:shadow-md rounded-full pl-2 pr-4 py-2 text-sm font-medium text-gray-700 transition-shadow"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600">
            <svg width="36" height="36" viewBox="0 0 36 36"><path fill="#34A853" d="M16 16v14h4V20z"></path><path fill="#4285F4" d="M30 16H20l-4 4h14z"></path><path fill="#FBBC05" d="M6 16v4h10l4-4z"></path><path fill="#EA4335" d="M20 16V6h-4v14z"></path><path fill="none" d="M0 0h36v36H0z"></path></svg>
          </div>
          Create
          <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
        </button>
      </div>

      {/* Mini Calendar Mockup */}
      <div className="px-6 pb-4">
        <div className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
          <span>April 2026</span>
          <div className="flex gap-1">
            <ChevronLeft className="w-4 h-4 text-gray-500 cursor-pointer" />
            <ChevronRight className="w-4 h-4 text-gray-500 cursor-pointer" />
          </div>
        </div>
        {/* Simple 7x6 Grid Mockup without functional logic for MVP */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
          {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-gray-500 font-medium">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {/* Mock days */}
          {[29,30,31,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,1,2].map((d, i) => (
             <div 
                key={i} 
                className={`w-6 h-6 flex items-center justify-center rounded-full mx-auto ${d === 10 && i > 5 && i < 20 ? 'bg-blue-600 text-white' : (i < 3 || i > 32) ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-100 cursor-pointer'}`}
             >
               {d}
             </div>
          ))}
        </div>
      </div>

      {/* Search People Placeholder */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>Search for people</span>
        </div>
      </div>

      {/* Habits Section (Replacing My Calendars) */}
      <div className="py-2">
        <div 
          className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer group"
          onClick={() => setHabitsExpanded(!habitsExpanded)}
        >
          <div className="flex items-center gap-2">
            <ChevronDown className={`w-4 h-4 text-gray-600 transform transition-transform ${habitsExpanded ? '' : '-rotate-90'}`} />
            <span className="text-sm font-medium text-gray-700">Mini Habits</span>
          </div>
        </div>
        
        {habitsExpanded && (
          <div className="pl-10 pr-4 py-1 space-y-1 text-sm">
            {habits.map(habit => {
              const logs = habitLogs[habit._id] || [];
              const isDone = logs.some(l => l.date === todayStr && l.completed);
              return (
                <div key={habit._id} className="flex items-center gap-3 py-1 cursor-pointer group" onClick={() => toggleHabitLog(habit._id, todayStr)}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${isDone ? 'bg-emerald-600 border-emerald-600' : 'border-gray-400 group-hover:border-gray-600'}`}>
                    {isDone && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`truncate ${isDone ? 'text-gray-500 line-through' : 'text-gray-700'}`}>{habit.title}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Goals Section (Replacing Other Calendars) */}
      <div className="py-2 border-t border-gray-100">
        <div 
          className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer group"
          onClick={() => setGoalsExpanded(!goalsExpanded)}
        >
          <div className="flex items-center gap-2">
            <ChevronDown className={`w-4 h-4 text-gray-600 transform transition-transform ${goalsExpanded ? '' : '-rotate-90'}`} />
            <span className="text-sm font-medium text-gray-700">Goals</span>
          </div>
        </div>
        
        {goalsExpanded && (
          <div className="pl-10 pr-4 py-1 space-y-2 text-sm">
             {goals.map((g, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                   <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
                   <span className="text-gray-700 truncate">{g.title}</span>
                </div>
             ))}
          </div>
        )}
      </div>

    </div>
  );
};

// Extracted from above to fix un-imported ChevronLeft
const ChevronLeft = ({ className, ...props }: any) => <svg className={className} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
