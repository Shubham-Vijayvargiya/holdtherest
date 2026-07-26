import React from 'react';
import { CATEGORIES, CATEGORY_CONFIG } from '../types';
import { Play, Check, Trash2, Users, Lock, Clock } from 'lucide-react';

export function TaskBoard({
  tasks,
  activeUser,
  onToggleComplete,
  onToggleShared,
  onDeleteTask,
  onStartFocus
}) {
  const categories = [CATEGORIES.MUST, CATEGORIES.SHOULD, CATEGORIES.NICE];

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return null;
    const mins = Math.floor(seconds / 60);
    if (mins < 1) return '< 1m';
    if (mins >= 60) {
      const hrs = (mins / 60).toFixed(1);
      return `${hrs}h spent`;
    }
    return `${mins}m spent`;
  };

  return (
    <div className="task-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
      {categories.map(cat => {
        const config = CATEGORY_CONFIG[cat];
        const catTasks = tasks.filter(t => t.category === cat && t.status !== 'completed');
        const startOfToday = new Date().setHours(0, 0, 0, 0);
        const completedTasks = tasks.filter(t =>
          t.category === cat &&
          t.status === 'completed' &&
          Number(t.completedAt) >= startOfToday
        );

        return (
          <div className="task-column" key={cat} style={{
            backgroundColor: 'var(--bg-main)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Column Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '16px'
            }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: config.color,
                  backgroundColor: config.bg,
                  border: `1px solid ${config.border}`,
                  marginBottom: '4px'
                }}>
                  {config.label}
                </span>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {config.description}
                </p>
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-subtle)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-light)'
              }}>
                {catTasks.length}
              </span>
            </div>

            {/* Active Task List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {catTasks.length === 0 ? (
                <div style={{
                  padding: '30px 16px',
                  textAlign: 'center',
                  color: 'var(--text-light)',
                  fontSize: '13px',
                  border: '1px dashed var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)'
                }}>
                  Your mind is clear here. Dump a thought whenever needed.
                </div>
              ) : (
                catTasks.map(task => {
                  const isOwner = task.userId === activeUser.id;
                  const timeSpentStr = formatTime(task.totalTimeSpentSeconds);

                  return (
                    <div
                      key={task.id}
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        {/* Checkbox */}
                        <button
                          onClick={() => onToggleComplete(task.id)}
                          title="Mark completed"
                          aria-label={`Mark ${task.title} completed`}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-strong)',
                            backgroundColor: 'var(--bg-main)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'transparent',
                            cursor: 'pointer',
                            marginTop: '2px',
                            flexShrink: 0
                          }}
                        >
                          <Check size={14} />
                        </button>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: '14.5px',
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            lineHeight: 1.3,
                            marginBottom: '6px'
                          }}>
                            {task.title}
                          </h3>

                          {task.notes && (
                            <p style={{
                              fontSize: '12.5px',
                              color: 'var(--text-muted)',
                              marginBottom: '10px'
                            }}>
                              {task.notes}
                            </p>
                          )}

                          {/* Meta Row */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '8px',
                            marginTop: '12px',
                            paddingTop: '8px',
                            borderTop: '1px solid var(--bg-subtle)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {/* Privacy Badge */}
                              {isOwner ? (
                                <button
                                  onClick={() => onToggleShared(task.id)}
                                  title={task.isShared ? "Shared with Partner" : "Private"}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: task.isShared ? 'var(--shared-color)' : 'var(--text-muted)',
                                  backgroundColor: task.isShared ? 'var(--shared-bg)' : 'var(--bg-subtle)',
                                  border: `1px solid ${task.isShared ? 'var(--shared-border)' : 'var(--border-light)'}`,
                                  padding: '2px 7px',
                                  borderRadius: 'var(--radius-full)'
                                }}
                                >
                                  {task.isShared ? <Users size={11} /> : <Lock size={11} />}
                                  <span>{task.isShared ? 'Shared' : 'Private'}</span>
                                </button>
                              ) : (
                                <span className="ownership-label">Shared with you</span>
                              )}

                              {/* Time Spent Pill */}
                              {timeSpentStr && (
                                <span style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '11px',
                                  color: '#4f46e5',
                                  backgroundColor: '#eef2ff',
                                  border: '1px solid #c7d2fe',
                                  padding: '2px 7px',
                                  borderRadius: 'var(--radius-full)',
                                  fontWeight: 600
                                }}>
                                  <Clock size={11} />
                                  <span>{timeSpentStr}</span>
                                </span>
                              )}
                            </div>

                            {/* Focus Button & Delete */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {isOwner && (
                                <button
                                  onClick={() => onDeleteTask(task.id)}
                                  title="Delete task"
                                  aria-label={`Delete ${task.title}`}
                                style={{
                                  color: 'var(--text-light)',
                                  padding: '4px',
                                  borderRadius: '4px'
                                }}
                                >
                                  <Trash2 size={14} />
                                </button>
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
                                  padding: '5px 11px',
                                  borderRadius: 'var(--radius-md)',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <Play size={12} fill="currentColor" />
                                <span>Focus</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Completed section collapsible */}
            {completedTasks.length > 0 && (
              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px dashed var(--border-light)' }}>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                  Completed Today ({completedTasks.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {completedTasks.map(ct => (
                    <div
                      key={ct.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <span style={{ textDecoration: 'line-through' }}>{ct.title}</span>
                      <button
                        onClick={() => onToggleComplete(ct.id)}
                        style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 600 }}
                      >
                        Undo
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
