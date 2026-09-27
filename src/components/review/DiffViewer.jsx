import React from 'react';
import * as Diff from 'diff';
import { CHANGE_TYPE } from '../../utils/constants';
import { AlertCircle, Trash2, Edit3 } from 'lucide-react';

export function DiffViewer({ originalContent = '', proposedContent = '', changeType = CHANGE_TYPE.EDIT }) {
  const isDeletion = changeType === CHANGE_TYPE.DELETE || !proposedContent;

  // Compute word-level diff
  const differences = Diff.diffWordsWithSpace(originalContent || '', proposedContent || '');

  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Diff Header */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: '10px 16px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: 'var(--font-xs)',
          color: 'var(--text-secondary)',
        }}
      >
        <div className="flex items-center gap-2">
          {isDeletion ? (
            <span className="flex items-center gap-1" style={{ color: 'var(--status-changes-req)', fontWeight: 600 }}>
              <Trash2 size={13} /> Deletion of target section (P3)
            </span>
          ) : (
            <span className="flex items-center gap-1" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
              <Edit3 size={13} /> Modification diff
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--diff-del-bg)', border: '1px solid #EF4444' }} />
            <span>Removed</span>
          </span>
          <span className="flex items-center gap-1">
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--diff-add-bg)', border: '1px solid #10B981' }} />
            <span>Added</span>
          </span>
        </div>
      </div>

      {/* Diff Content */}
      <div style={{ padding: '20px', lineHeight: 1.8, fontSize: 'var(--font-sm)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {differences.map((part, index) => {
          if (part.added) {
            return (
              <span
                key={index}
                style={{
                  background: 'var(--diff-add-bg)',
                  color: 'var(--diff-add-text)',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  fontWeight: 500,
                }}
              >
                {part.value}
              </span>
            );
          }
          if (part.removed) {
            return (
              <span
                key={index}
                style={{
                  background: 'var(--diff-del-bg)',
                  color: 'var(--diff-del-text)',
                  textDecoration: 'line-through',
                  padding: '2px 4px',
                  borderRadius: '3px',
                }}
              >
                {part.value}
              </span>
            );
          }
          return (
            <span key={index} style={{ color: 'var(--text-secondary)' }}>
              {part.value}
            </span>
          );
        })}
      </div>
    </div>
  );
}
