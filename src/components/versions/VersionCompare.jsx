import React from 'react';
import { DiffViewer } from '../review/DiffViewer';
import { X, GitCompare } from 'lucide-react';

// Helper to convert Tiptap JSON content or raw text to plain text
function extractAllDocText(docContent) {
  if (!docContent) return '';
  if (typeof docContent === 'string') return docContent;
  if (!docContent.content) return '';
  let text = '';
  for (const node of docContent.content) {
    if (node.content) {
      text += node.content.map((c) => c.text || '').join('') + '\n\n';
    }
  }
  return text.trim();
}

export function VersionCompare({ versionA, versionB, onClose }) {
  if (!versionA || !versionB) return null;

  const textA = versionA.previousContent || extractAllDocText(versionA.content);
  const textB = versionA.newContent || extractAllDocText(versionB.content);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 840 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="flex items-center gap-2">
            <GitCompare size={18} color="var(--accent-primary)" />
            <h2 className="modal__title">
              Comparing Version {versionA.versionNumber} vs Version {versionB.versionNumber}
            </h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close diff modal">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 text-xs text-secondary">
          Comparing <strong>Version {versionA.versionNumber}</strong> ({new Date(versionA.createdAt).toLocaleDateString()}) with <strong>Version {versionB.versionNumber}</strong> ({new Date(versionB.createdAt).toLocaleDateString()})
        </div>

        <DiffViewer
          originalContent={textA}
          proposedContent={textB}
        />

        <div className="modal__footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
