import React, { useEffect } from 'react';
import { CheckCircle2, WifiOff, X } from 'lucide-react';

export function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(onDismiss, toast.duration || 6500);
    return () => window.clearTimeout(timeout);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className={`app-toast app-toast--${toast.kind || 'success'}`} role="status" aria-live="polite">
      {toast.kind === 'error' ? <WifiOff size={18} /> : <CheckCircle2 size={18} />}
      <span>{toast.message}</span>
      {toast.action && (
        <button onClick={() => { toast.action(); onDismiss(); }}>
          {toast.actionLabel || 'Undo'}
        </button>
      )}
      <button className="app-toast__close" onClick={onDismiss} aria-label="Dismiss message">
        <X size={16} />
      </button>
    </div>
  );
}
