import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder,
  className = '',
  minHeight = '120px'
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base focus:outline-none max-w-none w-full ${className}`,
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
    return <div style={{ minHeight }} className={`w-full ${className} border border-gray-200 rounded-xl bg-gray-50/50 animate-pulse`} />;
  }

  return (
    <div className={`w-full flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden transition-all focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-gray-50/50">
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
          className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
            editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
          className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
            editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
          className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
            editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
          className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
            editor.isActive('orderedList') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>
      
      {/* Editor Content area */}
      <div className="flex-1 overflow-y-auto p-4 cursor-text relative" onClick={() => editor.commands.focus()}>
        {editor.isEmpty && placeholder && (
          <div className="pointer-events-none absolute text-gray-400">
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
