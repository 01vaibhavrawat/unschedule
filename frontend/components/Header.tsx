import React from 'react';
import { Menu, Search, HelpCircle, Settings, Grid, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface HeaderProps {
  currentDate: Date;
  currentView: string;
  onPrevClick: () => void;
  onNextClick: () => void;
  onTodayClick: () => void;
  onViewChange: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  currentView,
  onPrevClick,
  onNextClick,
  onTodayClick,
  onViewChange
}) => {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 pr-8">
          <div className="w-8 h-8 rounded text-white flex items-center justify-center bg-blue-600">
            <span className="font-bold text-lg">{format(new Date(), 'd')}</span>
          </div>
          <span className="text-xl text-gray-700 tracking-tight font-medium">Calendar</span>
        </div>
        
        <button 
          onClick={onTodayClick}
          className="border border-gray-300 rounded px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Today
        </button>
        
        <div className="flex items-center gap-1">
          <button onClick={onPrevClick} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={onNextClick} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <h2 className="text-xl text-gray-700 font-normal ml-2">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="mx-2">
          <select 
            value={currentView}
            onChange={(e) => onViewChange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="timeGridDay">Day</option>
            <option value="timeGridWeek">Week</option>
            <option value="dayGridMonth">Month</option>
          </select>
        </div>
        
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors ml-2">
          <Grid className="w-5 h-5" />
        </button>
        
        <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-medium ml-2 cursor-pointer">
          V
        </div>
      </div>
    </header>
  );
};
