import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORY_CONFIG } from '../types';
import {
  ArrowLeft,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock,
  Inbox,
  MessageSquare,
  Pause,
  Play,
  Save,
  Users
} from 'lucide-react';
import { NotesEditor, RichNotes } from './RichNotes';

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes ? `${minutes}m ${remainder}s` : `${remainder}s`;
};

const formatDate = (value) => new Date(value).toLocaleString([], {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

const toLocalInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const playCompletionTone = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.45);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.45);
  } catch {
    // Audio is an enhancement; timer completion must not depend on it.
  }
};

export function FocusMode({
  task,
  detail,
  members,
  activeUser,
  persistedFocus,
  onCompleteTask,
  onExitFocus,
  onParkThought,
  onLogSession,
  onSaveNotes,
  onAddComment,
  onUpdateShares,
  onUpdateSchedule,
  onSaveActiveFocus
}) {
  const initialPreset = persistedFocus?.preset_seconds || 25 * 60;
  const [presetSeconds, setPresetSeconds] = useState(initialPreset);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(persistedFocus?.accumulated_seconds || 0);
  const [startedAt, setStartedAt] = useState(persistedFocus?.started_at || null);
  const [isRunning, setIsRunning] = useState(Boolean(persistedFocus?.is_running));
  const [now, setNow] = useState(0);
  const [notes, setNotes] = useState(task.notes || '');
  const [editingNotes, setEditingNotes] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [comment, setComment] = useState('');
  const [parkedText, setParkedText] = useState('');
  const [showParking, setShowParking] = useState(false);
  const [selectedShares, setSelectedShares] = useState(task.sharedWithEmails || []);
  const [dueAt, setDueAt] = useState(() => toLocalInput(task.dueAt));
  const [reminderEnabled, setReminderEnabled] = useState(task.reminderEnabled);
  const finishingTimer = useRef(false);
  const isOwner = task.userId === activeUser.id;
  const config = CATEGORY_CONFIG[task.category];

  const runningSeconds = isRunning && startedAt
    ? Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000))
    : 0;
  const elapsedSeconds = accumulatedSeconds + runningSeconds;
  const timeLeft = Math.max(0, presetSeconds - elapsedSeconds);

  useEffect(() => setNotes(task.notes || ''), [task.notes]);
  useEffect(() => setSelectedShares(task.sharedWithEmails || []), [task.sharedWithEmails]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  const persistFocus = useCallback((next) => onSaveActiveFocus({
    taskId: task.id,
    presetSeconds: next.presetSeconds,
    accumulatedSeconds: next.accumulatedSeconds,
    startedAt: next.startedAt,
    isRunning: next.isRunning
  }), [onSaveActiveFocus, task.id]);

  const pauseAndLog = useCallback(async () => {
    if (!startedAt || !isRunning) return accumulatedSeconds;
    const chunk = Math.max(1, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000));
    const total = Math.min(presetSeconds, accumulatedSeconds + chunk);
    setIsRunning(false);
    setStartedAt(null);
    setAccumulatedSeconds(total);
    await Promise.all([
      onLogSession({
        taskId: task.id,
        taskTitle: task.title,
        category: task.category,
        durationSeconds: chunk,
        startedAt
      }),
      persistFocus({ presetSeconds, accumulatedSeconds: total, startedAt: null, isRunning: false })
    ]);
    return total;
  }, [accumulatedSeconds, isRunning, onLogSession, persistFocus, presetSeconds, startedAt, task]);

  useEffect(() => {
    if (!isRunning || timeLeft > 0 || finishingTimer.current) return;
    finishingTimer.current = true;
    pauseAndLog().then(() => {
      playCompletionTone();
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus interval complete', { body: task.title, tag: `focus-${task.id}` });
      }
    }).finally(() => {
      finishingTimer.current = false;
    });
  }, [isRunning, pauseAndLog, task.id, task.title, timeLeft]);

  useEffect(() => {
    if (!editingNotes || notes === task.notes) return undefined;
    setSaveStatus('saving');
    const timer = window.setTimeout(async () => {
      try {
        await onSaveNotes(task.id, notes);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [editingNotes, notes, onSaveNotes, task.id, task.notes]);

  const toggleTimer = useCallback(async () => {
    if (isRunning) {
      await pauseAndLog();
      return;
    }
    const reset = timeLeft === 0;
    const nextAccumulated = reset ? 0 : accumulatedSeconds;
    const nextStartedAt = new Date().toISOString();
    if (reset) setAccumulatedSeconds(0);
    setStartedAt(nextStartedAt);
    setIsRunning(true);
    setNow(Date.now());
    await persistFocus({
      presetSeconds,
      accumulatedSeconds: nextAccumulated,
      startedAt: nextStartedAt,
      isRunning: true
    });
  }, [accumulatedSeconds, isRunning, pauseAndLog, persistFocus, presetSeconds, timeLeft]);

  useEffect(() => {
    const shortcuts = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;
      if (event.code === 'Space') {
        event.preventDefault();
        toggleTimer();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        if (isRunning) pauseAndLog().finally(onExitFocus);
        else onExitFocus();
      }
    };
    window.addEventListener('keydown', shortcuts);
    return () => window.removeEventListener('keydown', shortcuts);
  }, [isRunning, onExitFocus, pauseAndLog, toggleTimer]);

  const selectPreset = async (minutes) => {
    const seconds = minutes * 60;
    setPresetSeconds(seconds);
    setAccumulatedSeconds(0);
    setStartedAt(null);
    setIsRunning(false);
    await persistFocus({ presetSeconds: seconds, accumulatedSeconds: 0, startedAt: null, isRunning: false });
  };

  const exit = async () => {
    if (isRunning) await pauseAndLog();
    onExitFocus();
  };

  const complete = async () => {
    if (isRunning) await pauseAndLog();
    await onCompleteTask(task);
  };

  const saveNotesNow = async () => {
    setSaveStatus('saving');
    await onSaveNotes(task.id, notes);
    setSaveStatus('saved');
    setEditingNotes(false);
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    await onAddComment(task.id, comment.trim());
    setComment('');
  };

  const toggleShare = async (email) => {
    const next = selectedShares.includes(email)
      ? selectedShares.filter((value) => value !== email)
      : [...selectedShares, email];
    setSelectedShares(next);
    await onUpdateShares(task.id, next);
  };

  const parkThought = async (event) => {
    event.preventDefault();
    if (!parkedText.trim()) return;
    await onParkThought(parkedText.trim());
    setParkedText('');
    setShowParking(false);
  };

  const saveSchedule = async () => {
    const schedule = {
      dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      reminderEnabled: Boolean(dueAt && reminderEnabled)
    };
    await onUpdateSchedule(task, schedule);
  };

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');
  const progress = Math.min(1, elapsedSeconds / presetSeconds);

  const timeline = useMemo(() => [
    ...(detail?.comments || []).map((item) => ({ kind: 'comment', at: item.created_at, item })),
    ...(detail?.sessions || []).map((item) => ({ kind: 'session', at: item.startedAt, item })),
    ...(detail?.activity || []).map((item) => ({ kind: 'activity', at: item.created_at, item }))
  ].sort((a, b) => new Date(b.at) - new Date(a.at)), [detail]);

  return (
    <div className="focus-page">
      <div className="focus-page__topbar">
        <button className="secondary-button" onClick={exit}><ArrowLeft size={16} /> Back to tasks</button>
        <span className="keyboard-hint"><kbd>Space</kbd> timer · <kbd>Esc</kbd> exit</span>
        <button className="secondary-button" onClick={() => setShowParking(true)}><Inbox size={16} /> Park thought</button>
      </div>

      <div className="focus-layout">
        <section className="focus-workspace">
          <span className="category-pill" style={{ color: config.color, background: config.bg, borderColor: config.border }}>{config.label}</span>
          <h1>{task.title}</h1>

          <div className="timer-presets">
            {[10, 25, 45].map((value) => (
              <button key={value} disabled={isRunning} data-active={presetSeconds === value * 60} onClick={() => selectPreset(value)}>{value} min</button>
            ))}
          </div>

          <div className="focus-timer-ring" style={{ '--timer-progress': `${progress * 360}deg` }}>
            <div>
              <strong>{minutes}:{seconds}</strong>
              <span>{isRunning ? 'Synced focus interval running' : elapsedSeconds ? 'Paused and saved' : 'Ready when you are'}</span>
            </div>
          </div>

          <div className="focus-actions">
            <button className="primary-button" onClick={toggleTimer}>
              {isRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
              {isRunning ? 'Pause & log interval' : timeLeft === 0 ? 'Start another interval' : 'Start focus'}
            </button>
            {isOwner && <button className="success-button" onClick={complete}><CheckCircle2 size={18} /> Complete task</button>}
          </div>

          <div className="focus-section">
            <div className="focus-section__heading">
              <div>
                <span className="eyebrow">Working notes</span>
                <h2>Context for your next session</h2>
                {editingNotes && <small className={`save-status save-status--${saveStatus}`}>{saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved to cloud' : saveStatus === 'error' ? 'Save failed—retrying when you type' : 'Autosaves as you type'}</small>}
              </div>
              {isOwner && !editingNotes && <button className="text-button" onClick={() => setEditingNotes(true)}>Edit notes</button>}
            </div>
            {editingNotes ? (
              <>
                <NotesEditor value={notes} onChange={setNotes} />
                <div className="editor-actions">
                  <button className="primary-button" onClick={saveNotesNow}><Save size={16} /> Done</button>
                </div>
              </>
            ) : <RichNotes value={task.notes} />}
          </div>

          {isOwner && (
            <div className="focus-section focus-schedule">
              <div className="focus-section__heading">
                <div><span className="eyebrow"><CalendarClock size={13} /> Schedule</span><h2>Due date & reminder</h2></div>
              </div>
              <div>
                <input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
                <label><input type="checkbox" checked={reminderEnabled} disabled={!dueAt} onChange={(event) => setReminderEnabled(event.target.checked)} /><Bell size={13} /> Reminder</label>
                <button className="secondary-button" onClick={saveSchedule}>Save schedule</button>
              </div>
            </div>
          )}

          {isOwner && members.length > 0 && (
            <div className="focus-section">
              <div className="focus-section__heading">
                <div><span className="eyebrow"><Users size={13} /> Sharing</span><h2>Who can see this task?</h2></div>
              </div>
              <div className="share-picker">
                {members.map((member) => (
                  <button key={member.id} data-selected={selectedShares.includes(member.member_email)} onClick={() => toggleShare(member.member_email)}>
                    {member.display_name || member.member_email.split('@')[0]}
                    <small>{member.status === 'active' ? 'Active member' : 'Pending first sign-in'}</small>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="task-timeline">
          <div>
            <span className="eyebrow">Task record</span>
            <h2>Comments & history</h2>
            <p>Every focus interval and update stays attached to this task and syncs for shared members.</p>
          </div>

          <form className="comment-form" onSubmit={addComment}>
            <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a progress note or comment…" rows={3} maxLength={5000} />
            <button className="primary-button" type="submit" disabled={!comment.trim()}><MessageSquare size={15} /> Add comment</button>
          </form>

          <div className="timeline-list">
            {timeline.length === 0 ? (
              <div className="empty-state compact"><strong>No history yet</strong><span>Your first comment or focus interval will appear here.</span></div>
            ) : timeline.map((entry) => (
              <article className={`timeline-entry timeline-entry--${entry.kind}`} key={`${entry.kind}-${entry.item.id}`}>
                <span className="timeline-entry__icon">{entry.kind === 'session' ? <Clock size={15} /> : entry.kind === 'comment' ? <MessageSquare size={15} /> : <CheckCircle2 size={15} />}</span>
                <div>
                  {entry.kind === 'comment' && <><strong>{entry.item.author_name || 'User'}</strong><p>{entry.item.body}</p></>}
                  {entry.kind === 'session' && <><strong>{formatDuration(entry.item.durationSeconds)} focus interval</strong><p>Logged by {entry.item.userEmail}</p></>}
                  {entry.kind === 'activity' && <><strong>{entry.item.event_type.replaceAll('_', ' ')}</strong><p>{entry.item.actor_name || 'User'}</p></>}
                  <time>{formatDate(entry.at)}</time>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>

      {showParking && (
        <div className="modal-backdrop">
          <form className="small-modal" onSubmit={parkThought}>
            <h2>Park a thought</h2>
            <p>Capture the distraction without leaving this task.</p>
            <textarea autoFocus value={parkedText} onChange={(event) => setParkedText(event.target.value)} rows={4} />
            <div>
              <button type="button" className="secondary-button" onClick={() => setShowParking(false)}>Cancel</button>
              <button type="submit" className="primary-button">Save to parking lot</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
