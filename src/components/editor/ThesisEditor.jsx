import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { BlockIdExtension } from './extensions/BlockIdExtension';
import { TaskHighlightExtension, taskHighlightPluginKey } from './extensions/TaskHighlightExtension';
import { EditGuardExtension } from './extensions/EditGuardExtension';
import { EditorToolbar } from './EditorToolbar';
import { EditingBanner } from './EditingBanner';
import { useAutoSave } from '../../hooks/useAutoSave';
import { findBlockByIdInDoc, navigateToBlock } from '../../utils/documentPositions';
import { Plus } from 'lucide-react';

export function ThesisEditor({ onSelectTask, onRequestCreateTaskWithSelection }) {
  const { currentUser, getUser } = useAuth();
  const {
    document,
    tasks,
    selectedTaskId,
    editingTaskId,
    editingTask,
    startEditingTask,
    stopEditingTask,
    saveOfficialChange,
    addToast,
  } = useData();

  const [hasSelection, setHasSelection] = useState(false);
  const [selectedTextMeta, setSelectedTextMeta] = useState(null);

  // Debounce blocked-edit toasts to avoid spamming on every keystroke
  const lastBlockedToastRef = useRef(0);
  const isProgrammaticRef = useRef(false);

  const isEditingMode = Boolean(editingTaskId && editingTask);
  const targetBlockId = editingTask?.target?.blockId || null;
  const isWholeDocumentTask = Boolean(editingTask?.target?.wholeDocument);

  // Ref to always provide synchronous, up-to-date guard state to ProseMirror
  const guardRef = useRef({
    isEditingMode,
    editingTargetBlockId: targetBlockId,
    editingTaskId,
    editingTask,
    currentUserId: currentUser?.id,
    taskOwnerId: editingTask?.ownerId,
    isWholeDocumentTask,
    tasks,
    startEditingTask,
    getUser,
    isProgrammatic: () => isProgrammaticRef.current,
  });

  guardRef.current = {
    isEditingMode,
    editingTargetBlockId: targetBlockId,
    editingTaskId,
    editingTask,
    currentUserId: currentUser?.id,
    taskOwnerId: editingTask?.ownerId,
    isWholeDocumentTask,
    tasks,
    startEditingTask,
    getUser,
    isProgrammatic: () => isProgrammaticRef.current,
  };

  // Autosave setup (Sections 4 & 9)
  const handlePerformSave = useCallback(
    (newText) => {
      if (!editingTaskId) return;
      saveOfficialChange(editingTaskId, newText);
    },
    [editingTaskId, saveOfficialChange]
  );

  const { saveStatus, triggerChange, flushChange } = useAutoSave(handlePerformSave, 1500);

  const handleDoneEditing = useCallback(async () => {
    try {
      await flushChange();
    } finally {
      stopEditingTask();
    }
  }, [flushChange, stopEditingTask]);

  // Initialize Tiptap Editor
  // IMPORTANT: editable is always true. EditGuardExtension.filterTransaction
  // is the single source of truth for edit permissions.
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: true,
      }),
      BlockIdExtension,
      TaskHighlightExtension.configure({
        tasks,
        selectedTaskId,
        editingTaskId,
        editingTargetBlockId: targetBlockId,
        getUser,
        isEditingMode,
        onTaskClick: (taskId) => {
          if (onSelectTask) onSelectTask(taskId);
        },
      }),
      EditGuardExtension.configure({
        getGuardState: () => guardRef.current,
        onBlockedEdit: ({ reason }) => {
          const now = Date.now();
          if (now - lastBlockedToastRef.current < 2000) return;
          lastBlockedToastRef.current = now;
          addToast(reason, 'error', 2500);
        },
      }),
    ],
    content: document.content,
    editable: true,
    onSelectionUpdate({ editor }) {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const text = editor.state.doc.textBetween(from, to, ' ');
        if (text.trim().length > 0) {
          setHasSelection(true);

          let blockId = null;
          let blockStart = 0;
          editor.state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.attrs && node.attrs.blockId) {
              blockId = node.attrs.blockId;
              blockStart = pos;
            }
          });

          setSelectedTextMeta({
            anchorText: text.trim(),
            blockId,
            startOffset: from - blockStart,
            endOffset: to - blockStart,
          });
          return;
        }
      }
      setHasSelection(false);
      setSelectedTextMeta(null);
    },
    onUpdate({ editor }) {
      // Read current editing state from ref to avoid stale closures
      const guard = guardRef.current;
      if (!guard.isEditingMode || !guard.editingTask) return;

      if (!guard.isWholeDocumentTask && guard.editingTargetBlockId) {
        // Detect if Enter key created new paragraph blocks after the target block
        const targetBlock = findBlockByIdInDoc(editor.state.doc, guard.editingTargetBlockId);
        if (targetBlock) {
          const currentTargetBlockIds = new Set([
            guard.editingTargetBlockId,
            ...(guard.editingTask.target?.additionalBlockIds || []),
          ]);

          let isAfterTarget = false;
          editor.state.doc.descendants((node) => {
            if (['heading', 'paragraph', 'blockquote'].includes(node.type.name) && node.attrs?.blockId) {
              const bId = node.attrs.blockId;
              if (bId === guard.editingTargetBlockId) {
                isAfterTarget = true;
              } else if (isAfterTarget) {
                if (!currentTargetBlockIds.has(bId)) {
                  if (!guard.editingTask.target.additionalBlockIds) {
                    guard.editingTask.target.additionalBlockIds = [];
                  }
                  if (!guard.editingTask.target.additionalBlockIds.includes(bId)) {
                    guard.editingTask.target.additionalBlockIds.push(bId);
                    currentTargetBlockIds.add(bId);
                  }
                }
              }
            }
          });
        }
      }

      // Always send full document JSON to preserve new paragraphs and document structure
      triggerChange(editor.getJSON());
    },


  });

  // Directly set caret and cursor styles on the ProseMirror DOM node AND
  // on all .task-highlight spans inside it. task-highlight has cursor:pointer
  // which suppresses the blinking caret — inline styles override everything.
  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;

    const applyCaretStyles = () => {
      if (isEditingMode) {
        dom.style.caretColor = '#111827';
        dom.style.cursor = 'text';
        // Also patch every task-highlight span — cursor:pointer hides the caret
        dom.querySelectorAll('.task-highlight').forEach((el) => {
          el.style.caretColor = '#111827';
          el.style.cursor = 'text';
        });
      } else {
        dom.style.caretColor = 'transparent';
        dom.style.cursor = 'default';
        dom.querySelectorAll('.task-highlight').forEach((el) => {
          el.style.caretColor = '';
          el.style.cursor = '';
        });
      }
    };

    applyCaretStyles();

    // Re-apply after a tick in case decorations re-render and reset styles
    const t = setTimeout(applyCaretStyles, 50);
    return () => clearTimeout(t);
  }, [editor, isEditingMode]);


  // Navigate to target block and focus at start of task highlight when entering edit mode
  useEffect(() => {
    if (!editor) return;

    if (isEditingMode && targetBlockId) {
      setTimeout(() => {
        navigateToBlock(targetBlockId);
        const block = findBlockByIdInDoc(editor.state.doc, targetBlockId);
        if (block) {
          let pos = block.pos + 1;
          if (editingTask && editingTask.target) {
            const res = resolveTaskTarget(editor.state.doc, editingTask.target);
            if (res && res.status === 'valid') {
              pos = res.from;
            }
          }
          editor.chain().focus(pos).setTextSelection(pos).run();
        }
      }, 100);
    } else if (isEditingMode && !targetBlockId) {
      // Whole-document task: just focus the editor
      setTimeout(() => editor.commands.focus(), 100);
    }
  }, [isEditingMode, targetBlockId, editor, editingTask]);


  // Update dynamic highlight decorations whenever tasks, selectedTaskId, or editingMode change
  useEffect(() => {
    if (!editor) return;

    const tr = editor.state.tr;
    tr.setMeta(taskHighlightPluginKey, {
      options: {
        tasks,
        selectedTaskId,
        editingTaskId,
        editingTargetBlockId: targetBlockId,
        getUser,
        isEditingMode,
        onTaskClick: (taskId) => {
          if (onSelectTask) onSelectTask(taskId);
        },
      },
    });
    editor.view.dispatch(tr);
  }, [tasks, selectedTaskId, editingTaskId, targetBlockId, isEditingMode, getUser, onSelectTask, editor]);

  // Re-sync document content when official document changes externally (e.g. from teammate or reset)
  useEffect(() => {
    if (!editor) return;
    if (!isEditingMode) {
      if (saveStatus === 'saving') {
        flushChange().catch(() => {});
        return;
      }

      // Only refresh if not actively editing
      const currentDocJson = editor.getJSON();
      if (JSON.stringify(currentDocJson) !== JSON.stringify(document.content)) {
        isProgrammaticRef.current = true;
        editor.commands.setContent(document.content, false);
        isProgrammaticRef.current = false;
      }
    }
  }, [document.content, isEditingMode, saveStatus, flushChange, editor]);

  const handleCreateTaskFromSelection = () => {
    if (onRequestCreateTaskWithSelection && selectedTextMeta) {
      onRequestCreateTaskWithSelection(selectedTextMeta);
    }
  };

  return (
    <div className={`thesis-editor-wrapper ${isEditingMode ? 'editor-active' : 'editor-readonly'}`}>
      {/* Top Banner when Editing (Section 8) */}
      {isEditingMode && (
        <EditingBanner
          task={editingTask}
          saveStatus={saveStatus}
          onDoneEditing={handleDoneEditing}
        />
      )}

      {/* Editor Surface */}
      <div className="editor-paper-container">
        {isEditingMode ? (
          <EditorToolbar
            editor={editor}
            hasSelection={hasSelection}
            onCreateTaskFromSelection={handleCreateTaskFromSelection}
          />
        ) : null}

        {/* Floating Selection Bar for creating a task (Section 2) */}
        {!isEditingMode && hasSelection && onRequestCreateTaskWithSelection && (
          <div className="selection-task-bar-floating">
            <div className="selection-task-bar-content">
              <span className="selection-task-bar-text">Create a task from highlighted text?</span>
              {selectedTextMeta?.anchorText && (
                <span className="selection-task-bar-quote" title={selectedTextMeta.anchorText}>
                  "{selectedTextMeta.anchorText.slice(0, 35)}{selectedTextMeta.anchorText.length > 35 ? '...' : ''}"
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCreateTaskFromSelection}
              style={{ gap: 6, whiteSpace: 'nowrap' }}
            >
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          </div>
        )}

        <div className="editor-paper">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
