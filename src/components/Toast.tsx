import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 5000;
    const exitTimer = setTimeout(() => setIsExiting(true), duration - 300);
    const closeTimer = setTimeout(() => onClose(toast.id), duration);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [toast.id, toast.duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 300);
  };

  const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: '#065f46', border: '#10b981', icon: '#34d399' },
    error: { bg: '#7f1d1d', border: '#ef4444', icon: '#f87171' },
    info: { bg: '#1e3a5f', border: '#3b82f6', icon: '#60a5fa' },
    warning: { bg: '#78350f', border: '#f59e0b', icon: '#fbbf24' },
  };

  const icons: Record<ToastType, string> = {
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  };

  const color = colors[toast.type];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '16px 20px',
        background: color.bg,
        border: `1px solid ${color.border}`,
        borderRadius: 12,
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        minWidth: 320,
        maxWidth: 420,
        animation: isExiting ? 'slideOut 0.3s ease-out forwards' : 'slideIn 0.3s ease-out',
      }}
    >
      <svg
        style={{ width: 24, height: 24, flexShrink: 0, marginTop: 2 }}
        fill="none"
        stroke={color.icon}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[toast.type]} />
      </svg>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: '#fff', fontSize: 15, marginBottom: toast.message ? 4 : 0 }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.5 }}>
            {toast.message}
          </div>
        )}
      </div>
      <button
        onClick={handleClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          padding: 4,
          marginTop: -4,
          marginRight: -8,
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
      >
        <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
        `}
      </style>
      <div
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </div>
    </>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (type: ToastType, title: string, message?: string, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (title: string, message?: string, duration?: number) => addToast('success', title, message, duration);
  const error = (title: string, message?: string, duration?: number) => addToast('error', title, message, duration);
  const info = (title: string, message?: string, duration?: number) => addToast('info', title, message, duration);
  const warning = (title: string, message?: string, duration?: number) => addToast('warning', title, message, duration);

  return { toasts, removeToast, success, error, info, warning };
};
