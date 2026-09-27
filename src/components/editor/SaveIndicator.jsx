import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export function SaveIndicator({ status = 'saved' }) {
  // status: 'idle' | 'saving' | 'saved' | 'error'
  return (
    <div className={`save-indicator save-indicator--${status}`}>
      {status === 'saving' && (
        <>
          <div className="save-spinner" />
          <span>Autosaving working copy...</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <Check size={14} color="var(--status-done)" />
          <span>Saved to working copy</span>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertCircle size={14} color="var(--status-changes-req)" />
          <span>Error saving</span>
        </>
      )}
    </div>
  );
}
