import React from 'react';
import { ListTree } from 'lucide-react';

export function DocumentOutline({ editor, onSelectHeading }) {
  if (!editor) return null;

  const headings = [];
  const { doc } = editor.state;

  doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      headings.push({
        level: node.attrs.level,
        text: node.textContent,
        pos,
        blockId: node.attrs.blockId,
      });
    }
  });

  if (headings.length === 0) {
    return (
      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: 12 }}>
        No headings found.
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--sp-3)' }}>
      <div
        className="flex items-center gap-1 mb-2"
        style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}
      >
        <ListTree size={13} />
        <span>Document Outline</span>
      </div>

      <div className="flex flex-col gap-1">
        {headings.map((heading, idx) => (
          <div
            key={idx}
            className={`outline-item outline-item--h${heading.level}`}
            onClick={() => onSelectHeading(heading.pos)}
            title={heading.text}
          >
            {heading.text || 'Untitled Section'}
          </div>
        ))}
      </div>
    </div>
  );
}
