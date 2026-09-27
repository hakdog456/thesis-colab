import React from 'react';
import { SaveIndicator } from './SaveIndicator';
import { Send, RotateCcw, ShieldCheck } from 'lucide-react';

export function WorkingCopyBanner({
  task,
  saveStatus,
  onSubmitForReview,
  onDiscard,
}) {
  if (!task) return null;

  return (
    <div className="working-copy-banner">
      <div className="working-copy-banner__info">
        <span className="version-dot version-dot--working" />
        <div>
          <div className="working-copy-banner__label">
            WORKING COPY — Task: {task.title}
          </div>
          <div className="working-copy-banner__note flex items-center gap-1">
            <ShieldCheck size={12} />
            Official thesis remains unchanged. Edits are isolated in your personal working copy.
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SaveIndicator status={saveStatus} />

        <div className="working-copy-banner__actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={onDiscard}
            title="Discard working edits"
          >
            <RotateCcw size={13} />
            <span>Discard</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={onSubmitForReview}
            title="Submit changes for peer review"
          >
            <Send size={13} />
            <span>Submit for Review</span>
          </button>
        </div>
      </div>
    </div>
  );
}
