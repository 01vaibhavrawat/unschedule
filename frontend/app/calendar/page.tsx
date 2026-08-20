"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useStore, Task } from '@/store/useStore';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import FullCalendar from '@fullcalendar/react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { TaskModal } from '@/components/TaskModal';
import { api } from '@/lib/api';

const DynamicCalendar = dynamic(() => import('@/components/CalendarComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-white flex items-center justify-center text-gray-400">Loading Calendar view...</div>
});

export default function Home() {
  const { user, tasks, habits, goals, habitLogs, streaks, fetchInitialData, toggleHabitLog, setHabitStatus, updateTask, addTask, deleteTask, addGoal, updateGoal, deleteGoal, setUser, completeOnboarding } = useStore();
  const calendarRef = useRef<FullCalendar>(null);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('timeGridWeek');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStart, setModalStart] = useState<Date | null>(null);
  const [modalEnd, setModalEnd] = useState<Date | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
        setCurrentView('timeGridDay');
        // Update calendar immediately if ref is available
        calendarRef.current?.getApi()?.changeView('timeGridDay');
      } else {
        setIsSidebarOpen(true);
        setCurrentView('timeGridWeek');
        calendarRef.current?.getApi()?.changeView('timeGridWeek');
      }
    };

    // Initial check
    if (typeof window !== 'undefined') {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
        setCurrentView('timeGridDay');
      }
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    // Auth and fetchInitialData are now handled in ClientLayout
    if (user && !user.has_completed_onboarding) {
      useStore.getState().setAssistantOpen(true);
      completeOnboarding();
    }
  }, [user, completeOnboarding]);

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
      const { _id, user_id, ...rest } = editingTask as any;
      updateTask(editingTask._id, { ...rest, ...taskData });
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
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        currentDate={currentDate}
        currentView={currentView}
        onPrevClick={handlePrev}
        onNextClick={handleNext}
        onTodayClick={handleToday}
        onViewChange={handleViewChange}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen}
          onCreateClick={() => openCreateModal()}
          todayStr={todayStr}
          onMiniCalendarSelect={handleMiniCalendarSelect}
          currentDate={currentDate}
        />
        
        <main id="calendar-view" className="flex-1 overflow-hidden p-2 flex flex-col">
          <DynamicCalendar 
            tasks={tasks}
            streaks={streaks}
            habitLogs={habitLogs}
            initialView={currentView}
            onUpdateTask={(id, partialTask) => {
              const existing = tasks.find(t => t._id === id);
              if (existing) {
                const { _id: existingId, user_id, ...rest } = existing as any;
                updateTask(id, { ...rest, ...partialTask });
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
        streaks={streaks}
      />

    </div>
  );
}
