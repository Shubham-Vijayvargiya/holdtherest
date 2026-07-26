import React from 'react';
import { CATEGORY_CONFIG } from '../types';
import { Users, Check, Lock, Play } from 'lucide-react';

export function SharedView({
  sharedTasks,
  activeUser,
  onToggleComplete,
  onToggleShared,
  onStartFocus
}) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: 'var(--shared-bg)',
        border: '1px solid var(--shared-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--shared-color)', marginBottom: '8px' }}>
          <Users size={24} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>
            Shared Household Hub
          </h2>
        </div>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Common items shared between you and your partner. Only tasks explicitly marked as <strong>Shared</strong> appear here. All your other tasks remain strictly private to your logged-in account.
        </p>
      </div>

      {/* Shared Task List */}
      {sharedTasks.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-main)',
          border: '1px dashed var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          <Users size={32} style={{ color: 'var(--shared-color)', opacity: 0.6, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            No shared items right now
          </h3>
          <p style={{ fontSize: '13px' }}>
            To share a task with your partner, click the "Private" badge on any task card or toggle "Shared with Partner" when creating a new task.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {sharedTasks.map(task => {
            const config = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG['must_do'];
            const isCompleted = task.status === 'completed';
            const isOwner = task.userEmail?.toLowerCase() === activeUser.email?.toLowerCase();

            return (
              <div
                key={task.id}
                style={{
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  opacity: isCompleted ? 0.6 : 1
                }}
              >
                {/* Complete checkbox */}
                <button
                  onClick={() => onToggleComplete(task.id)}
                  aria-label={`${isCompleted ? 'Reopen' : 'Complete'} ${task.title}`}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    border: `1px solid ${isCompleted ? 'var(--nice-color)' : 'var(--border-strong)'}`,
                    backgroundColor: isCompleted ? 'var(--nice-bg)' : 'var(--bg-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCompleted ? 'var(--nice-color)' : 'transparent',
                    marginTop: '2px',
                    flexShrink: 0
                  }}
                >
                  <Check size={14} />
                </button>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: config.color,
                      backgroundColor: config.bg,
                      border: `1px solid ${config.border}`
                    }}>
                      {config.label}
                    </span>

                    <span style={{
                      fontSize: '11.5px',
                      color: 'var(--shared-color)',
                      fontWeight: 600,
                      backgroundColor: 'var(--shared-bg)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      Shared Item
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    textDecoration: isCompleted ? 'line-through' : 'none',
                    marginBottom: task.notes ? '6px' : '10px'
                  }}>
                    {task.title}
                  </h3>

                  {task.notes && (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      {task.notes}
                    </p>
                  )}

                  {/* Actions & Meta */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--bg-subtle)'
                  }}>
                    {isOwner ? (
                      <button
                        onClick={() => onToggleShared(task.id)}
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      >
                        <Lock size={12} />
                        <span>Make Private Again</span>
                      </button>
                    ) : (
                      <span className="ownership-label">Shared by {task.userEmail}</span>
                    )}

                    <button
                      onClick={() => onStartFocus(task)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: 'var(--accent-primary-bg)',
                        color: 'var(--accent-primary)',
                        border: '1px solid var(--accent-primary-border)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Start Focus</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
