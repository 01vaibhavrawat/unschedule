"use client";

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, EventDropArg } from '@fullcalendar/core';
import { EventResizeDoneArg } from '@fullcalendar/interaction';

interface Task {
  _id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  type: string;
  recurrence: string;
}

interface CalendarComponentProps {
  tasks: Task[];
  onUpdateTask: (id: string, updatedTask: Partial<Task>) => void;
  onCreateTask: (task: Omit<Task, '_id'>) => void;
  calendarRef?: React.RefObject<FullCalendar | null>;
  onDateSelect?: (start: Date, end: Date | null) => void;
  onEventClick?: (task: Task, instanceStart: Date) => void;
  streaks?: Record<string, number>;
  habitLogs?: Record<string, any[]>;
}

export default function CalendarComponent({ tasks, onUpdateTask, onCreateTask, calendarRef, onDateSelect, onEventClick, streaks = {}, habitLogs = {} }: CalendarComponentProps) {


  // Map Backend Task model to FullCalendar Event model
  const events = tasks.map(task => {
    const isAtomicHabit = task.type === 'atomic_habit';
    const isBreak = task.type === 'break';
    let displayTitle = task.title;

    if (isAtomicHabit) {
      const streakCount = streaks[task._id] || 0;
      displayTitle = `🔥 ${streakCount} ${task.title}`;
    }

    const baseEvent: any = {
      id: task._id,
      title: displayTitle,
      backgroundColor: isAtomicHabit
        ? 'var(--calendar-event-habit-bg)'
        : isBreak
          ? 'var(--calendar-event-break-bg)'
          : (task.status === 'completed' ? 'var(--calendar-event-completed-bg)' : 'var(--calendar-event-default-bg)'),
      borderColor: isAtomicHabit
        ? 'var(--calendar-event-habit-border)'
        : isBreak
          ? 'var(--calendar-event-break-border)'
          : (task.status === 'completed' ? 'var(--calendar-event-completed-border)' : 'var(--calendar-event-default-border)'),
      classNames: ['text-sm', 'font-medium', 'rounded-md', 'border-0', 'shadow-sm', 'p-1', 'cursor-pointer'],
      extendedProps: { type: task.type, status: task.status }
    };

    if (task.recurrence && task.recurrence !== 'none') {
      const st = new Date(task.start_time);
      const et = new Date(task.end_time);

      const formatTime = (d: Date) => d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');

      // FullCalendar expects 'HH:MM' string for startTime/endTime
      baseEvent.startTime = formatTime(st);
      baseEvent.endTime = formatTime(et);

      if (task.recurrence === 'weekdays') {
        baseEvent.daysOfWeek = [1, 2, 3, 4, 5];
      } else if (task.recurrence === 'daily') {
        baseEvent.daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
      } else {
        // Assume comma-separated list of day numbers (e.g., "1,3,5")
        baseEvent.daysOfWeek = task.recurrence.split(',').map(Number);
      }
    } else {
      baseEvent.start = task.start_time;
      baseEvent.end = task.end_time;
    }

    return baseEvent;
  });

  const handleDateClick = (arg: DateClickArg) => {
    if (onDateSelect) onDateSelect(arg.date, null);
  };

  const handleSelect = (arg: any) => {
    if (onDateSelect) onDateSelect(arg.start, arg.end);
    if (calendarRef?.current) {
      calendarRef.current.getApi().unselect();
    }
  };

  const handleEventDrop = (arg: EventDropArg) => {
    const updatedStart = arg.event.start?.toISOString();
    const updatedEnd = arg.event.end?.toISOString() || updatedStart;
    if (updatedStart) {
      onUpdateTask(arg.event.id, {
        start_time: updatedStart,
        end_time: updatedEnd
      });
    }
  };

  const handleEventResize = (arg: EventResizeDoneArg) => {
    const updatedStart = arg.event.start?.toISOString();
    const updatedEnd = arg.event.end?.toISOString();
    if (updatedStart && updatedEnd) {
      onUpdateTask(arg.event.id, {
        start_time: updatedStart,
        end_time: updatedEnd
      });
    }
  };

  const handleEventClick = (arg: EventClickArg) => {
    if (onEventClick) {
      const task = tasks.find(t => t._id === arg.event.id);
      if (task) {
        onEventClick(task, arg.event.start || new Date(task.start_time));
      }
    }
  };



  return (
    <div className="calendar-container flex-1 w-full overflow-hidden bg-[var(--color-bg-surface)]">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={false}
        events={events}
        editable={true} // enables dragging and resizing
        selectable={true} // enables click and drag to select range
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        dateClick={handleDateClick}
        select={handleSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        nowIndicator={true}
        height="100%"
        allDaySlot={false}
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        displayEventTime={false}
      />
    </div>
  );
}
