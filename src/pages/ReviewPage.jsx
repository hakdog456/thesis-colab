import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { DiffViewer } from '../components/review/DiffViewer';
import { ReviewActions } from '../components/review/ReviewActions';
import { ChangeRequestCard } from '../components/review/ChangeRequestCard';
import { CommentThread } from '../components/comments/CommentThread';
import { GitPullRequest, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export function ReviewPage() {
  const { crId } = useParams();
  const navigate = useNavigate();
  const { getUser } = useAuth();
  const { changeRequests, approveChangeRequest, requestChanges } = useData();

  // If a specific crId is in URL, select it, otherwise select the first pending CR
  const selectedCR = crId
    ? changeRequests.find((cr) => cr.id === crId)
    : changeRequests[0] || null;

  const author = selectedCR ? getUser(selectedCR.authorId || selectedCR.changedBy) : null;


  return (
    <div className="review-page">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/document/doc-1')}
        >
          <ArrowLeft size={14} />
          <span>Back to Document</span>
        </button>

        <div className="flex items-center gap-2">
          <GitPullRequest size={18} color="var(--status-for-review)" />
          <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>Peer Review Center</h1>
        </div>
      </div>

      {changeRequests.length === 0 ? (
        <div className="empty-state card" style={{ padding: 'var(--sp-12)' }}>
          <CheckCircle2 size={36} className="empty-state__icon" />
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, marginBottom: 8 }}>
            No Change Requests Found
          </h2>
          <p className="empty-state__text">
            When a team member submits working copy edits, the diff will appear here for review.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--sp-6)' }}>
          {/* Left: Change Requests List */}
          <div className="flex flex-col gap-3">
            <div
              style={{
                fontSize: 'var(--font-xs)',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                letterSpacing: '0.05em',
              }}
            >
              All Requests ({changeRequests.length})
            </div>

            {changeRequests.map((cr) => (
              <ChangeRequestCard
                key={cr.id}
                changeRequest={cr}
                isSelected={selectedCR?.id === cr.id}
                onClick={() => navigate(`/review/${cr.id}`)}
              />
            ))}
          </div>

          {/* Right: Selected Change Request Review Detail */}
          {selectedCR ? (
            <div className="flex flex-col gap-5">
              {/* Header Card */}
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>
                    {selectedCR.taskTitle}
                  </h2>
                  <span className="badge badge-for-review">{selectedCR.status}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-secondary mb-3">
                  <div className="flex items-center gap-2">
                    {author && (
                      <div
                        className="avatar avatar-sm"
                        style={{ width: 20, height: 20, fontSize: 10, background: author.color }}
                      >
                        {author.initials}
                      </div>
                    )}
                    <span>Author: {author?.name}</span>
                  </div>

                  <span>&bull;</span>
                  <span>Section: {selectedCR.targetSection}</span>
                  <span>&bull;</span>
                  <span>Submitted: {new Date(selectedCR.createdAt).toLocaleDateString()}</span>
                </div>

                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-sm)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <strong>Summary: </strong> {selectedCR.changeSummary}
                </div>
              </div>

              {/* Review Decisions Action Bar */}
              <ReviewActions
                changeRequest={selectedCR}
                onApprove={() => approveChangeRequest(selectedCR.id)}
                onRequestChanges={(note) => requestChanges(selectedCR.id, note)}
              />

              {/* Word-level Diff Viewer */}
              <div>
                <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: 8 }}>
                  Proposed Document Diff (P1 & P3)
                </h3>
                <DiffViewer
                  originalContent={selectedCR.previousContent || selectedCR.originalContent || ''}
                  proposedContent={selectedCR.newContent || selectedCR.proposedContent || ''}
                  changeType={selectedCR.isDeleted ? 'delete' : selectedCR.changeType}
                />
              </div>

              {/* Comments / Review Thread */}
              <div className="card">
                <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: 12 }}>
                  Review Notes & Feedback
                </h3>
                <CommentThread changeRequestId={selectedCR.id} />
              </div>
            </div>
          ) : (
            <div className="empty-state card">
              <p className="empty-state__text">Select a change request to view its diff</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
