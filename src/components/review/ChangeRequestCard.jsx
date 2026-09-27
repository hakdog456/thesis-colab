import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CR_STATUS, CHANGE_TYPE } from '../../utils/constants';
import { GitPullRequest, Trash2, CheckCircle2, RotateCcw, Clock } from 'lucide-react';

export function ChangeRequestCard({ changeRequest, isSelected, onClick }) {
  const { getUser } = useAuth();
  const author = getUser(changeRequest.authorId || changeRequest.changedBy);

  const isApproved = changeRequest.status === CR_STATUS.APPROVED;
  const isChangesRequested = changeRequest.status === CR_STATUS.CHANGES_REQUESTED;

  return (
    <div
      className={`card card-interactive ${isSelected ? 'selected' : ''}`}
      style={{
        padding: '14px',
        borderLeft: isApproved
          ? '3px solid var(--status-done)'
          : isChangesRequested
          ? '3px solid var(--status-changes-req)'
          : '3px solid var(--status-for-review)',
      }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>
          {changeRequest.taskTitle}
        </span>
        <span
          className={`badge ${
            isApproved
              ? 'badge-done'
              : isChangesRequested
              ? 'badge-changes-requested'
              : 'badge-for-review'
          }`}
        >
          {changeRequest.status}
        </span>
      </div>

      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 8 }}>
        {changeRequest.changeSummary}
      </p>

      <div className="flex items-center justify-between" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
        <div className="flex items-center gap-2">
          {author && (
            <div
              className="avatar avatar-sm"
              style={{ width: 18, height: 18, fontSize: 9, background: author.color }}
            >
              {author.initials}
            </div>
          )}
          <span>{author?.name || 'Author'}</span>
        </div>

        <span>{new Date(changeRequest.createdAt || changeRequest.changedAt || Date.now()).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
