import React, { useState, useEffect } from 'react';
import { X, GripHorizontal, Clock, Users, Video, MapPin, AlignLeft, Calendar as CalendarIcon } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: { title: string; start_time: string; end_time: string; recurrence?: string }) => void;
  onDelete?: () => void;
  initialStart?: Date | null;
  initialEnd?: Date | null;
  editingTask?: { title: string; start_time: string; end_time: string; recurrence?: string } | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialStart,
  initialEnd,
  editingTask
}) => {
  const DAYS_OF_WEEK = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
    { label: 'Weekdays', value: 7 },
    { label: 'Daily', value: 8 },
  ];

  const [title, setTitle] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [startTimeInput, setStartTimeInput] = useState('');
  const [endTimeInput, setEndTimeInput] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [showRecDropdown, setShowRecDropdown] = useState(false);


  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title);

        if (editingTask.recurrence === 'daily') {
          setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
        } else if (editingTask.recurrence === 'weekdays') {
          setSelectedDays([1, 2, 3, 4, 5]);
        } else if (editingTask.recurrence && editingTask.recurrence !== 'none') {
          setSelectedDays(editingTask.recurrence.split(',').map(Number));
        } else {
          setSelectedDays([]);
        }
        const st = new Date(editingTask.start_time);
        const et = new Date(editingTask.end_time);

        const formatTime = (d: Date) => d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');

        // Handle timezone offset appropriately to map exactly to the selected day
        setDateInput(editingTask.start_time.split('T')[0]);
        setStartTimeInput(formatTime(st));
        setEndTimeInput(formatTime(et));
      } else {
        setTitle('');
        setSelectedDays([]);
        const st = initialStart || new Date();
        const et = initialEnd || new Date(st.getTime() + 60 * 60 * 1000);

        const formatTime = (d: Date) => d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');

        const offset = st.getTimezoneOffset() * 60000;
        const localDateStr = new Date(st.getTime() - offset).toISOString().split('T')[0];

        setDateInput(localDateStr);
        setStartTimeInput(formatTime(st));
        setEndTimeInput(formatTime(et));
      }
    }
  }, [isOpen, editingTask, initialStart, initialEnd]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim() || !dateInput || !startTimeInput || !endTimeInput) return;

    const startIso = new Date(`${dateInput}T${startTimeInput}:00`).toISOString();
    const endIso = new Date(`${dateInput}T${endTimeInput}:00`).toISOString();

    let computedRecurrence = 'none';
    if (selectedDays.length > 7) computedRecurrence = 'daily';
    else if (selectedDays.length === 6 && [1, 2, 3, 4, 5].every(d => selectedDays.includes(d))) computedRecurrence = 'weekdays';
    else if (selectedDays.length > 0) computedRecurrence = selectedDays.sort().join(',');

    onSave({
      title,
      start_time: startIso,
      end_time: endIso,
      recurrence: computedRecurrence,
    });
  };

  const allDays = [0, 1, 2, 3, 4, 5, 6, 8];
  const weekDays = [1, 2, 3, 4, 5, 7];

  const handlSetSelectedDays = (num: number): void => {
    if (num === 7) setSelectedDays([...selectedDays, ...weekDays]);

    if (num === 8) setSelectedDays([...selectedDays, ...allDays]);

    if (num <= 6) setSelectedDays([...selectedDays, num]);

  }

  const handleUnselectDays = (num: number): void => {
    if (num === 7) setSelectedDays(selectedDays.filter(d => !weekDays.includes(d)));

    if (num === 8) setSelectedDays(selectedDays.filter(d => !allDays.includes(d)));

    if (num <= 6) setSelectedDays(selectedDays.filter(d => d != num));

  }

  const getRecurrenceText = () => {
    if (selectedDays.length === 0) return 'Does not repeat';
    if (selectedDays.length === 7) return 'Daily';
    if (selectedDays.length === 5 && [1, 2, 3, 4, 5].every(d => selectedDays.includes(d))) return 'Every weekday (Monday to Friday)';

    // Custom format: "Weekly on Mon, Wed"
    const sortedDays = [...selectedDays].sort();
    const dayLabels = sortedDays.map(d => DAYS_OF_WEEK.slice(0, 5).find(dw => dw.value === d)?.label.slice(0, 3));
    return `Weekly on ${dayLabels.join(', ')}`;
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
                <div className="flex gap-2 items-center mb-1">
                  <input type="date" className="p-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
                  <input type="time" className="p-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" value={startTimeInput} onChange={(e) => setStartTimeInput(e.target.value)} />
                  <span className="text-gray-500">&ndash;</span>
                  <input type="time" className="p-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" value={endTimeInput} onChange={(e) => setEndTimeInput(e.target.value)} />
                </div>
                <div className="relative text-sm mt-1">
                  <div
                    className="flex items-center gap-1 cursor-pointer text-gray-600 hover:bg-gray-100 px-2 py-1 rounded w-fit -ml-2"
                    onClick={() => setShowRecDropdown(!showRecDropdown)}
                  >
                    <span>{getRecurrenceText()}</span>
                  </div>

                  {showRecDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowRecDropdown(false)} />
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-md py-2 z-50 w-56">
                        <div className="px-3 pb-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          Repeat on
                        </div>
                        {DAYS_OF_WEEK.map(day => (
                          <label key={day.value} className="flex items-center gap-3 px-4 py-1 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                              checked={selectedDays.includes(day.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // setSelectedDays([...selectedDays, day.value]);
                                  handlSetSelectedDays(day.value);
                                } else {
                                  // setSelectedDays(selectedDays.filter(d => d !== day.value));
                                  handleUnselectDays(day.value);
                                }
                              }}
                            />
                            <span className="text-sm text-gray-700 select-none">{day.label}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
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
        <div className="px-6 py-4 bg-white flex justify-between items-center mt-2">
          <div>
            {editingTask && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded transition-colors"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
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
    </div>
  );
};
