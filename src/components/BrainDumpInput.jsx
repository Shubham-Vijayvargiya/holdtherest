import React, { useState } from 'react';
import { CATEGORIES, CATEGORY_CONFIG } from '../types';
import { Plus, Check, Users, CalendarClock, Bell } from 'lucide-react';

export function BrainDumpInput({ onAddTask, members = [], onRequestReminderPermission }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES.MUST);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [dueAt, setDueAt] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onAddTask({
        title: title.trim(),
        category,
        sharedWithEmails: selectedEmails,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        reminderEnabled
      });
      setTitle('');
      setSelectedEmails([]);
      setDueAt('');
      setReminderEnabled(false);
      setFeedbackMsg('Captured. You can add context when you focus on it.');
      window.setTimeout(() => setFeedbackMsg(''), 3500);
    } finally {
      setSaving(false);
    }
  };

  const toggleMember = (email) => {
    setSelectedEmails((current) => current.includes(email)
      ? current.filter((value) => value !== email)
      : [...current, email]);
  };

  return (
    <section className="brain-dump">
      <div className="brain-dump__intro">
        <span className="eyebrow">Quick capture</span>
        <h2>What needs your attention?</h2>
        <p>Add only the task name here. Notes, comments, and work history live inside Focus mode.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="brain-dump__capture">
          <input
            data-quick-task-input
            className="brain-dump__input"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Capture a task…"
            maxLength={500}
          />
          <button className="primary-button brain-dump__submit" type="submit" disabled={saving || !title.trim()}>
            <Plus size={18} />
            <span>{saving ? 'Adding…' : 'Add task'}</span>
          </button>
        </div>

        <div className="brain-dump__options">
          <div className="brain-dump__priorities">
            <span>Priority</span>
            {[CATEGORIES.MUST, CATEGORIES.SHOULD, CATEGORIES.NICE].map((value) => {
              const config = CATEGORY_CONFIG[value];
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={category === value}
                  onClick={() => setCategory(value)}
                  style={{
                    color: config.color,
                    backgroundColor: category === value ? config.bg : 'var(--bg-subtle)',
                    borderColor: category === value ? config.border : 'var(--border-light)'
                  }}
                >
                  {config.label}
                </button>
              );
            })}
          </div>

          {members.length > 0 && (
            <div className="quick-share">
              <span><Users size={14} /> Share with</span>
              <div>
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    aria-pressed={selectedEmails.includes(member.member_email)}
                    onClick={() => toggleMember(member.member_email)}
                  >
                    {member.display_name || member.member_email.split('@')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="quick-schedule">
            <label>
              <CalendarClock size={14} />
              <span>Optional due date</span>
              <input
                type="datetime-local"
                value={dueAt}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(event) => {
                  setDueAt(event.target.value);
                  if (!event.target.value) setReminderEnabled(false);
                }}
              />
            </label>
            <label className="reminder-toggle">
              <input
                type="checkbox"
                checked={reminderEnabled}
                disabled={!dueAt}
                onChange={async (event) => {
                  if (!event.target.checked) {
                    setReminderEnabled(false);
                    return;
                  }
                  const granted = await onRequestReminderPermission?.();
                  setReminderEnabled(Boolean(granted));
                }}
              />
              <Bell size={13} />
              Remind me
            </label>
          </div>
        </div>
      </form>

      {feedbackMsg && <div className="inline-success"><Check size={16} /> {feedbackMsg}</div>}
    </section>
  );
}
