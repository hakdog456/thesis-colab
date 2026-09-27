import React from 'react';
import { useData } from '../../contexts/DataContext';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useData();

  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${toast.type === 'error' ? 'toast--error' : toast.type === 'success' ? 'toast--success' : ''}`}
        >
          {toast.type === 'error' && <AlertCircle size={18} color="#EF4444" />}
          {toast.type === 'success' && <CheckCircle2 size={18} color="#10B981" />}
          {toast.type === 'info' && <Info size={18} color="#3B82F6" />}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            className="btn btn-ghost btn-icon"
            style={{ width: 20, height: 20 }}
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss toast"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
