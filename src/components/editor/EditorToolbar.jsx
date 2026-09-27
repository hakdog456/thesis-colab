import React from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  PlusSquare,
} from 'lucide-react';

export function EditorToolbar({ editor, onCreateTaskFromSelection, hasSelection }) {
  if (!editor) return null;

  return (
    <div className="editor-toolbar">
      {/* Text styles */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
        title="Bold (Ctrl+B)"
      >
        <Bold size={15} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
        title="Italic (Ctrl+I)"
      >
        <Italic size={15} />
      </button>

      <div className="toolbar-divider" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
        title="Heading 1"
      >
        <Heading1 size={15} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
        title="Heading 2"
      >
        <Heading2 size={15} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
        title="Heading 3"
      >
        <Heading3 size={15} />
      </button>

      <div className="toolbar-divider" />

      {/* Lists & Quotes */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
        title="Bullet List"
      >
        <List size={15} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
        title="Numbered List"
      >
        <ListOrdered size={15} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
        title="Blockquote"
      >
        <Quote size={15} />
      </button>

      {/* Contextual Action: Create Task from Selection */}
      {hasSelection && onCreateTaskFromSelection && (
        <>
          <div className="toolbar-divider" />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onCreateTaskFromSelection}
            style={{ marginLeft: 'auto', gap: 4 }}
          >
            <PlusSquare size={13} />
            <span>Create Task from Selection</span>
          </button>
        </>
      )}
    </div>
  );
}
