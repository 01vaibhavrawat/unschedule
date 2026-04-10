"use client";

import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, EventDropArg } from '@fullcalendar/core';
import { EventResizeDoneArg } from '@fullcalendar/interaction';
import { TaskModal } from './TaskModal';

interface Task {
  _id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  type: string;
}

interface CalendarComponentProps {
  tasks: Task[];
  onUpdateTask: (id: string, updatedTask: Partial<Task>) => void;
  onCreateTask: (task: Omit<Task, '_id'>) => void;
}

export default function CalendarComponent({ tasks, onUpdateTask, onCreateTask }: CalendarComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStart, setModalStart] = useState<Date | null>(null);
  const [modalEnd, setModalEnd] = useState<Date | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  // Map Backend Task model to FullCalendar Event model
  const events = tasks.map(task => ({
    id: task._id,
    title: task.title,
    start: task.start_time,
    end: task.end_time,
    backgroundColor: task.status === 'completed' ? '#059669' : '#3b82f6', // emerald-600 vs blue-500
    borderColor: task.status === 'completed' ? '#047857' : '#2563eb',
    classNames: ['text-sm', 'font-medium', 'rounded-md', 'border-0', 'shadow-sm', 'p-1', 'cursor-pointer'],
  }));

  const handleDateClick = (arg: DateClickArg) => {
    setModalStart(arg.date);
    // DateClick usually doesn't have an end time, we'll let the modal handle default 1h duration
    setModalEnd(null); 
    setIsModalOpen(true);
  };

  const handleSelect = (arg: any) => {
    setModalStart(arg.start);
    setModalEnd(arg.end);
    setIsModalOpen(true);
    calendarRef.current?.getApi().unselect();
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

  const handleModalSave = (taskData: { title: string; start_time: string; end_time: string }) => {
    onCreateTask({
      ...taskData,
      status: 'pending',
      type: 'task',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="h-full w-full bg-slate-900 rounded-xl overflow-hidden calendar-container">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        editable={true} // enables dragging and resizing
        selectable={true} // enables click and drag to select range
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        dateClick={handleDateClick}
        select={handleSelect}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        nowIndicator={true}
        height="700px"
        allDaySlot={false}
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
      />

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        initialStart={modalStart}
        initialEnd={modalEnd}
      />
    </div>
  );
}
