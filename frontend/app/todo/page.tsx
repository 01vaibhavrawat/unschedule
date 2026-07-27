"use client";
import React, { useState } from 'react';
import { useStore, Task } from '@/store/useStore';
import { TaskModal } from '@/components/TaskModal';
import { Plus, Check, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ToDoPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleHabitLog, habitLogs, streaks } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
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

  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const { _id, user_id, ...rest } = task as any;
    updateTask(_id, { ...rest, status: newStatus });
  };

  // Sort tasks: pending first, then by date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master To-Do List</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all your scheduled and unscheduled tasks</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No tasks found. Click "Add Task" to create one.
            </div>
          ) : (
            sortedTasks.map(task => {
              const isCompleted = task.status === 'completed';
              return (
                <div 
                  key={task._id}
                  className={`bg-white border rounded-2xl p-4 flex items-center gap-4 transition-all hover:shadow-md ${
                    isCompleted ? 'border-gray-100 opacity-60 bg-gray-50' : 'border-gray-200 cursor-pointer'
                  }`}
                  onClick={() => handleEditClick(task)}
                >
                  <button 
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 text-transparent hover:border-indigo-400'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskStatus(task);
                    }}
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-base truncate ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>{format(new Date(task.start_time), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{format(new Date(task.start_time), 'h:mm a')} - {format(new Date(task.end_time), 'h:mm a')}</span>
                      </div>
                      {task.type !== 'task' && (
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">
                          {task.type.replace('_', ' ')}
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

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        onDelete={handleModalDelete}
        initialStart={new Date()}
        initialEnd={new Date(new Date().getTime() + 60 * 60 * 1000)}
        editingTask={editingTask}
        onToggleHabit={toggleHabitLog}
        habitLogs={habitLogs}
        streaks={streaks}
      />
    </div>
  );
}
