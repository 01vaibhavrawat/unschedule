import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    start_time: string;
    end_time: string;
    recurrence?: string;
    type?: string;
  }) => void;
  onDelete?: () => void;
  initialStart?: Date | null;
  initialEnd?: Date | null;
  editingTask?: {
    _id?: string;
    title: string;
    start_time: string;
    end_time: string;
    recurrence?: string;
    type?: string;
  } | null;
  onToggleHabit?: (habitId: string, date: string) => Promise<void>;
  habitLogs?: Record<string, any[]>;
  streaks?: Record<string, number>;
  defaultType?: 'event' | 'task' | 'break';
  hideTypeSelector?: boolean;
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
  habitLogs,
  streaks = {},
  defaultType,
  hideTypeSelector
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

  const allDays = [0, 1, 2, 3, 4, 5, 6];
  const weekDays = [1, 2, 3, 4, 5];

  const [title, setTitle] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [startTimeInput, setStartTimeInput] = useState('');
  const [endTimeInput, setEndTimeInput] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [showRecDropdown, setShowRecDropdown] = useState(false);

  const [taskType, setTaskType] = useState<
    'event' | 'task' | 'break'
  >(defaultType || 'event');

  useEffect(() => {
    if (!isOpen) return;

    if (editingTask) {
      setTitle(editingTask.title);
      setTaskType((editingTask.type as any) || 'event');

      if (editingTask.recurrence === 'daily') {
        setSelectedDays(allDays);
      } else if (editingTask.recurrence === 'weekdays') {
        setSelectedDays(weekDays);
      } else if (
        editingTask.recurrence &&
        editingTask.recurrence !== 'none'
      ) {
        setSelectedDays(
          editingTask.recurrence
            .split(',')
            .map(Number)
            .filter(n => !Number.isNaN(n))
        );
      } else {
        setSelectedDays([]);
      }

      const st = new Date(editingTask.start_time);
      const et = new Date(editingTask.end_time);

      const formatTime = (d: Date) =>
        d.getHours().toString().padStart(2, '0') +
        ':' +
        d.getMinutes().toString().padStart(2, '0');

      setDateInput(editingTask.start_time.split('T')[0]);
      setStartTimeInput(formatTime(st));
      setEndTimeInput(formatTime(et));
    } else {
      setTitle('');
      setTaskType(defaultType || 'event');
      setSelectedDays([]);

      const st = initialStart || new Date();
      const et = initialEnd || new Date(st.getTime() + 60 * 60 * 1000);

      const formatTime = (d: Date) =>
        d.getHours().toString().padStart(2, '0') +
        ':' +
        d.getMinutes().toString().padStart(2, '0');

      const offset = st.getTimezoneOffset() * 60000;
      const localDateStr = new Date(st.getTime() - offset)
        .toISOString()
        .split('T')[0];

      setDateInput(localDateStr);
      setStartTimeInput(formatTime(st));
      setEndTimeInput(formatTime(et));
    }
  }, [isOpen, editingTask, initialStart, initialEnd]);

  if (!isOpen) return null;

  const isDaily = () =>
    allDays.every(d => selectedDays.includes(d));

  const isWeekdays = () =>
    weekDays.every(d => selectedDays.includes(d)) &&
    selectedDays.length === 5;

  const handleSave = () => {
    if (
      !title.trim() ||
      !dateInput ||
      !startTimeInput ||
      !endTimeInput
    ) {
      return;
    }

    const startDate = new Date(`${dateInput}T${startTimeInput}:00`);
    const endDate = new Date(`${dateInput}T${endTimeInput}:00`);

    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const sortedDays = [...selectedDays].sort((a, b) => a - b);

    let computedRecurrence = 'none';

    if (isDaily()) {
      computedRecurrence = 'daily';
    } else if (isWeekdays()) {
      computedRecurrence = 'weekdays';
    } else if (sortedDays.length > 0) {
      computedRecurrence = sortedDays.join(',');
    }

    onSave({
      title,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      recurrence: computedRecurrence,
      type: taskType,
    });
  };

  const handlSetSelectedDays = (num: number): void => {
    setSelectedDays(prev => {
      const updated = new Set(prev);

      if (num === 7) {
        weekDays.forEach(d => updated.add(d));
      } else if (num === 8) {
        allDays.forEach(d => updated.add(d));
      } else {
        updated.add(num);
      }

      return [...updated].sort((a, b) => a - b);
    });
  };

  const handleUnselectDays = (num: number): void => {
    setSelectedDays(prev => {
      if (num === 7) {
        return prev.filter(d => !weekDays.includes(d));
      }

      if (num === 8) {
        return [];
      }

      return prev.filter(d => d !== num);
    });
  };

  const getRecurrenceText = () => {
    if (selectedDays.length === 0) {
      return 'Does not repeat';
    }

    if (isDaily()) {
      return 'Daily';
    }

    if (isWeekdays()) {
      return 'Every weekday (Monday to Friday)';
    }

    const sortedDays = [...selectedDays].sort((a, b) => a - b);

    const dayLabels = sortedDays.map(
      d =>
        DAYS_OF_WEEK.find(dw => dw.value === d)?.label.slice(0, 3)
    );

    return `Weekly on ${dayLabels.join(', ')}`;
  };

  const isEditingHabit = false;
  const isCompletedForSelectedDay = false;

  return (
    <div className="fixed top-0 left-0 z-[100] flex h-full w-full items-center justify-center p-4 shadow-xl">
      <div
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
      />

      <div className="relative z-10 flex w-full max-w-[480px] flex-col overflow-visible rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-modal)] pointer-events-auto">

        {/* Header */}
        <div className={`flex items-center justify-between border-b border-[var(--color-border-subtle)] px-4 py-3 bg-[var(--color-bg-surface-muted)]`}>
          <div />
          <button
            onClick={onClose}
            className={`rounded-full p-1.5 transition-colors text-[var(--color-text-secondary)] hover:bg-[var(--color-border-strong)]`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* Title */}
          <div className="mb-4 ml-10">
            <input
              type="text"
              autoFocus
              placeholder="Add title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') onClose();
              }}
              className="w-full border-b-2 border-[var(--color-brand-primary-hover)] bg-transparent pb-1 text-[22px] font-normal text-[var(--color-text-secondary)] placeholder-[var(--color-text-muted)] focus:outline-none"
            />
          </div>

          {/* Tabs */}
          {!hideTypeSelector && (
            <div className="mb-6 ml-10 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
              {['event', 'task', 'break'].map(type => (
                <button
                  key={type}
                  onClick={() => setTaskType(type as any)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${taskType === type
                      ? 'bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Time Section */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Clock className="mt-1 h-5 w-5 text-[var(--color-text-muted)]" />

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <input
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="rounded border border-[var(--color-border-strong)] p-1 text-sm outline-none focus:border-[var(--color-brand-primary-hover)]"
                  />

                  <input
                    type="time"
                    value={startTimeInput}
                    onChange={(e) => setStartTimeInput(e.target.value)}
                    className="rounded border border-[var(--color-border-strong)] p-1 text-sm outline-none focus:border-[var(--color-brand-primary-hover)]"
                  />

                  <span className="text-[var(--color-text-muted)]">
                    –
                  </span>

                  <input
                    type="time"
                    value={endTimeInput}
                    onChange={(e) => setEndTimeInput(e.target.value)}
                    className="rounded border border-[var(--color-border-strong)] p-1 text-sm outline-none focus:border-[var(--color-brand-primary-hover)]"
                  />
                </div>

                {/* Recurrence */}
                <div className="relative mt-1 text-sm">
                  <div
                    className="ml-[-0.5rem] flex w-fit cursor-pointer items-center gap-1 rounded px-2 py-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                    onClick={() =>
                      setShowRecDropdown(!showRecDropdown)
                    }
                  >
                    <span>{getRecurrenceText()}</span>
                  </div>

                  {showRecDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() =>
                          setShowRecDropdown(false)
                        }
                      />

                      <div className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-md border border-[var(--color-border-muted)] bg-[var(--color-bg-surface)] py-2 shadow-lg">
                        <div className="mb-2 border-b border-[var(--color-border-subtle)] px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                          Repeat on
                        </div>

                        {DAYS_OF_WEEK.map(day => (
                          <label
                            key={day.value}
                            className="flex cursor-pointer items-center gap-3 px-4 py-1 hover:bg-[var(--color-bg-hover-subtle)]"
                          >
                            <input
                              type="checkbox"
                              checked={
                                day.value === 7
                                  ? isWeekdays()
                                  : day.value === 8
                                    ? isDaily()
                                    : selectedDays.includes(day.value)
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handlSetSelectedDays(day.value);
                                } else {
                                  handleUnselectDays(day.value);
                                }
                              }}
                              className="h-4 w-4 cursor-pointer rounded border-[var(--color-border-strong)] text-[var(--color-brand-primary-hover)] focus:ring-[var(--color-brand-primary-hover)]"
                            />

                            <span className="select-none text-sm text-[var(--color-text-secondary)]">
                              {day.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
                onClick={() =>
                  onToggleHabit(editingTask._id!, dateInput)
                }
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${isCompletedForSelectedDay
                    ? 'bg-[var(--color-brand-success-soft)] text-[var(--color-brand-success-strong)]'
                    : 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-strong)]'
                  }`}
              >
                {isCompletedForSelectedDay
                  ? '✓ Completed'
                  : 'Mark Complete'}
              </button>
            )}

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