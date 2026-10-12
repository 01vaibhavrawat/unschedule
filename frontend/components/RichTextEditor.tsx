import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Bold, Italic, List, ListOrdered, Table as TableIcon, Trash, Plus, Minus } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  borderless?: boolean;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder,
  className = '',
  minHeight = '120px',
  borderless = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    immediatelyRender: false, // Prevents SSR hydration mismatches in Next.js
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none w-full ${className}`,
        style: `min-height: ${minHeight};`,
      },
    },
  });

  // Keep editor content in sync if value prop changes externally (e.g. selecting different note)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return <div style={{ minHeight }} className={`w-full ${className} ${borderless ? '' : 'border border-[var(--color-border-default)] rounded-xl'} bg-[var(--color-bg-surface-muted)]/50 animate-pulse`} />;
  }

  return (
    <div className={`w-full h-full flex flex-col ${borderless ? 'rounded-xl overflow-hidden' : 'rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-hidden transition-all focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400'}`}>
      {/* ── Toolbar with Touch-Friendly Horizontal Scrolling ── */}
      <div className="flex items-center gap-1 p-1.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-muted)]/60 flex-shrink-0 overflow-x-auto scrollbar-none touch-pan-x">
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
          className={`h-8 w-8 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 ${
            editor.isActive('bold') ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border-muted)] hover:text-[var(--color-text-primary)]'
          }`}
          title="Bold"
          aria-label="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
          className={`h-8 w-8 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 ${
            editor.isActive('italic') ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border-muted)] hover:text-[var(--color-text-primary)]'
          }`}
          title="Italic"
          aria-label="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <div className="w-px h-4 bg-[var(--color-border-default)] mx-0.5 flex-shrink-0" />
        
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
          className={`h-8 w-8 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 ${
            editor.isActive('bulletList') ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border-muted)] hover:text-[var(--color-text-primary)]'
          }`}
          title="Bullet List"
          aria-label="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
          className={`h-8 w-8 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 ${
            editor.isActive('orderedList') ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border-muted)] hover:text-[var(--color-text-primary)]'
          }`}
          title="Numbered List"
          aria-label="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-[var(--color-border-default)] mx-0.5 flex-shrink-0" />

        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); }}
          className="h-8 w-8 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 text-[var(--color-text-secondary)] hover:bg-[var(--color-border-muted)] hover:text-[var(--color-text-primary)]"
          title="Insert Table"
          aria-label="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </button>

        {editor.isActive('table') && (
          <>
            <div className="w-px h-4 bg-[var(--color-border-default)] mx-0.5 flex-shrink-0" />
            <button
              onClick={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }}
              className="h-8 px-2 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0 text-[var(--color-text-secondary)] hover:bg-[var(--color-border-muted)] hover:text-[var(--color-text-primary)] text-xs font-semibold"
              title="Add Row After"
            >
              <Plus className="w-3 h-3" />
              <span>Row</span>
            </button>
            <button
              onClick={(e) => { e.preventDefault(); editor.chain().focus().deleteRow().run(); }}
              className="h-8 px-2 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold"
              title="Delete Row"
            >
              <Minus className="w-3 h-3" />
              <span>Row</span>
            </button>
            <button
              onClick={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }}
              className="h-8 px-2 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0 text-[var(--color-text-secondary)] hover:bg-[var(--color-border-muted)] hover:text-[var(--color-text-primary)] text-xs font-semibold"
              title="Add Column After"
            >
              <Plus className="w-3 h-3" />
              <span>Col</span>
            </button>
            <button
              onClick={(e) => { e.preventDefault(); editor.chain().focus().deleteColumn().run(); }}
              className="h-8 px-2 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold"
              title="Delete Column"
            >
              <Minus className="w-3 h-3" />
              <span>Col</span>
            </button>
            <button
              onClick={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }}
              className="h-8 w-8 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
              title="Delete Table"
              aria-label="Delete Table"
            >
              <Trash className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      
      {/* Editor Content area */}
      <div className="flex-1 overflow-auto p-3 sm:p-4 cursor-text relative" onClick={() => editor.commands.focus()}>
        {editor.isEmpty && placeholder && (
          <div className="pointer-events-none absolute text-[var(--color-text-muted)] text-sm">
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
