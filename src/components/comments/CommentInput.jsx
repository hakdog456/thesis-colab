import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Send } from 'lucide-react';

export function CommentInput({ onSubmit, placeholder = 'Add a comment...' }) {
  const { currentUser } = useAuth();
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-start mt-2">
      <div
        className="avatar avatar-sm mt-1"
        style={{ background: currentUser.color }}
      >
        {currentUser.initials}
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="text"
          className="input"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ paddingRight: 36, fontSize: 'var(--font-xs)', height: 32 }}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn btn-primary btn-icon"
          style={{
            position: 'absolute',
            right: 2,
            top: 2,
            width: 28,
            height: 28,
          }}
          aria-label="Send comment"
        >
          <Send size={12} />
        </button>
      </div>
    </form>
  );
}
