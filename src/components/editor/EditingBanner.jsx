import React from 'react';
import { SaveIndicator } from './SaveIndicator';
import { Check, Edit3, ShieldAlert } from 'lucide-react';

export function EditingBanner({ task, saveStatus, onDoneEditing }) {
  if (!task) return null;

  return (
    <div className="editing-banner">
      <div className="flex items-center gap-3">
        <span className="editing-dot" />
        <div>
          <div className="editing-banner__title">
            Editing {task.title}
          </div>
          <div className="editing-banner__subtitle">
            Only this highlighted section can be edited. Changes save directly to the thesis.
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <SaveIndicator status={saveStatus} />

        <button
          className="btn btn-secondary btn-sm"
          onClick={onDoneEditing}
          title="Finish editing"
        >
          <Check size={14} />
          <span>Done Editing</span>
        </button>
      </div>
    </div>
  );
}
