import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { TaskStatusBadge } from './TaskStatusBadge';
import { CommentThread } from '../comments/CommentThread';
import { TASK_STATUS } from '../../utils/constants';
import { navigateToBlock } from '../../utils/documentPositions';
import {
  X,
  PenTool,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export function TaskDetailsPanel({ onClose }) {
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [isDroppingTask, setIsDroppingTask] = useState(false);
  const [dropReason, setDropReason] = useState('');
  const { currentUser, users, getUser } = useAuth();
  const {
    selectedTask,
    editingTaskId,
    claimTask,
    releaseTask,
    dropTask,
    startEditingTask,
    stopEditingTask,
    markTaskReviewed,
    requestTaskChanges,
    markTaskDone,
    voteToDeleteTask,
    getChangeRecord,
    addToast,
  } = useData();

  if (!selectedTask) {
    return (
      <div className="panel-empty-state">
        <div style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>
          Select a task from the list to view details or review changes.
        </div>
      </div>
    );
  }

  const owner = selectedTask.ownerId ? getUser(selectedTask.ownerId) : null;
  const isOwner = selectedTask.ownerId === currentUser.id;
  const isEditingThis = editingTaskId === selectedTask.id;

  // Retrieve any change record for this task
  const changeRecord = getChangeRecord(selectedTask.id);
  const changedByAuthor = changeRecord?.changedBy ? getUser(changeRecord.changedBy) : owner;
  const reviewer = changeRecord?.reviewedBy ? getUser(changeRecord.reviewedBy) : null;

  const handleNavigate = () => {
    if (selectedTask.target?.blockId) {
      const res = navigateToBlock(selectedTask.target.blockId);
      if (!res.success) {
        addToast('Target not found. This task needs attention.', 'error');
      }
    }
  };

  const handleRequestChanges = (e) => {
    e.preventDefault();
    requestTaskChanges(selectedTask.id, feedbackNote);
    setFeedbackNote('');
    setIsRequestingChanges(false);
  };

  const handleDropTask = (e) => {
    e.preventDefault();
    dropTask(selectedTask.id, dropReason);
    setDropReason('');
    setIsDroppingTask(false);
  };

  return (
    <div className="task-details-simple">
      {/* Panel Header */}
      <div className="panel-header-simple">
        <div className="flex items-center gap-2">
          <TaskStatusBadge status={selectedTask.status} />
        </div>
        {onClose && (
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close task details"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Panel Content */}
      <div className="panel-body-simple">
        {/* Title */}
        <h2 className="task-title-detail">{selectedTask.title}</h2>

        {/* Location Breadcrumb */}
        <div className="task-location-tag mb-3 flex items-center justify-between">
          <span>
            {selectedTask.target?.chapterId} &bull; {selectedTask.target?.sectionId}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleNavigate}
            style={{ padding: '2px 6px', height: 22, fontSize: 11 }}
            title="Scroll to section in thesis"
          >
            <ExternalLink size={11} />
            <span>Locate</span>
          </button>
        </div>

        {/* Owner Info */}
        <div className="panel-field mb-4">
          <span className="panel-field-label">Assigned to:</span>
          <span className="panel-field-value">
            {owner ? (
              <span className="flex items-center gap-1">
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: owner.color,
                  }}
                />
                <strong>{owner.name}</strong> {isOwner && '(You)'}
              </span>
            ) : (
              <span style={{ color: 'var(--text-tertiary)' }}>Unassigned</span>
            )}
          </span>
        </div>

        {/* Action Controls based on Status & Ownership */}
        <div className="panel-actions-section mb-4">
          {/* Status: AVAILABLE */}
          {selectedTask.status === TASK_STATUS.AVAILABLE && (
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => {
                claimTask(selectedTask.id);
                startEditingTask(selectedTask.id);
              }}
            >
              <PenTool size={14} />
              <span>Claim & Edit Task</span>
            </button>
          )}

          {/* Status: IN_PROGRESS */}
          {(selectedTask.status === TASK_STATUS.IN_PROGRESS || selectedTask.status === TASK_STATUS.CHANGES_REQUESTED) && (
            <div>
              {selectedTask.status === TASK_STATUS.CHANGES_REQUESTED && changeRecord?.lastFeedbackNote && (
                <div className="notice-box notice-box-danger mb-3">
                  <strong>Changes requested:</strong> {changeRecord.lastFeedbackNote}
                </div>
              )}

              {isOwner ? (
                isEditingThis ? (
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', marginBottom: 8 }}
                    onClick={stopEditingTask}
                  >
                    <Check size={14} />
                    <span>Done Editing</span>
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginBottom: 8 }}
                    onClick={() => startEditingTask(selectedTask.id)}
                  >
                    <PenTool size={14} />
                    <span>Edit Task</span>
                  </button>
                )
              ) : (
                <div className="notice-box notice-box-info">
                  Locked: Currently being edited by {owner?.name || 'teammate'}.
                </div>
              )}

              {isOwner && !isEditingThis && (
                <div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', color: 'var(--text-tertiary)' }}
                    onClick={() => releaseTask(selectedTask.id)}
                  >
                    Release task to team
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ width: '100%', marginTop: 8 }}
                    onClick={() => setIsDroppingTask(true)}
                  >
                    Drop task
                  </button>
                </div>
              )}

              {isOwner && isDroppingTask && (
                <form onSubmit={handleDropTask} className="mt-3">
                  <textarea
                    className="input textarea mb-2"
                    placeholder="Optional reason for dropping this task..."
                    value={dropReason}
                    onChange={(e) => setDropReason(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => {
                        setDropReason('');
                        setIsDroppingTask(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-danger btn-sm" style={{ flex: 1 }}>
                      Confirm Drop
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Status: CHANGED (Section 10 Review UI) */}
          {selectedTask.status === TASK_STATUS.CHANGED && (
            <div className="review-box">
              <div className="review-box-header">
                <div className="review-box-author">
                  <strong>{selectedTask.title}</strong> was changed by{' '}
                  <strong>{changedByAuthor?.name || 'author'}</strong>.
                </div>
              </div>

              {/* Previous vs Current Content Comparison */}
              {changeRecord && (
                <div className="diff-simple-container">
                  <div className="diff-simple-block">
                    <span className="diff-simple-label">Previous:</span>
                    <div className="diff-simple-text diff-previous">
                      {changeRecord.previousContent || '(empty)'}
                    </div>
                  </div>

                  <div className="diff-simple-block mt-2">
                    <span className="diff-simple-label">Current:</span>
                    <div className="diff-simple-text diff-current">
                      {changeRecord.isDeleted ? (
                        <span style={{ color: '#DC2626', fontStyle: 'italic' }}>
                          (Paragraph deleted)
                        </span>
                      ) : (
                        changeRecord.newContent || '(empty)'
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-3">
                {!isOwner ? (
                  <div>
                    {isRequestingChanges ? (
                      <form onSubmit={handleRequestChanges}>
                        <textarea
                          className="input textarea mb-2"
                          placeholder="Explain what still needs to be changed..."
                          value={feedbackNote}
                          onChange={(e) => setFeedbackNote(e.target.value)}
                          required
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1 }}
                            onClick={() => {
                              setFeedbackNote('');
                              setIsRequestingChanges(false);
                            }}
                          >
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-danger btn-sm" style={{ flex: 1 }}>
                            Request Changes
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          className="btn btn-danger"
                          style={{ flex: 1 }}
                          onClick={() => setIsRequestingChanges(true)}
                        >
                          <span>Request Changes</span>
                        </button>
                        <button
                          className="btn btn-success"
                          style={{ flex: 1 }}
                          onClick={() => markTaskReviewed(selectedTask.id)}
                        >
                          <Check size={14} />
                          <span>Approve</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textAlign: 'center' }}>
                      Changes saved in thesis. Awaiting teammate review.
                    </div>
                    {isEditingThis ? (
                      <button
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                        onClick={stopEditingTask}
                      >
                        <Check size={14} />
                        <span>Done Editing</span>
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        onClick={() => startEditingTask(selectedTask.id)}
                      >
                        <PenTool size={14} />
                        <span>Continue Editing</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status: REVIEWED */}
          {selectedTask.status === TASK_STATUS.REVIEWED && (
            <div className="reviewed-box">
              <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--status-reviewed)', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>Reviewed {reviewer ? `by ${reviewer.name}` : ''}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                Changes are verified and in the official thesis.
              </p>
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
                onClick={() => markTaskDone(selectedTask.id)}
              >
                <span>Mark as Done</span>
              </button>
            </div>
          )}

          {/* Status: DONE */}
          {selectedTask.status === TASK_STATUS.DONE && (
            <div className="done-box flex items-center gap-2">
              <CheckCircle2 size={16} color="var(--status-done)" />
              <span style={{ fontSize: 13, fontWeight: 500 }}>
                Task completed and merged.
              </span>
            </div>
          )}
        </div>

        {/* Change Discussion */}
        {(selectedTask.status === TASK_STATUS.CHANGED || changeRecord) && (
          <div className="panel-field mb-4">
            <span className="panel-field-label">Change comments:</span>
            {changeRecord?.reviewEvents?.length > 0 && (
              <div className="diff-simple-container mb-2">
                {changeRecord.reviewEvents.map((event) => {
                  const eventReviewer = getUser(event.reviewerId);
                  return (
                    <div key={event.id} className="diff-simple-block">
                      <span className="diff-simple-label">
                        Changes requested by {eventReviewer?.name || 'Reviewer'}:
                      </span>
                      <div className="diff-simple-text diff-previous">{event.note}</div>
                    </div>
                  );
                })}
              </div>
            )}
            <CommentThread taskId={selectedTask.id} changeRecordId={changeRecord?.id} />
          </div>
        )}

        {/* Task Description */}
        {selectedTask.description && (
          <div className="panel-field mb-4">
            <span className="panel-field-label">Requirements:</span>
            <p className="task-desc-text">{selectedTask.description}</p>
          </div>
        )}

        {/* Delete Task (3-User Consensus Vote) */}
        {(() => {
          const deleteVotes = selectedTask.deleteVotes || [];
          const hasCurrentVoted = deleteVotes.includes(currentUser?.id);
          const voteCount = deleteVotes.length;

          return (
            <div
              style={{
                marginTop: 20,
                padding: 12,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Delete Task (Consensus Vote)
                </span>
                <span
                  className={`badge ${voteCount === 3 ? 'badge-red' : 'badge-gray'}`}
                  style={{ fontSize: 10 }}
                >
                  {voteCount}/3 Votes
                </span>
              </div>

              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 10 }}>
                Requires unanimous agreement (3/3 votes from all teammates) to delete this task.
              </p>

              {/* Voter Status Badges */}
              <div className="flex gap-2 mb-3">
                {users.map((u) => {
                  const voted = deleteVotes.includes(u.id);
                  return (
                    <div
                      key={u.id}
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        borderRadius: 4,
                        fontSize: 10,
                        textAlign: 'center',
                        background: voted ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-card)',
                        color: voted ? '#EF4444' : 'var(--text-tertiary)',
                        border: voted ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-default)',
                        fontWeight: voted ? 600 : 400,
                      }}
                    >
                      {voted ? '✓ ' : ''}{u.name}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className={`btn ${hasCurrentVoted ? 'btn-secondary' : 'btn-danger'} btn-sm`}
                style={{ width: '100%', gap: 6 }}
                onClick={() => voteToDeleteTask(selectedTask.id)}
              >
                <Trash2 size={13} />
                <span>{hasCurrentVoted ? 'Retract Deletion Vote' : `Vote to Delete Task (${voteCount}/3)`}</span>
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
