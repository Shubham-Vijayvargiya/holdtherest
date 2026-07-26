import React, { useEffect, useRef } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export function ConfirmModal({
  isOpen,
  title = "Confirm Completion",
  message = "Are you sure you want to mark this task complete?",
  confirmLabel = "Yes, Mark Complete",
  cancelLabel = "Not Yet",
  onConfirm,
  onCancel
}) {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previouslyFocused = document.activeElement;
    cancelButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onCancel()}
      style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 500,
      padding: '20px'
    }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        style={{
        backgroundColor: 'var(--bg-main)',
        width: '100%',
        maxWidth: '420px',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-light)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button
          ref={cancelButtonRef}
          onClick={onCancel}
          aria-label="Close confirmation"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: 'var(--text-light)',
            padding: '4px'
          }}
        >
          <X size={18} />
        </button>

        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--nice-bg)',
          color: 'var(--nice-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          border: '1px solid var(--nice-border)'
        }}>
          <CheckCircle2 size={26} />
        </div>

        <h3 id="confirm-modal-title" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '8px'
        }}>
          {title}
        </h3>

        <p id="confirm-modal-description" style={{
          fontSize: '13.5px',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          marginBottom: '24px'
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              fontSize: '13.5px',
              fontWeight: 600,
              border: '1px solid var(--border-light)'
            }}
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--nice-color)',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
