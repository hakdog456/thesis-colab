import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CR_STATUS } from '../../utils/constants';
import { Check, X, RotateCcw, ShieldAlert, Sparkles } from 'lucide-react';

export function ReviewActions({ changeRequest, onApprove, onRequestChanges }) {
  const { currentUser } = useAuth();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('');

  const isAuthor = (changeRequest?.authorId || changeRequest?.changedBy) === currentUser?.id;
  const isApproved = changeRequest?.status === CR_STATUS.APPROVED;
  const isChangesRequested = changeRequest?.status === CR_STATUS.CHANGES_REQUESTED;

  const handleRequestChangesSubmit = (e) => {
    e.preventDefault();
    onRequestChanges(feedbackNote);
    setShowNoteModal(false);
    setFeedbackNote('');
  };

  if (isApproved) {
    return (
      <div
        className="flex items-center gap-2"
        style={{
          background: 'var(--status-done-bg)',
          color: 'var(--status-done)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-sm)',
          fontWeight: 600,
        }}
      >
        <Check size={18} />
        <span>Change Request Approved & Merged into Official Thesis</span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div style={{ fontWeight: 600, fontSize: 'var(--font-base)' }}>
            Peer Review Decisions
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
            Approving this request merges changes into the official thesis and mints a new immutable version.
          </div>
        </div>
      </div>

      {isAuthor && (
        <div
          className="flex items-center gap-2 mb-3"
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: 'var(--status-in-progress)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-xs)',
          }}
        >
          <ShieldAlert size={14} />
          <span>You authored this change. Simulated teammates (Kyran / Renz) can review and approve it.</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          className="btn btn-danger"
          onClick={() => setShowNoteModal(true)}
        >
          <RotateCcw size={15} />
          <span>Request Changes</span>
        </button>

        <button
          className="btn btn-success"
          onClick={onApprove}
        >
          <Check size={16} />
          <span>Approve & Merge to Official</span>
        </button>
      </div>

      {/* Request Changes Note Modal */}
      {showNoteModal && (
        <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">Request Changes</h3>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowNoteModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRequestChangesSubmit}>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 16 }}>
                Explain what needs revision. The task will be sent back to the author's working copy.
              </p>

              <textarea
                className="input textarea mb-4"
                placeholder="Specific feedback, citation fixes, or wording recommendations..."
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                required
                autoFocus
              />

              <div className="modal__footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNoteModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Send Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
