"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore, Task } from '@/store/useStore';
import { Plus, Search, FileText, Trash2, Save, FolderOpen, Menu, PanelLeftClose, CheckCircle2, ChevronLeft, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useAutoSave } from '@/hooks/useAutoSave';
import { FocusTasksSection } from '@/components/FocusTasksSection';
import { TaskModal } from '@/components/TaskModal';

function NoteEditor({ 
  note, 
  updateNote, 
  isSidebarOpen, 
  setIsSidebarOpen,
  onBack,
}: { 
  note: any; 
  updateNote: (id: string, updates: any) => Promise<void>; 
  isSidebarOpen: boolean; 
  setIsSidebarOpen: (v: boolean) => void;
  onBack?: () => void;
}) {
  const [localTitle, setLocalTitle] = useState(note.title || '');
  const [localContent, setLocalContent] = useState(note.content || '');

  const saveToStore = async (data: { title: string; content: string }) => {
    await updateNote(note._id, data);
  };

  const { isSaving, forceSave } = useAutoSave({ title: localTitle, content: localContent }, saveToStore, 1500);

  return (
    <div className="flex flex-col h-full overflow-hidden w-full min-w-0">
      <div className="px-3 sm:px-8 py-3 sm:py-5 border-b border-[var(--color-border-subtle)] flex justify-between items-center bg-[var(--color-bg-surface)] sticky top-0 z-10 shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {/* Mobile Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden flex items-center gap-1 p-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] flex-shrink-0 active:scale-95"
              aria-label="Back to notes list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Sidebar Toggle */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="hidden md:flex p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] rounded-lg flex-shrink-0"
              title="Open notes sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Note Title"
            className="text-lg sm:text-2xl font-bold text-[var(--color-text-primary)] outline-none w-full max-w-xl placeholder-gray-400 bg-transparent min-w-0"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className={`text-xs transition-opacity ${isSaving ? 'opacity-100 text-[var(--color-text-muted)] animate-pulse' : 'opacity-0'}`}>
            Saving...
          </span>
          <button
            onClick={forceSave}
            disabled={isSaving || (localTitle === note.title && localContent === note.content)}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 text-xs sm:text-sm font-semibold flex-shrink-0 shadow-xs cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving…' : 'Save'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 sm:p-8 pb-16 md:pb-8">
        <RichTextEditor
          value={localContent}
          onChange={setLocalContent}
          placeholder="Start typing your note here..."
          minHeight="350px"
          borderless={true}
        />
      </div>
    </div>
  );
}

function NotesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id');

  const { notes, addNote, updateNote, deleteNote, tasks, updateTask, addTask, deleteTask, user, setUserMenuOpen } = useStore();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  useEffect(() => {
    if (urlId) {
      setActiveNoteId(urlId);
      sessionStorage.setItem('activeNoteId', urlId);
      setMobileView('detail');
    } else {
      const savedId = sessionStorage.getItem('activeNoteId');
      if (savedId) {
        router.replace(`/notes?id=${savedId}`);
      } else {
        setActiveNoteId('focus-tasks');
      }
    }
  }, [urlId, router]);

  const handleSelectNote = (id: string) => {
    setActiveNoteId(id);
    sessionStorage.setItem('activeNoteId', id);
    setMobileView('detail');
    router.push(`/notes?id=${id}`);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Task modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const activeNote = notes.find(n => n._id === activeNoteId);

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNote = async () => {
    const tempTitle = "Untitled Note";
    const newNote = await addNote({ title: tempTitle, content: "" });
    if (newNote && newNote._id) {
      handleSelectNote(newNote._id);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteNote(id);
      if (activeNoteId === id) {
        sessionStorage.removeItem('activeNoteId');
        setActiveNoteId('focus-tasks');
        setMobileView('list');
        router.push('/notes');
      }
    }
  };

  // Task Handlers
  const toggleTaskStatus = (task: Task) => {
    updateTask(task._id, { status: task.status === 'completed' ? 'pending' : 'completed' });
  };

  const handleSaveTask = async (taskData: any) => {
    if (editingTask) {
      const { _id, user_id, ...rest } = editingTask as any;
      updateTask(editingTask._id, { ...rest, ...taskData });
    } else {
      await addTask(taskData);
    }
    setTaskModalOpen(false);
  };

  const handleDeleteTask = () => {
    if (editingTask) {
      deleteTask(editingTask._id);
    }
    setTaskModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleMobileBackToList = () => {
    setMobileView('list');
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[var(--color-bg-surface)]">
      {/* ── Sidebar Notes & Tasks List ── */}
      <div 
        className={`flex-col bg-[var(--color-bg-surface-muted)] transition-all duration-300 border-r border-[var(--color-border-default)] ${
          // On mobile: full width if viewing list, hidden if viewing detail
          // On desktop: fixed width (w-80) when open, w-0 when closed
          mobileView === 'list' ? 'flex w-full md:w-80' : 'hidden md:flex md:w-80'
        } ${!isSidebarOpen ? 'md:!w-0 md:!overflow-hidden md:!border-none' : ''}`}
      >
        <div className="p-3.5 sm:p-4 border-b border-[var(--color-border-default)]">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-500" />
              My Notes
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCreateNote}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow-xs"
                title="Create Note"
                aria-label="Create Note"
              >
                <Plus className="w-4 h-4" />
              </button>
              {user && (
                <button
                  onClick={() => setUserMenuOpen(true)}
                  className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm active:scale-95 transition-transform"
                  style={{ background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-purple) 100%)' }}
                  aria-label="User settings"
                >
                  {initials}
                </button>
              )}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="hidden md:flex w-8 h-8 items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-border-muted)] transition-colors"
                title="Close Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all shadow-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 sm:p-2 space-y-1 pb-20 md:pb-2">
          {/* Tasks Section Button */}
          <div
            onClick={() => {
              sessionStorage.removeItem('activeNoteId');
              setActiveNoteId('focus-tasks');
              setMobileView('detail');
              router.push('/notes');
            }}
            className={`p-3 rounded-xl cursor-pointer transition-colors group flex items-center gap-3 ${
              activeNoteId === 'focus-tasks' 
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800' 
                : 'hover:bg-[var(--color-bg-hover)] border border-transparent'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeNoteId === 'focus-tasks' ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400' : 'bg-[var(--color-border-muted)] text-[var(--color-text-secondary)]'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`font-semibold text-sm ${activeNoteId === 'focus-tasks' ? 'text-indigo-900 dark:text-indigo-200' : 'text-[var(--color-text-primary)]'}`}>
                Focus Tasks
              </h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Manage your priorities
              </p>
            </div>
          </div>

          <div className="px-3 py-2 mt-2 mb-1 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Notes ({filteredNotes.length})</h3>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--color-text-muted)]">
              No notes found. Tap "+" to create one.
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note._id}
                onClick={() => handleSelectNote(note._id)}
                className={`p-3 rounded-xl cursor-pointer transition-all group relative border ${
                  activeNoteId === note._id 
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 shadow-xs' 
                    : 'hover:bg-[var(--color-bg-hover)] border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2 pr-6">
                  <h4 className={`font-semibold text-sm truncate ${activeNoteId === note._id ? 'text-indigo-900 dark:text-indigo-200' : 'text-[var(--color-text-primary)]'}`}>
                    {note.title || 'Untitled Note'}
                  </h4>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2 leading-relaxed">
                  {note.content?.replace(/<[^>]+>/g, '') || 'No content...'}
                </p>

                {/* Delete Button (visible directly on mobile touch, and on hover on desktop) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note._id);
                  }}
                  className="absolute right-2 top-3 p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-80 md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Main Detail View (Editor or Focus Tasks) ── */}
      <div 
        className={`flex-1 flex-col relative bg-[var(--color-bg-surface)] min-w-0 ${
          // On mobile: show if viewing detail, hide if viewing list
          // On desktop: always show
          mobileView === 'detail' ? 'flex w-full' : 'hidden md:flex'
        }`}
      >
        {activeNoteId === 'focus-tasks' ? (
          <div className="flex-1 p-3 sm:p-8 bg-[var(--color-bg-surface-muted)] flex flex-col items-center overflow-hidden pb-16 md:pb-8">
            <div className="w-full max-w-4xl h-full flex flex-col min-h-0">
              <div className="mb-4 sm:mb-6 flex items-center gap-3 flex-shrink-0">
                {/* Mobile Back Button */}
                <button
                  onClick={handleMobileBackToList}
                  className="md:hidden flex items-center gap-1.5 p-2 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] shadow-xs active:scale-95"
                  aria-label="Back to Notes"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-xs font-semibold">Notes</span>
                </button>

                {!isSidebarOpen && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="hidden md:flex p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] rounded-lg bg-[var(--color-bg-surface)] shadow-xs border border-[var(--color-border-default)]"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                )}
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  Focus Tasks
                </h1>
              </div>
              <div className="flex-1 min-h-0">
                <FocusTasksSection
                  tasks={tasks}
                  onToggleTaskStatus={toggleTaskStatus}
                  onEditTask={handleEditClick}
                  onAddTask={openCreateModal}
                />
              </div>
            </div>
          </div>
        ) : activeNote ? (
          <NoteEditor 
            key={activeNote._id} 
            note={activeNote} 
            updateNote={updateNote} 
            isSidebarOpen={isSidebarOpen} 
            setIsSidebarOpen={setIsSidebarOpen}
            onBack={handleMobileBackToList}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-bg-surface-muted)]/30 relative p-4 text-center">
            <button
              onClick={handleMobileBackToList}
              className="md:hidden absolute top-4 left-4 flex items-center gap-1 p-2 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] text-xs font-semibold shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Notes List
            </button>

            <div className="w-16 h-16 bg-[var(--color-bg-hover)] rounded-2xl flex items-center justify-center mb-4 border border-[var(--color-border-subtle)]">
              <FileText className="w-8 h-8 text-[var(--color-text-muted)]" />
            </div>
            <p className="font-semibold text-sm text-[var(--color-text-primary)]">Select a note or create a new one</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Organize your thoughts, ideas, and meeting notes</p>
            <button
              onClick={handleCreateNote}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Create Note
            </button>
          </div>
        )}
      </div>

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        editingTask={editingTask}
        defaultType="task"
        hideTypeSelector={true}
      />
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center bg-[var(--color-bg-surface)]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
      <NotesContent />
    </Suspense>
  );
}
