import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { VersionCompare } from './VersionCompare';
import { History, GitCommit, GitCompare, User } from 'lucide-react';

export function VersionHistoryPanel() {
  const { getUser } = useAuth();
  const { versions } = useData();

  const [compareTarget, setCompareTarget] = useState(null);

  const currentVersion = versions[0]; // latest version

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 'var(--sp-4)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 700 }} className="flex items-center gap-2">
          <History size={16} /> Version Timeline
        </h3>
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>
          {versions.length} versions
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="version-timeline">
          {versions.map((ver, idx) => {
            const author = getUser(ver.createdBy);
            const reviewer = ver.reviewedBy ? getUser(ver.reviewedBy) : null;
            const isLatest = idx === 0;

            return (
              <div key={ver.id} className="version-entry">
                <div className="flex items-center justify-between">
                  <span className="version-entry__number flex items-center gap-1">
                    <GitCommit size={14} color="var(--accent-primary)" />
                    <span>Version {ver.versionNumber}</span>
                    {isLatest && (
                      <span className="badge badge-approved" style={{ fontSize: 9, padding: '1px 5px' }}>
                        Current
                      </span>
                    )}
                  </span>

                  {!isLatest && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ height: 22, padding: '0 6px', fontSize: 10, gap: 4 }}
                      onClick={() => setCompareTarget(ver)}
                      title={`Compare Version ${ver.versionNumber} with Version ${currentVersion.versionNumber}`}
                    >
                      <GitCompare size={12} />
                      <span>Diff</span>
                    </button>
                  )}
                </div>

                <div className="version-entry__summary">
                  {ver.changeSummary || 'Official snapshot'}
                </div>

                <div className="version-entry__meta flex items-center gap-2">
                  <span>By {author?.name || 'Dustin'}</span>
                  {reviewer && <span>&bull; Reviewed by {reviewer.name}</span>}
                  <span>&bull;</span>
                  <span>{new Date(ver.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compare Modal */}
      {compareTarget && (
        <VersionCompare
          versionA={compareTarget}
          versionB={currentVersion}
          onClose={() => setCompareTarget(null)}
        />
      )}
    </div>
  );
}
