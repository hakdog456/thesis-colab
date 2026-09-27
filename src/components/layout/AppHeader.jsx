import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { ChevronDown, Check, BookOpen } from 'lucide-react';

export function AppHeader() {
  const { currentUser, users, switchUser } = useAuth();
  const { document, versions, editingTask } = useData();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header-simple">
      {/* Left: Brand + Document Title */}
      <div className="flex items-center gap-3">
        <div className="brand-simple">
          <span className="brand-badge">TF</span>
          <span>ThesisFlow</span>
        </div>

        <span style={{ color: 'var(--border-strong)' }}>|</span>

        <span className="doc-title-header" title={document?.title}>
          {document?.title}
        </span>
      </div>

      {/* Right: Version Pill + User Switcher */}
      <div className="flex items-center gap-3">
        <span className="version-pill">
          Official v{versions.length}
        </span>

        {/* User Switcher */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ gap: 8, paddingRight: 8 }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: currentUser?.color || '#2563EB',
              }}
            />
            <span style={{ fontWeight: 600 }}>{currentUser?.name || 'User'}</span>
            <ChevronDown size={12} color="var(--text-tertiary)" />
          </button>

          {dropdownOpen && (
            <div className="user-dropdown">
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--text-tertiary)',
                  padding: '4px 8px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                Switch Teammate
              </div>
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`user-dropdown-item ${user.id === currentUser.id ? 'active' : ''}`}
                  onClick={() => {
                    switchUser(user.id);
                    setDropdownOpen(false);
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: user.color,
                    }}
                  />
                  <span style={{ flex: 1 }}>{user.name}</span>
                  {user.id === currentUser.id && (
                    <Check size={13} color="var(--color-dustin)" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
