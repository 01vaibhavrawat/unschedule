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
  onEventClick?: (task: Task) => void;
}

export default function CalendarComponent({ tasks, onUpdateTask, onCreateTask, calendarRef, onDateSelect, onEventClick }: CalendarComponentProps) {


  // Map Backend Task model to FullCalendar Event model
  const events = tasks.map(task => {
    const baseEvent: any = {
      id: task._id,
      title: task.title,
      backgroundColor: task.status === 'completed' ? '#059669' : '#3b82f6', // emerald-600 vs blue-500
      borderColor: task.status === 'completed' ? '#047857' : '#2563eb',
      classNames: ['text-sm', 'font-medium', 'rounded-md', 'border-0', 'shadow-sm', 'p-1', 'cursor-pointer'],
    };

    if (task.recurrence && task.recurrence !== 'none') {
      const st = new Date(task.start_time);
      const et = new Date(task.end_time);

      // FullCalendar expects 'HH:MM' string for startTime/endTime
      baseEvent.startTime = st.toTimeString().slice(0, 5);
      baseEvent.endTime = et.toTimeString().slice(0, 5);

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
        onEventClick(task);
      }
    }
  };



  return (
    <div className="flex-1 w-full bg-white overflow-hidden calendar-container">
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
      />
    </div>
  );
}
