"use client";
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Search, FileText, Trash2, Save, FolderOpen, Menu, PanelLeftClose } from 'lucide-react';
import { format } from 'date-fns';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useAutoSave } from '@/hooks/useAutoSave';

function NoteEditor({ note, updateNote, isSidebarOpen, setIsSidebarOpen }: { note: any; updateNote: (id: string, updates: any) => Promise<void>; isSidebarOpen: boolean; setIsSidebarOpen: (v: boolean) => void }) {
  const [localTitle, setLocalTitle] = useState(note.title || '');
  const [localContent, setLocalContent] = useState(note.content || '');

  const saveToStore = async (data: { title: string; content: string }) => {
    await updateNote(note._id, data);
  };

  const { isSaving, forceSave } = useAutoSave({ title: localTitle, content: localContent }, saveToStore, 1500);

  return (
    <div className="flex flex-col h-full overflow-hidden w-full min-w-0">
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Note Title"
            className="text-2xl font-bold text-gray-800 outline-none w-full max-w-xl placeholder-gray-300 bg-transparent min-w-0"
          />
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className={`text-sm transition-opacity ${isSaving ? 'opacity-100 text-gray-500' : 'opacity-0'}`}>
            Saving...
          </span>
          <button
            onClick={forceSave}
            disabled={isSaving || (localTitle === note.title && localContent === note.content)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium flex-shrink-0"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-8">
        <RichTextEditor
          value={localContent}
          onChange={setLocalContent}
          placeholder="Start typing..."
          minHeight="500px"
        />
      </div>
    </div>
  );
}

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useStore();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeNote = notes.find(n => n._id === activeNoteId);

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNote = async () => {
    const tempTitle = "Untitled Note";
    const newNote = await addNote({ title: tempTitle, content: "" });
    if (newNote && newNote._id) {
      setActiveNoteId(newNote._id);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteNote(id);
      if (activeNoteId === id) setActiveNoteId(null);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* Sidebar List */}
      <div className={`border-r border-gray-200 flex flex-col bg-gray-50 transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden border-none'}`}>
        <div className="p-4 border-b border-gray-200 min-w-[320px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-500" />
              My Notes
            </h2>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleCreateNote}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                title="Create Note"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
                title="Close Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              No notes found.
            </div>
          ) : (
            filteredNotes.map(note => (
              <div 
                key={note._id}
                onClick={() => setActiveNoteId(note._id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors group relative ${
                  activeNoteId === note._id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-100 border border-transparent'
                }`}
              >
                <h4 className={`font-medium text-sm truncate pr-6 ${activeNoteId === note._id ? 'text-indigo-900' : 'text-gray-700'}`}>
                  {note.title || 'Untitled Note'}
                </h4>
                <p className="text-xs text-gray-400 mt-1 truncate">
                  {note.content?.replace(/<[^>]+>/g, '') || 'No content...'}
                </p>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note._id);
                  }}
                  className="absolute right-2 top-3 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col relative bg-white min-w-0">
        {activeNote ? (
          <NoteEditor key={activeNote._id} note={activeNote} updateNote={updateNote} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30 relative">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="absolute top-6 left-6 p-2 text-gray-500 hover:bg-gray-100 rounded-lg bg-white shadow-sm border border-gray-200"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <p>Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
