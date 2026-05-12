import React, { useState, useEffect } from 'react';
import { X, GripHorizontal, Clock, Users, Video, MapPin, AlignLeft, Calendar as CalendarIcon } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: { title: string; start_time: string; end_time: string; recurrence?: string; type?: string }) => void;
  onDelete?: () => void;
  initialStart?: Date | null;
  initialEnd?: Date | null;
  editingTask?: { _id?: string; title: string; start_time: string; end_time: string; recurrence?: string; type?: string } | null;
  onToggleHabit?: (habitId: string, date: string) => Promise<void>;
  habitLogs?: Record<string, any[]>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialStart,
  initialEnd,
  editingTask,
  onToggleHabit,
  habitLogs
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
  const [taskType, setTaskType] = useState<'event' | 'task' | 'atomic_habit' | 'break'>('event');

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title);
        setTaskType((editingTask.type as any) || 'event');

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
        setTaskType('event');
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

    const startDate = new Date(`${dateInput}T${startTimeInput}:00`);
    const endDate = new Date(`${dateInput}T${endTimeInput}:00`);

    // If end time is before start time, assume it spans across midnight to the next day
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    let computedRecurrence = 'none';
    if (selectedDays.length > 7) computedRecurrence = 'daily';
    else if (selectedDays.length === 6 && [1, 2, 3, 4, 5].every(d => selectedDays.includes(d))) computedRecurrence = 'weekdays';
    else if (selectedDays.length > 0) computedRecurrence = selectedDays.sort().join(',');

    onSave({
      title,
      start_time: startIso,
      end_time: endIso,
      recurrence: computedRecurrence,
      type: taskType,
    });
  };

  const allDays = [0, 1, 2, 3, 4, 5, 6, 8];
  const weekDays = [1, 2, 3, 4, 5, 6,];

  const filterUniqueDays = (days: (string | undefined)[]): (string | undefined)[] => {
    const uniqueDays = new Set(days)

    return [...uniqueDays];
  }

  const handlSetSelectedDays = (num: number): void => {
    if (num === 7) setSelectedDays([...selectedDays, ...weekDays]);

    if (num === 8) setSelectedDays([...selectedDays, ...allDays]);

    if (num <= 6) setSelectedDays([...selectedDays, num]);

  }

  const handleUnselectDays = (num: number): void => {
    if (num === 7) setSelectedDays((selectedDays.filter(d => !weekDays.includes(d))));

    if (num === 8) setSelectedDays(selectedDays.filter(d => !allDays.includes(d)));

    if (num <= 6) setSelectedDays(selectedDays.filter(d => d != num));

  }

  const getRecurrenceText = () => {
    if (selectedDays.length === 0) return 'Does not repeat';
    if (selectedDays.length === 8) return 'Daily';
    if (selectedDays.length === 6 && [1, 2, 3, 4, 5].every(d => selectedDays.includes(d))) return 'Every weekday (Monday to Friday)';

    // Custom format: "Weekly on Mon, Wed"
    const sortedDays = [...selectedDays].sort();
    const dayLabels = sortedDays.map(d => DAYS_OF_WEEK.slice(0, 6).find(dw => dw.value === d)?.label.slice(0, 3));
    return `Weekly on ${filterUniqueDays(dayLabels).join(', ')}`;
  };

  const isEditingHabit = editingTask?.type === 'atomic_habit' && editingTask?._id;
  const isCompletedForSelectedDay = isEditingHabit && habitLogs?.[editingTask._id as string]?.some((log: any) => log.date === dateInput && log.completed);

  return (
    <div
      className="fixed top-0 left-0 w-full h-full z-[9999] flex items-center justify-center p-4 shadow-xl"
    >
      {/* Click outside to close */}
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />

      <div className="relative z-10 flex w-full max-w-[480px] flex-col overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-modal)] pointer-events-auto">

        {/* Top Handle / Close Bar */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-muted)] px-4 py-3">
          <button className="rounded p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-border-strong)]">
            {/* <GripHorizontal className="w-5 h-5" /> */}
          </button>
          <button onClick={onClose} className="rounded-full p-1.5 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border-strong)]">
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
              className="w-full border-b-2 border-[var(--color-brand-primary-hover)] bg-transparent pb-1 text-[22px] font-normal text-[var(--color-text-secondary)] placeholder-[var(--color-text-muted)] focus:outline-none"
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
          <div className="ml-10 flex items-center gap-2 mb-6 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setTaskType('event')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${taskType === 'event' ? 'bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
            >
              Event
            </button>
            <button
              onClick={() => setTaskType('task')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${taskType === 'task' ? 'bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
            >
              Task
            </button>
            <button
              onClick={() => setTaskType('break')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${taskType === 'break' ? 'bg-[var(--color-brand-break-soft)] text-[var(--color-brand-break-strong)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
            >
              Break
            </button>
            <div
              onClick={() => {
                setTaskType('atomic_habit');
                setSelectedDays([0, 1, 2, 3, 4, 5, 6]); // Default daily for habits
              }}
              className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${taskType === 'atomic_habit' ? 'bg-[var(--color-brand-purple-soft)] text-[var(--color-brand-purple-strong)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'}`}
            >
              Atomic Habit
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--color-text-inverse)] ${taskType === 'atomic_habit' ? 'bg-[var(--color-brand-purple-strong)]' : 'bg-[var(--color-brand-primary)]'}`}>New</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Time Row */}
            <div className="flex items-start gap-4">
              <Clock className="mt-1 h-5 w-5 text-[var(--color-text-muted)]" />
              <div>
                <div className="flex gap-2 items-center mb-1">
                  <input type="date" className="rounded border border-[var(--color-border-strong)] p-1 text-sm outline-none focus:border-[var(--color-brand-primary-hover)]" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
                  <input type="time" className="rounded border border-[var(--color-border-strong)] p-1 text-sm outline-none focus:border-[var(--color-brand-primary-hover)]" value={startTimeInput} onChange={(e) => setStartTimeInput(e.target.value)} />
                  <span className="text-[var(--color-text-muted)]">&ndash;</span>
                  <input type="time" className="rounded border border-[var(--color-border-strong)] p-1 text-sm outline-none focus:border-[var(--color-brand-primary-hover)]" value={endTimeInput} onChange={(e) => setEndTimeInput(e.target.value)} />
                </div>
                <div className="relative text-sm mt-1">
                  <div
                    className="ml-[-0.5rem] flex w-fit cursor-pointer items-center gap-1 rounded px-2 py-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                    onClick={() => setShowRecDropdown(!showRecDropdown)}
                  >
                    <span>{getRecurrenceText()}</span>
                  </div>

                  {showRecDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowRecDropdown(false)} />
                      <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-md border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] py-2 shadow-lg">
                        <div className="mb-2 border-b border-[var(--color-border-subtle)] px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                          Repeat on
                        </div>
                        {DAYS_OF_WEEK.map(day => (
                          <label key={day.value} className="flex cursor-pointer items-center gap-3 px-4 py-1 hover:bg-[var(--color-bg-hover-subtle)]">
                            <input
                              type="checkbox"
                              className="h-4 w-4 cursor-pointer rounded border-[var(--color-border-strong)] text-[var(--color-brand-primary-hover)] focus:ring-[var(--color-brand-primary-hover)]"
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
                            <span className="select-none text-sm text-[var(--color-text-secondary)]">{day.label}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Guests Row */}
            {/* <div className="flex items-center gap-4">
              <Users className="h-5 w-5 text-[var(--color-text-muted)]" />
              <div className="cursor-pointer text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Add guests</div>
            </div> */}

            {/* Meet Row */}
            {/* <div className="flex items-center gap-4">
              <Video className="h-5 w-5 text-[var(--color-brand-primary-hover)]" />
              <button className="w-full rounded bg-[var(--color-bg-surface-soft)] px-4 py-2 text-left text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface-soft-hover)]">
                Add Google Meet video conferencing
              </button>
            </div> */}

            {/* Location Row */}
            {/* <div className="flex items-center gap-4">
              <MapPin className="h-5 w-5 text-[var(--color-text-muted)]" />
              <div className="cursor-pointer text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Add location</div>
            </div> */}

            {/* Description Row */}
            {/* <div className="flex items-center gap-4">
              <AlignLeft className="h-5 w-5 text-[var(--color-text-muted)]" />
              <div className="cursor-pointer text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Add description or a Google Drive attachment</div>
            </div> */}

            {/* Calendar Owner Row */}
            {/* <div className="flex items-start gap-4">
              <CalendarIcon className="mt-1 h-5 w-5 text-[var(--color-text-muted)]" />
              <div>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  Username <span className="inline-block h-3 w-3 rounded-full bg-[var(--color-brand-cyan)]"></span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Busy · Default visibility · Notify 30 minutes before</div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Footer Area */}
        <div className="mt-2 flex items-center justify-between bg-[var(--color-bg-surface)] px-6 py-4">
          <div>
            {editingTask && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded px-3 py-2 text-sm font-medium text-[var(--color-brand-red-strong)] transition-colors hover:bg-[var(--color-brand-red-soft)]"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isEditingHabit && onToggleHabit && (
              <button
                type="button"
                onClick={() => onToggleHabit(editingTask._id!, dateInput)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${isCompletedForSelectedDay ? 'bg-[var(--color-brand-success-soft)] text-[var(--color-brand-success-strong)] hover:bg-[var(--color-brand-success-soft)]' : 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-strong)]'}`}
              >
                {isCompletedForSelectedDay ? '✓ Completed' : 'Mark Complete'}
              </button>
            )}
            <button
              type="button"
              className="rounded px-3 py-2 text-sm font-medium text-[var(--color-brand-primary)] transition-colors hover:bg-[var(--color-brand-primary-softer)]"
            >
              More options
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="rounded-full bg-[var(--color-brand-primary)] px-6 py-2 text-sm font-medium text-[var(--color-text-inverse)] shadow-sm transition-colors hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
