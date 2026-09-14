'use client';

import React, { useState, useMemo } from 'react';
import { Task } from '@/store/useStore';
import { format, isBefore, parseISO, startOfDay, isToday, isTomorrow } from 'date-fns';
import { CheckCircle2, Circle, Calendar, Clock, Plus } from 'lucide-react';

export interface FocusTasksSectionProps {
  tasks: Task[];
  onToggleTaskStatus: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onAddTask: () => void;
}

type FilterTab = 'today' | 'all' | 'done';

export const FocusTasksSection: React.FC<FocusTasksSectionProps> = ({
  tasks,
  onToggleTaskStatus,
  onEditTask,
  onAddTask,
}) => {
  const [filter, setFilter] = useState<FilterTab>('today');
  const now = useMemo(() => new Date(), []);
  const todayStart = useMemo(() => startOfDay(now), [now]);

  // Non-habit tasks
  const validTasks = useMemo(() => {
    return tasks.filter((t) => t.type !== 'atomic_habit');
  }, [tasks]);

  // Counts
  const pendingCount = useMemo(() => {
    return validTasks.filter((t) => t.status !== 'completed').length;
  }, [validTasks]);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    let list = [...validTasks];

    if (filter === 'today') {
      list = list.filter((t) => {
        try {
          const taskDate = parseISO(t.start_time);
          return isToday(taskDate) || (isBefore(taskDate, todayStart) && t.status !== 'completed');
        } catch {
          return true;
        }
      });
    } else if (filter === 'done') {
      list = list.filter((t) => t.status === 'completed');
    }

    // Sort: incomplete first, then by start_time
    return list.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    });
  }, [validTasks, filter, todayStart]);

  const formatDateLabel = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      return format(date, 'MMM d');
    } catch {
      return dateStr;
    }
  };

  const formatTimeRange = (startStr: string, endStr: string) => {
    try {
      return `${format(parseISO(startStr), 'h:mm a')} - ${format(parseISO(endStr), 'h:mm a')}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <h2 className="text-gray-900 font-bold text-base truncate">Focus Tasks</h2>
          {pendingCount > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex-shrink-0">
              {pendingCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Filter Pills */}
          <div className="flex items-center bg-gray-100/80 p-0.5 rounded-lg text-xs font-medium text-gray-500">
            <button
              onClick={() => setFilter('today')}
              className={`px-2 py-1 rounded-md transition-all ${
                filter === 'today'
                  ? 'bg-white text-gray-900 font-semibold shadow-xs'
                  : 'hover:text-gray-800'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded-md transition-all ${
                filter === 'all'
                  ? 'bg-white text-gray-900 font-semibold shadow-xs'
                  : 'hover:text-gray-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('done')}
              className={`px-2 py-1 rounded-md transition-all ${
                filter === 'done'
                  ? 'bg-white text-gray-900 font-semibold shadow-xs'
                  : 'hover:text-gray-800'
              }`}
            >
              Done
            </button>
          </div>

          <button
            onClick={onAddTask}
            title="Add task"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-500 transition-colors ml-1"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="h-full min-h-[100px] flex flex-col items-center justify-center text-center p-4">
            <p className="text-xs text-gray-400 italic">
              {filter === 'today'
                ? 'No tasks due today. Take a breather or add one!'
                : filter === 'done'
                ? 'No completed tasks yet.'
                : 'No tasks found. Click "+" to create one.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue =
              !isCompleted &&
              (() => {
                try {
                  return isBefore(parseISO(task.start_time), todayStart);
                } catch {
                  return false;
                }
              })();

            return (
              <div
                key={task._id}
                onClick={() => onEditTask(task)}
                className={`group flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isCompleted
                    ? 'border-gray-100 bg-gray-50/60 opacity-60'
                    : 'border-gray-100 hover:border-emerald-200 bg-white hover:shadow-xs'
                }`}
              >
                {/* Complete checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTaskStatus(task);
                  }}
                  className={`mt-0.5 transition-colors flex-shrink-0 ${
                    isCompleted ? 'text-emerald-500' : 'text-gray-300 hover:text-emerald-500'
                  }`}
                  title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                >
                  <Circle className={`w-4 h-4 ${isCompleted ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                </button>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-xs font-semibold block truncate leading-snug ${
                      isCompleted ? 'line-through text-gray-400' : 'text-gray-800'
                    }`}
                  >
                    {task.title}
                  </span>

                  <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[11px] text-gray-500">
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{formatDateLabel(task.start_time)}</span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{formatTimeRange(task.start_time, task.end_time)}</span>
                    </div>

                    {isOverdue && (
                      <span className="text-[9px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-1 py-0.2 rounded uppercase tracking-wider flex-shrink-0">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
