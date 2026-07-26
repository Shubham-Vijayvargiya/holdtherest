import React from 'react';
import { CATEGORIES, CATEGORY_CONFIG } from '../types';
import { Play, Check, Trash2, Users, Lock, Clock, ArrowRightLeft, FileText } from 'lucide-react';

const categories = [CATEGORIES.MUST, CATEGORIES.SHOULD, CATEGORIES.NICE];

const formatTime = (seconds) => {
  if (!seconds) return null;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return '< 1m';
  return minutes >= 60 ? `${(minutes / 60).toFixed(1)}h` : `${minutes}m`;
};

export function TaskBoard({
  tasks,
  activeUser,
  onToggleComplete,
  onMoveTask,
  onDeleteTask,
  onStartFocus
}) {
  return (
    <div className="task-board">
      {categories.map((category) => {
        const config = CATEGORY_CONFIG[category];
        const activeTasks = tasks.filter((task) => task.category === category && task.status !== 'completed');
        const completedTasks = tasks.filter((task) => task.category === category && task.status === 'completed');

        return (
          <section className="task-column" key={category}>
            <div className="task-column__header">
              <div>
                <span className="category-pill" style={{ color: config.color, background: config.bg, borderColor: config.border }}>
                  {config.label}
                </span>
                <p>{config.description}</p>
              </div>
              <span className="task-count">{activeTasks.length}</span>
            </div>

            <div className="task-list">
              {activeTasks.length === 0 ? (
                <div className="empty-state compact">
                  <strong>Clear for now</strong>
                  <span>New tasks in this tier will appear here.</span>
                </div>
              ) : activeTasks.map((task) => {
                const isOwner = task.userId === activeUser.id;
                const spent = formatTime(task.totalTimeSpentSeconds);
                return (
                  <article className="task-card" key={task.id}>
                    <button
                      className="task-check"
                      onClick={() => onToggleComplete(task)}
                      aria-label={`Complete ${task.title}`}
                      disabled={!isOwner}
                    >
                      <Check size={14} />
                    </button>

                    <div className="task-card__body">
                      <h3>{task.title}</h3>
                      {task.notes && <p className="task-card__notes"><FileText size={13} /> Notes added</p>}

                      <div className="task-card__badges">
                        <span className={task.isShared ? 'shared-badge' : 'private-badge'}>
                          {task.isShared ? <Users size={12} /> : <Lock size={12} />}
                          {task.isShared ? `Shared with ${task.sharedWithEmails.length}` : 'Private'}
                        </span>
                        {spent && <span className="time-badge"><Clock size={12} /> {spent}</span>}
                      </div>

                      <div className="task-card__actions">
                        {isOwner && (
                          <label className="move-control">
                            <ArrowRightLeft size={13} />
                            <select value={task.category} onChange={(event) => onMoveTask(task, event.target.value)} aria-label={`Move ${task.title}`}>
                              {categories.map((value) => <option key={value} value={value}>{CATEGORY_CONFIG[value].label}</option>)}
                            </select>
                          </label>
                        )}
                        {isOwner && (
                          <button className="icon-button danger" onClick={() => onDeleteTask(task.id)} aria-label={`Delete ${task.title}`}>
                            <Trash2 size={15} />
                          </button>
                        )}
                        <button className="focus-button" onClick={() => onStartFocus(task)}>
                          <Play size={13} fill="currentColor" /> Focus
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {completedTasks.length > 0 && (
              <details className="completed-list">
                <summary>Completed ({completedTasks.length})</summary>
                {completedTasks.map((task) => (
                  <div key={task.id}>
                    <span>{task.title}</span>
                    {task.userId === activeUser.id && <button onClick={() => onToggleComplete(task)}>Reopen</button>}
                  </div>
                ))}
              </details>
            )}
          </section>
        );
      })}
    </div>
  );
}
