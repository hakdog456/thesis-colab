import React, { useState } from 'react';
import { AppHeader } from './AppHeader';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';

export function AppLayout({
  children,
  sidebar,
  detailPanel,
  defaultSidebarOpen = true,
  defaultDetailOpen = true,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);
  const [detailOpen, setDetailOpen] = useState(defaultDetailOpen);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AppHeader
        showSidebarToggle={!!sidebar}
        showDetailToggle={!!detailPanel}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleDetail={() => setDetailOpen(!detailOpen)}
      />

      <div className="app-layout">
        {/* Left Sidebar */}
        {sidebar && (
          <aside className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
            {sidebar}
          </aside>
        )}

        {/* Sidebar Toggle Handle */}
        {sidebar && (
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: 'absolute',
              left: sidebarOpen ? 'calc(var(--sidebar-width) - 16px)' : '8px',
              top: 'calc(var(--header-height) + 12px)',
              zIndex: 50,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              width: 28,
              height: 28,
              transition: 'left var(--transition-slow)',
            }}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
          </button>
        )}

        {/* Center Main Content */}
        <main className="main-content">
          {children}
        </main>

        {/* Detail Panel Toggle Handle */}
        {detailPanel && (
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setDetailOpen(!detailOpen)}
            style={{
              position: 'absolute',
              right: detailOpen ? 'calc(var(--detail-panel-width) - 16px)' : '8px',
              top: 'calc(var(--header-height) + 12px)',
              zIndex: 50,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              width: 28,
              height: 28,
              transition: 'right var(--transition-slow)',
            }}
            title={detailOpen ? 'Collapse panel' : 'Expand panel'}
          >
            {detailOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
          </button>
        )}

        {/* Right Detail Panel */}
        {detailPanel && (
          <aside className={`detail-panel ${!detailOpen ? 'collapsed' : ''}`}>
            {detailPanel}
          </aside>
        )}
      </div>
    </div>
  );
}
