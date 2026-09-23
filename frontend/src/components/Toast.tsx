import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '420px',
      width: '100%',
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => {
        let icon = <Info size={20} color="#38bdf8" />;
        let borderColor = 'rgba(56, 189, 248, 0.4)';
        let bg = 'rgba(15, 23, 42, 0.95)';

        if (toast.type === 'success') {
          icon = <CheckCircle2 size={20} color="#34d399" />;
          borderColor = 'rgba(52, 211, 153, 0.4)';
        } else if (toast.type === 'error') {
          icon = <AlertCircle size={20} color="#fb7185" />;
          borderColor = 'rgba(251, 113, 133, 0.4)';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle size={20} color="#fbbf24" />;
          borderColor = 'rgba(251, 191, 36, 0.4)';
        }

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              padding: '0.85rem 1.15rem',
              background: bg,
              backdropFilter: 'blur(12px)',
              border: `1px solid ${borderColor}`,
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
              color: '#f8fafc',
              fontSize: '0.9rem',
              animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {icon}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
