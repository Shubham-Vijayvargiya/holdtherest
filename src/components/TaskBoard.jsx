import React, { useMemo, useState } from 'react';
import { CATEGORIES, CATEGORY_CONFIG } from '../types';
import {
  ArrowRightLeft,
  Bell,
  CalendarClock,
  Check,
  Clock,
  FileText,
  Filter,
  GripVertical,
  Lock,
  Play,
  Search,
  Trash2,
  Users
} from 'lucide-react';

const categories = [CATEGORIES.MUST, CATEGORIES.SHOULD, CATEGORIES.NICE];

const formatTime = (seconds) => {
  if (!seconds) return null;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return '< 1m';
  return minutes >= 60 ? `${(minutes / 60).toFixed(1)}h` : `${minutes}m`;
};

const toLocalInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const formatDue = (value) => {
  if (!value) return null;
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

function TaskSchedule({ task, onScheduleTask, onRequestReminderPermission }) {
  const [dueAt, setDueAt] = useState(() => toLocalInput(task.dueAt));
  const [reminder, setReminder] = useState(task.reminderEnabled);

  const save = async () => {
    await onScheduleTask(task, {
      dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      reminderEnabled: Boolean(dueAt && reminder)
    });
  };

  return (
    <details className="task-schedule">
      <summary><CalendarClock size={13} /> {task.dueAt ? formatDue(task.dueAt) : 'Schedule'}</summary>
      <div>
        <input
          aria-label={`Due date for ${task.title}`}
          type="datetime-local"
          value={dueAt}
          onChange={(event) => {
            setDueAt(event.target.value);
            if (!event.target.value) setReminder(false);
          }}
        />
        <label>
          <input
            type="checkbox"
            checked={reminder}
            disabled={!dueAt}
            onChange={async (event) => {
              if (!event.target.checked) return setReminder(false);
              const granted = await onRequestReminderPermission?.();
              setReminder(Boolean(granted));
            }}
          />
          <Bell size={12} /> Reminder
        </label>
        <button type="button" onClick={save}>Save</button>
      </div>
    </details>
  );
}

export function TaskBoard({
  tasks,
  members = [],
  onToggleComplete,
  onMoveTask,
  onDeleteTask,
  onScheduleTask,
  onRequestReminderPermission,
  onStartFocus
}) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('active');
  const [member, setMember] = useState('all');
  const [sort, setSort] = useState('recent');

  const visibleTasks = useMemo(() => {
    const now = new Date();
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const filtered = tasks.filter((task) => {
      const searchable = `${task.title} ${task.notes}`.toLowerCase();
      if (query && !searchable.includes(query.toLowerCase())) return false;
      if (member !== 'all' && !task.sharedWithEmails.includes(member)) return false;
      if (scope === 'active' && task.status === 'completed') return false;
      if (scope === 'completed' && task.status !== 'completed') return false;
      if (scope === 'shared' && !task.isShared) return false;
      if (scope === 'private' && task.isShared) return false;
      if (scope === 'today' && (!task.dueAt || new Date(task.dueAt) > endOfToday)) return false;
      if (scope === 'overdue' && (!task.dueAt || new Date(task.dueAt) >= now || task.status === 'completed')) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sort === 'due') return (new Date(a.dueAt || '9999-12-31')) - (new Date(b.dueAt || '9999-12-31'));
      if (sort === 'time') return b.totalTimeSpentSeconds - a.totalTimeSpentSeconds;
      if (sort === 'title') return a.title.localeCompare(b.title);
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });
  }, [tasks, query, scope, member, sort]);

  const dropTask = (event, category) => {
    event.preventDefault();
    const task = tasks.find((candidate) => candidate.id === event.dataTransfer.getData('text/task-id'));
    if (task && task.category !== category) onMoveTask(task, category);
  };

  return (
    <section aria-label="Task board">
      <div className="task-tools">
        <label className="task-search">
          <Search size={16} />
          <input
            data-task-search
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks or notes…"
            aria-label="Search tasks"
          />
        </label>
        <label><Filter size={14} /><span className="sr-only">Filter tasks</span>
          <select value={scope} onChange={(event) => setScope(event.target.value)} aria-label="Task status filter">
            <option value="active">Active</option>
            <option value="today">Due today</option>
            <option value="overdue">Overdue</option>
            <option value="shared">Shared</option>
            <option value="private">Private</option>
            <option value="completed">Completed</option>
            <option value="all">All tasks</option>
          </select>
        </label>
        {members.length > 0 && (
          <select value={member} onChange={(event) => setMember(event.target.value)} aria-label="Filter by shared member">
            <option value="all">All people</option>
            {members.map((item) => <option key={item.id} value={item.member_email}>{item.display_name || item.member_email}</option>)}
          </select>
        )}
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort tasks">
          <option value="recent">Recently updated</option>
          <option value="due">Due date</option>
          <option value="time">Most focus time</option>
          <option value="title">Task name</option>
        </select>
      </div>

      {visibleTasks.length === 0 && query && (
        <div className="search-empty">No tasks match “{query}”. <button onClick={() => setQuery('')}>Clear search</button></div>
      )}

      <div className="task-board">
        {categories.map((category) => {
          const config = CATEGORY_CONFIG[category];
          const categoryTasks = visibleTasks.filter((task) => task.category === category);
          const activeTasks = categoryTasks.filter((task) => task.status !== 'completed');
          const completedTasks = categoryTasks.filter((task) => task.status === 'completed');

          return (
            <section
              className="task-column"
              key={category}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => dropTask(event, category)}
            >
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
                    <span>Drop a task here or capture something new.</span>
                  </div>
                ) : activeTasks.map((task) => {
                  const spent = formatTime(task.totalTimeSpentSeconds);
                  const overdue = task.dueAt && new Date(task.dueAt) < new Date();
                  return (
                    <article
                      className="task-card"
                      data-pending={task.pending}
                      draggable={!task.pending}
                      onDragStart={(event) => event.dataTransfer.setData('text/task-id', task.id)}
                      key={task.id}
                    >
                      <GripVertical className="drag-handle" size={16} aria-hidden="true" />
                      <button className="task-check" onClick={() => onToggleComplete(task)} aria-label={`Complete ${task.title}`} disabled={task.pending}>
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
                          {task.dueAt && <span className={overdue ? 'due-badge due-badge--overdue' : 'due-badge'}><CalendarClock size={12} /> {formatDue(task.dueAt)}</span>}
                        </div>

                        <TaskSchedule
                          task={task}
                          onScheduleTask={onScheduleTask}
                          onRequestReminderPermission={onRequestReminderPermission}
                        />

                        <div className="task-card__actions">
                          <label className="move-control">
                            <ArrowRightLeft size={13} />
                            <select value={task.category} onChange={(event) => onMoveTask(task, event.target.value)} aria-label={`Move ${task.title}`} disabled={task.pending}>
                              {categories.map((value) => <option key={value} value={value}>{CATEGORY_CONFIG[value].label}</option>)}
                            </select>
                          </label>
                          <button className="icon-button danger" onClick={() => onDeleteTask(task)} aria-label={`Delete ${task.title}`} disabled={task.pending}>
                            <Trash2 size={15} />
                          </button>
                          <button className="focus-button" onClick={() => onStartFocus(task)} disabled={task.pending}>
                            <Play size={13} fill="currentColor" /> Focus
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {completedTasks.length > 0 && (
                <details className="completed-list" open={scope === 'completed'}>
                  <summary>Completed ({completedTasks.length})</summary>
                  {completedTasks.map((task) => (
                    <div key={task.id}>
                      <span>{task.title}</span>
                      <button onClick={() => onToggleComplete(task, false)}>Reopen</button>
                    </div>
                  ))}
                </details>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
