"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useStore, Task } from '@/store/useStore';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import FullCalendar from '@fullcalendar/react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { TaskModal } from '@/components/TaskModal';

const DynamicCalendar = dynamic(() => import('@/components/CalendarComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-white flex items-center justify-center text-gray-400">Loading Calendar view...</div>
});

export default function Home() {
  const { tasks, habits, goals, habitLogs, streaks, fetchInitialData, toggleHabitLog, updateTask, addTask, deleteTask } = useStore();
  const calendarRef = useRef<FullCalendar>(null);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('timeGridWeek');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStart, setModalStart] = useState<Date | null>(null);
  const [modalEnd, setModalEnd] = useState<Date | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Calendar Controls
  const handlePrev = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.prev();
      setCurrentDate(api.getDate());
    }
  };

  const handleNext = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.next();
      setCurrentDate(api.getDate());
    }
  };

  const handleToday = () => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.today();
      setCurrentDate(api.getDate());
    }
  };

  const handleViewChange = (view: string) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView(view);
      setCurrentView(view);
    }
  };

  const handleMiniCalendarSelect = (dateStr: string) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.gotoDate(dateStr);
      setCurrentDate(api.getDate());
    }
  };

  // Modal Handlers
  const openCreateModal = (start?: Date, end?: Date | null) => {
    setEditingTask(null);
    setModalStart(start || new Date());
    setModalEnd(end || null);
    setIsModalOpen(true);
  };

  const handleEventClick = (task: Task, instanceStart?: Date) => {
    setEditingTask(task);
    const dateToUse = instanceStart || new Date(task.start_time);
    const startObj = new Date(task.start_time);
    const endObj = new Date(task.end_time);
    const durationMs = endObj.getTime() - startObj.getTime();
    
    setModalStart(dateToUse);
    setModalEnd(new Date(dateToUse.getTime() + durationMs));
    setIsModalOpen(true);
  };

  const handleModalSave = (taskData: { title: string; start_time: string; end_time: string; recurrence?: string; type?: string }) => {
    if (editingTask) {
      updateTask(editingTask._id, taskData);
    } else {
      addTask({
        ...taskData,
        status: 'pending',
        type: taskData.type || 'task',
      });
    }
    setIsModalOpen(false);
  };

  const handleModalDelete = () => {
    if (editingTask) {
      deleteTask(editingTask._id);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden text-gray-800">
      <Header 
        currentDate={currentDate}
        currentView={currentView}
        onPrevClick={handlePrev}
        onNextClick={handleNext}
        onTodayClick={handleToday}
        onViewChange={handleViewChange}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onCreateClick={() => openCreateModal()}
          goals={goals}
          habits={habits}
          tasks={tasks}
          habitLogs={habitLogs}
          toggleHabitLog={toggleHabitLog}
          todayStr={todayStr}
          onMiniCalendarSelect={handleMiniCalendarSelect}
          currentDate={currentDate}
        />
        
        <main className="flex-1 overflow-hidden p-2 flex flex-col">
          <DynamicCalendar 
            tasks={tasks}
            streaks={streaks}
            habitLogs={habitLogs}
            onUpdateTask={(id, partialTask) => {
              const existing = tasks.find(t => t._id === id);
              if (existing) {
                updateTask(id, { ...existing, ...partialTask });
              }
            }}
            onCreateTask={addTask}
            calendarRef={calendarRef}
            onDateSelect={(start: Date, end: Date | null) => openCreateModal(start, end)}
            onEventClick={handleEventClick}
          />
        </main>
      </div>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        onDelete={handleModalDelete}
        initialStart={modalStart}
        initialEnd={modalEnd}
        editingTask={editingTask}
        onToggleHabit={toggleHabitLog}
        habitLogs={habitLogs}
      />
    </div>
  );
}
