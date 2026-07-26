import React, { useState, useEffect, useRef } from 'react';
import { CATEGORY_CONFIG } from '../types';
import { Play, Pause, RotateCcw, CheckCircle2, ArrowLeft, Inbox } from 'lucide-react';

export function FocusMode({
  task,
  onCompleteTask,
  onExitFocus,
  onParkThought,
  onLogSession
}) {
  // Preset options in minutes
  const PRESETS = [10, 25, 45];
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const accumulatedSecondsRef = useRef(0);
  const runStartedAtRef = useRef(null);

  // Parking Lot state
  const [showParkingInput, setShowParkingInput] = useState(false);
  const [parkedText, setParkedText] = useState('');
  const [parkedToast, setParkedToast] = useState('');
  const parkingInputRef = useRef(null);

  const catConfig = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG['must_do'];

  // Handle Hotkey (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowParkingInput(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto focus input when modal opens
  useEffect(() => {
    if (showParkingInput && parkingInputRef.current) {
      parkingInputRef.current.focus();
    }
  }, [showParkingInput]);

  // Timer interval effect
  useEffect(() => {
    if (!isRunning) return undefined;
    const totalSeconds = selectedMinutes * 60;
    const updateFromClock = () => {
      const currentRunSeconds = Math.floor((Date.now() - runStartedAtRef.current) / 1000);
      const elapsed = Math.min(totalSeconds, accumulatedSecondsRef.current + currentRunSeconds);
      setElapsedSeconds(elapsed);
      setTimeLeftSeconds(Math.max(0, totalSeconds - elapsed));
      if (elapsed >= totalSeconds) {
        accumulatedSecondsRef.current = totalSeconds;
        runStartedAtRef.current = null;
        setIsRunning(false);
      }
    };
    updateFromClock();
    const interval = window.setInterval(updateFromClock, 250);
    return () => window.clearInterval(interval);
  }, [isRunning, selectedMinutes]);

  const handleToggleTimer = () => {
    if (isRunning) {
      const currentRunSeconds = Math.floor((Date.now() - runStartedAtRef.current) / 1000);
      accumulatedSecondsRef.current = Math.min(
        selectedMinutes * 60,
        accumulatedSecondsRef.current + currentRunSeconds
      );
      setElapsedSeconds(accumulatedSecondsRef.current);
      runStartedAtRef.current = null;
      setIsRunning(false);
      return;
    }
    if (timeLeftSeconds <= 0) return;
    runStartedAtRef.current = Date.now();
    setIsRunning(true);
  };

  const handleSelectPreset = (mins) => {
    setSelectedMinutes(mins);
    setTimeLeftSeconds(mins * 60);
    setElapsedSeconds(0);
    accumulatedSecondsRef.current = 0;
    runStartedAtRef.current = null;
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeftSeconds(selectedMinutes * 60);
    setElapsedSeconds(0);
    accumulatedSecondsRef.current = 0;
    runStartedAtRef.current = null;
  };

  const handleComplete = () => {
    setIsRunning(false);
    // Log time spent
    if (elapsedSeconds > 0) {
      onLogSession({
        taskId: task.id,
        taskTitle: task.title,
        category: task.category,
        durationSeconds: elapsedSeconds
      });
    }
    onCompleteTask(task.id);
  };

  const handleExit = () => {
    setIsRunning(false);
    if (elapsedSeconds > 0) {
      onLogSession({
        taskId: task.id,
        taskTitle: task.title,
        category: task.category,
        durationSeconds: elapsedSeconds
      });
    }
    onExitFocus();
  };

  const handleSaveParkedThought = (e) => {
    e.preventDefault();
    if (!parkedText.trim()) return;

    onParkThought(parkedText.trim());
    setParkedText('');
    setShowParkingInput(false);

    setParkedToast('Thought parked safely. Focus timer uninterrupted.');
    setTimeout(() => setParkedToast(''), 3500);
  };

  // Calculate Ring Progress
  const totalSecondsForPreset = selectedMinutes * 60;
  const progressPercent = totalSecondsForPreset > 0
    ? ((totalSecondsForPreset - timeLeftSeconds) / totalSecondsForPreset) * 100
    : 0;

  const minutesDisplay = String(Math.floor(timeLeftSeconds / 60)).padStart(2, '0');
  const secondsDisplay = String(timeLeftSeconds % 60).padStart(2, '0');

  // Time logged formatted for bottom status
  const elapsedMins = Math.floor(elapsedSeconds / 60);
  const elapsedSecs = elapsedSeconds % 60;

  return (
    <div style={{
      maxWidth: '720px',
      margin: '0 auto',
      padding: '40px 20px',
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Top Header Controls */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '40px'
      }}>
        <button
          onClick={handleExit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 600,
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)'
          }}
        >
          <ArrowLeft size={16} />
          <span>Exit Focus</span>
        </button>

        {/* Hotkey Hint button */}
        <button
          onClick={() => setShowParkingInput(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#0f766e',
            backgroundColor: '#f0fdfa',
            border: '1px solid #99f6e4',
            fontSize: '12.5px',
            fontWeight: 600,
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <Inbox size={16} />
          <span>Park a Thought (Ctrl+K)</span>
        </button>
      </div>

      {/* Focus Task Card */}
      <div style={{
        width: '100%',
        backgroundColor: 'var(--bg-main)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-strong)',
        padding: '36px',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center',
        marginBottom: '36px'
      }}>
        {/* Category Pill */}
        <span style={{
          display: 'inline-block',
          padding: '4px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '12px',
          fontWeight: 700,
          color: catConfig.color,
          backgroundColor: catConfig.bg,
          border: `1px solid ${catConfig.border}`,
          marginBottom: '16px'
        }}>
          Current Focus — {catConfig.label}
        </span>

        {/* Active Task Title */}
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '26px',
          fontWeight: 700,
          color: 'var(--text-main)',
          lineHeight: 1.3,
          marginBottom: task.notes ? '12px' : '24px'
        }}>
          {task.title}
        </h2>

        {task.notes && (
          <p style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            maxWidth: '500px',
            margin: '0 auto 24px auto'
          }}>
            {task.notes}
          </p>
        )}

        {/* Tiimo-inspired Visual Timer Ring */}
        <div style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          margin: '0 auto 28px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Track */}
            <circle
              cx="100"
              cy="100"
              r="84"
              stroke="var(--bg-subtle)"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="100"
              cy="100"
              r="84"
              stroke="var(--accent-primary)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 84}
              strokeDashoffset={2 * Math.PI * 84 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>

          {/* Center Digital Clock */}
          <div style={{
            position: 'absolute',
            textAlign: 'center'
          }}>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '36px',
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '1px'
            }}>
              {minutesDisplay}:{secondsDisplay}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
              {isRunning ? 'FOCUSING' : 'PAUSED'}
            </div>
          </div>
        </div>

        {/* Preset Selector Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '28px'
        }}>
          {PRESETS.map(mins => (
            <button
              key={mins}
              onClick={() => handleSelectPreset(mins)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12.5px',
                fontWeight: 600,
                color: selectedMinutes === mins ? 'var(--accent-primary)' : 'var(--text-muted)',
                backgroundColor: selectedMinutes === mins ? 'var(--accent-primary-bg)' : 'var(--bg-subtle)',
                border: `1px solid ${selectedMinutes === mins ? 'var(--accent-primary-border)' : 'var(--border-light)'}`,
                transition: 'all 0.15s ease'
              }}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Timer Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <button
            onClick={handleToggleTimer}
            disabled={!isRunning && timeLeftSeconds <= 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isRunning ? 'var(--bg-subtle)' : 'var(--accent-primary)',
              color: isRunning ? 'var(--text-main)' : '#ffffff',
              border: isRunning ? '1px solid var(--border-strong)' : 'none',
              fontSize: '15px',
              fontWeight: 700,
              boxShadow: isRunning ? 'none' : 'var(--shadow-md)',
              transition: 'all 0.15s ease'
            }}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            <span>{isRunning ? 'Pause Timer' : 'Start Focus'}</span>
          </button>

          <button
            onClick={handleReset}
            title="Reset timer"
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-muted)'
            }}
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={handleComplete}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--nice-bg)',
              color: 'var(--nice-color)',
              border: '1px solid var(--nice-border)',
              fontSize: '14px',
              fontWeight: 700,
              transition: 'all 0.15s ease'
            }}
          >
            <CheckCircle2 size={18} />
            <span>Mark Yes / Done</span>
          </button>
        </div>
      </div>

      {/* Live Time Tracked Session Footer */}
      <div style={{
        fontSize: '13px',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>Time logged in this session:</span>
        <strong style={{ color: 'var(--text-main)' }}>
          {elapsedMins > 0 ? `${elapsedMins}m ${elapsedSecs}s` : `${elapsedSecs}s`}
        </strong>
      </div>

      {/* Toast Feedback */}
      {parkedToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          backgroundColor: '#0f766e',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: 'var(--radius-md)',
          fontSize: '13.5px',
          fontWeight: 600,
          boxShadow: 'var(--shadow-lg)',
          zIndex: 200
        }}>
          {parkedToast}
        </div>
      )}

      {/* Parking Lot Modal Input (Ctrl+K) */}
      {showParkingInput && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-main)',
            width: '100%',
            maxWidth: '480px',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                Park an Intrusive Thought
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                Timer keeps running
              </span>
            </div>

            <form onSubmit={handleSaveParkedThought}>
              <input
                ref={parkingInputRef}
                type="text"
                value={parkedText}
                onChange={(e) => setParkedText(e.target.value)}
                placeholder="What's distracting you? Dump it here to safely return..."
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--accent-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  marginBottom: '16px'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowParkingInput(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!parkedText.trim()}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  Save to Parking Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
