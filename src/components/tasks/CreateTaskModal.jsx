import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { PRIORITY } from '../../utils/constants';
import { X, Check } from 'lucide-react';

export function CreateTaskModal({ isOpen, onClose, initialTarget = null }) {
  const { users } = useAuth();
  const { createTask } = useData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(PRIORITY.MEDIUM);
  const [assigneeId, setAssigneeId] = useState('');
  const [chapterId, setChapterId] = useState(initialTarget?.chapterId || 'Chapter 2');
  const [sectionId, setSectionId] = useState(initialTarget?.sectionId || '2.1 Related Studies');
  const [anchorText, setAnchorText] = useState(initialTarget?.anchorText || '');
  const [blockId, setBlockId] = useState(initialTarget?.blockId || '');
  const [isWholeDocument, setIsWholeDocument] = useState(!initialTarget);

  useEffect(() => {
    if (!isOpen) return;

    setTitle('');
    setDescription('');
    setPriority(PRIORITY.MEDIUM);
    setAssigneeId('');
    setIsWholeDocument(!initialTarget);
    setChapterId(initialTarget?.chapterId || 'Chapter 2');
    setSectionId(initialTarget?.sectionId || '2.1 Related Studies');
    setAnchorText(initialTarget?.anchorText || '');
    setBlockId(initialTarget?.blockId || '');
  }, [isOpen, initialTarget]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      ownerId: assigneeId || null,
      target: {
        chapterId: isWholeDocument ? 'Whole Document' : chapterId,
        sectionId: isWholeDocument ? 'Full Draft' : sectionId,
        blockId: isWholeDocument ? null : blockId || initialTarget?.blockId || 'ch2_rg_p1',
        anchorText: isWholeDocument ? '' : anchorText.trim(),
        startOffset: initialTarget?.startOffset || 0,
        endOffset: initialTarget?.endOffset || anchorText.length,
        wholeDocument: isWholeDocument,
      },
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Create Document Task</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label className="detail-panel__label" htmlFor="task-title">
              Task Title *
            </label>
            <input
              id="task-title"
              type="text"
              className="input"
              placeholder="e.g. Refine Section 2.1 methodology analysis"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="detail-panel__label" htmlFor="task-desc">
              Description & Requirements
            </label>
            <textarea
              id="task-desc"
              className="input textarea"
              placeholder="Explain what changes are needed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Priority & Assignee Grid */}
          <div className="flex gap-3 mb-4">
            <div style={{ flex: 1 }}>
              <label className="detail-panel__label" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                className="input select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value={PRIORITY.LOW}>Low</option>
                <option value={PRIORITY.MEDIUM}>Medium</option>
                <option value={PRIORITY.HIGH}>High</option>
                <option value={PRIORITY.CRITICAL}>Critical</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label className="detail-panel__label" htmlFor="task-assignee">
                Assignee
              </label>
              <select
                id="task-assignee"
                className="input select"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned (Available)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Location / Anchor (P2) */}
          <div
            style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: 12,
              marginBottom: 16,
            }}
          >
            <div className="detail-panel__label mb-2">Target Document Anchor (P2)</div>

            <label className="flex items-center gap-2 mb-3" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={isWholeDocument}
                onChange={(e) => setIsWholeDocument(e.target.checked)}
                disabled={Boolean(initialTarget)}
              />
              <span>Edit the whole document freely</span>
            </label>

            {!isWholeDocument && (
              <>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="input"
                    placeholder="Chapter (e.g. Chapter 2)"
                    value={chapterId}
                    onChange={(e) => setChapterId(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="Section (e.g. 2.1 Related Studies)"
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>

                <input
                  type="text"
                  className="input"
                  placeholder="Anchor text quote from the thesis..."
                  value={anchorText}
                  onChange={(e) => setAnchorText(e.target.value)}
                />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="modal__footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
