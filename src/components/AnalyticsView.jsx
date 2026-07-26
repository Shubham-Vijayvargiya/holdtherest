import React from 'react';
import { CATEGORIES, CATEGORY_CONFIG } from '../types';
import { Clock, CheckCircle2, Award } from 'lucide-react';

export function AnalyticsView({ sessions, activeUser }) {
  // Filter sessions for active user
  const userSessions = sessions.filter(s => s.userId === activeUser.id);

  // Total seconds spent
  const totalSeconds = userSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const totalMins = Math.floor(totalSeconds / 60);
  const hoursDisplay = (totalMins / 60).toFixed(1);

  // Category breakdown
  const categoryTime = {
    [CATEGORIES.MUST]: 0,
    [CATEGORIES.SHOULD]: 0,
    [CATEGORIES.NICE]: 0
  };

  userSessions.forEach(s => {
    if (categoryTime[s.category] !== undefined) {
      categoryTime[s.category] += (s.durationSeconds || 0);
    }
  });

  const formatSeconds = (sec) => {
    if (!sec || sec <= 0) return '0m';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m < 1) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="analytics-view" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '4px'
        }}>
          Time Analytics & Reflection
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
          Review how much focused time you spent across your Must-Dos, Should-Dos, and Nice-to-Haves.
        </p>
      </div>

      {/* Stat Cards Row */}
      <div className="analytics-stats" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Total Time */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4f46e5', marginBottom: '12px' }}>
            <Clock size={20} />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Focus Time</span>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', fontWeight: 700, color: 'var(--text-main)' }}>
            {hoursDisplay} <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>hrs</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {totalMins} total minutes logged
          </p>
        </div>

        {/* Sessions Count */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', marginBottom: '12px' }}>
            <CheckCircle2 size={20} />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>Focus Sessions</span>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', fontWeight: 700, color: 'var(--text-main)' }}>
            {userSessions.length}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Completed deep focus sprints
          </p>
        </div>

        {/* Reassurance Card */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--nice-color)', marginBottom: '12px' }}>
            <Award size={20} />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>Peace of Mind</span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.4 }}>
            Progress counts regardless of output size.
          </div>
          <p style={{ fontSize: '12px', color: 'var(--nice-color)', fontWeight: 600, marginTop: '6px' }}>
            Zero pressure. Every minute matters.
          </p>
        </div>
      </div>

      {/* Priority Time Breakdown */}
      <div className="analytics-panel" style={{
        backgroundColor: 'var(--bg-main)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '32px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
          Time Spent by Priority Tier
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[CATEGORIES.MUST, CATEGORIES.SHOULD, CATEGORIES.NICE].map(cat => {
            const config = CATEGORY_CONFIG[cat];
            const secSpent = categoryTime[cat] || 0;
            const pct = totalSeconds > 0 ? Math.round((secSpent / totalSeconds) * 100) : 0;

            return (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {formatSeconds(secSpent)}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {pct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{
                  height: '8px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--bg-subtle)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    backgroundColor: config.color,
                    borderRadius: '999px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Sessions History */}
      <div className="analytics-panel" style={{
        backgroundColor: 'var(--bg-main)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
          Recent Focus Sessions Log
        </h3>

        {userSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
            No sessions logged yet. Start a Focus session from your Task Board!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {userSessions.map(sess => {
              const cfg = CATEGORY_CONFIG[sess.category] || CATEGORY_CONFIG[CATEGORIES.MUST];
              const dateStr = new Date(sess.endedAt || sess.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  className="analytics-session"
                  key={sess.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: cfg.color,
                      backgroundColor: cfg.bg,
                      border: `1px solid ${cfg.border}`
                    }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {sess.taskTitle}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {dateStr}
                    </span>
                    <span style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#4f46e5',
                      backgroundColor: '#eef2ff',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid #c7d2fe'
                    }}>
                      {formatSeconds(sess.durationSeconds)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
