import React, { useEffect, useRef, useState } from 'react';
import { CATEGORY_CONFIG } from '../types';
import { ArrowLeft, CheckCircle2, Clock, Inbox, MessageSquare, Pause, Play, Save, Users } from 'lucide-react';
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

export function FocusMode({
  task,
  detail,
  members,
  activeUser,
  onCompleteTask,
  onExitFocus,
  onParkThought,
  onLogSession,
  onSaveNotes,
  onAddComment,
  onUpdateShares
}) {
  const [preset, setPreset] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');
  const [editingNotes, setEditingNotes] = useState(false);
  const [comment, setComment] = useState('');
  const [parkedText, setParkedText] = useState('');
  const [showParking, setShowParking] = useState(false);
  const [selectedShares, setSelectedShares] = useState(task.sharedWithEmails || []);
  const intervalStartedAt = useRef(null);
  const isOwner = task.userId === activeUser.id;
  const config = CATEGORY_CONFIG[task.category];

  useEffect(() => setNotes(task.notes || ''), [task.notes]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setIsRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  const logCurrentInterval = async () => {
    if (!intervalStartedAt.current) return;
    const startedAt = intervalStartedAt.current;
    const durationSeconds = Math.max(1, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000));
    intervalStartedAt.current = null;
    await onLogSession({
      taskId: task.id,
      taskTitle: task.title,
      category: task.category,
      durationSeconds,
      startedAt
    });
  };

  const toggleTimer = async () => {
    if (isRunning) {
      setIsRunning(false);
      await logCurrentInterval();
      return;
    }
    if (!timeLeft) return;
    intervalStartedAt.current = new Date().toISOString();
    setIsRunning(true);
  };

  const selectPreset = (minutes) => {
    setPreset(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
    intervalStartedAt.current = null;
  };

  const exit = async () => {
    setIsRunning(false);
    await logCurrentInterval();
    onExitFocus();
  };

  const complete = async () => {
    setIsRunning(false);
    await logCurrentInterval();
    await onCompleteTask(task);
  };

  const saveNotes = async () => {
    await onSaveNotes(task.id, notes);
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

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');
  const progress = 1 - timeLeft / (preset * 60);

  const timeline = [
    ...(detail?.comments || []).map((item) => ({ kind: 'comment', at: item.created_at, item })),
    ...(detail?.sessions || []).map((item) => ({ kind: 'session', at: item.startedAt, item })),
    ...(detail?.activity || []).map((item) => ({ kind: 'activity', at: item.created_at, item }))
  ].sort((a, b) => new Date(b.at) - new Date(a.at));

  return (
    <div className="focus-page">
      <div className="focus-page__topbar">
        <button className="secondary-button" onClick={exit}><ArrowLeft size={16} /> Back to tasks</button>
        <button className="secondary-button" onClick={() => setShowParking(true)}><Inbox size={16} /> Park thought</button>
      </div>

      <div className="focus-layout">
        <section className="focus-workspace">
          <span className="category-pill" style={{ color: config.color, background: config.bg, borderColor: config.border }}>{config.label}</span>
          <h1>{task.title}</h1>

          <div className="timer-presets">
            {[10, 25, 45].map((value) => (
              <button key={value} disabled={isRunning} data-active={preset === value} onClick={() => selectPreset(value)}>{value} min</button>
            ))}
          </div>

          <div className="focus-timer-ring" style={{ '--timer-progress': `${progress * 360}deg` }}>
            <div>
              <strong>{minutes}:{seconds}</strong>
              <span>{isRunning ? 'Focus interval running' : 'Ready when you are'}</span>
            </div>
          </div>

          <div className="focus-actions">
            <button className="primary-button" onClick={toggleTimer}>
              {isRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
              {isRunning ? 'Pause & log interval' : 'Start focus'}
            </button>
            {isOwner && <button className="success-button" onClick={complete}><CheckCircle2 size={18} /> Complete task</button>}
          </div>

          <div className="focus-section">
            <div className="focus-section__heading">
              <div><span className="eyebrow">Working notes</span><h2>Context for your next session</h2></div>
              {isOwner && !editingNotes && <button className="text-button" onClick={() => setEditingNotes(true)}>Edit notes</button>}
            </div>
            {editingNotes ? (
              <>
                <NotesEditor value={notes} onChange={setNotes} />
                <div className="editor-actions">
                  <button className="secondary-button" onClick={() => { setNotes(task.notes || ''); setEditingNotes(false); }}>Cancel</button>
                  <button className="primary-button" onClick={saveNotes}><Save size={16} /> Save notes</button>
                </div>
              </>
            ) : <RichNotes value={task.notes} />}
          </div>

          {isOwner && members.length > 0 && (
            <div className="focus-section">
              <div className="focus-section__heading">
                <div><span className="eyebrow"><Users size={13} /> Sharing</span><h2>Who can see this task?</h2></div>
              </div>
              <div className="share-picker">
                {members.map((member) => (
                  <button
                    key={member.id}
                    data-selected={selectedShares.includes(member.member_email)}
                    onClick={() => toggleShare(member.member_email)}
                  >
                    {member.display_name || member.member_email.split('@')[0]}
                    <small>{member.member_email}</small>
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
            <p>Every focus interval and update stays attached to this task.</p>
          </div>

          <form className="comment-form" onSubmit={addComment}>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a progress note or comment…" rows={3} maxLength={5000} />
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
            <textarea autoFocus value={parkedText} onChange={(e) => setParkedText(e.target.value)} rows={4} />
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
