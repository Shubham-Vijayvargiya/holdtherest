import React, { useState } from 'react';
import { CATEGORIES, CATEGORY_CONFIG } from '../types';
import { Plus, Users, Lock, Check } from 'lucide-react';

export function BrainDumpInput({ onAddTask }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES.MUST);
  const [isShared, setIsShared] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      category,
      isShared
    });

    setTitle('');
    setFeedbackMsg('Captured cleanly. Your mind is free to focus.');
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  return (
    <div className="brain-dump" style={{
      backgroundColor: 'var(--bg-main)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-light)',
      padding: '24px',
      boxShadow: 'var(--shadow-md)',
      marginBottom: '32px'
    }}>
      <div className="brain-dump__intro" style={{ marginBottom: '14px' }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '4px'
        }}>
          Frictionless Brain Dump
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Dump your thoughts quickly. Organize into priorities and choose what to share with your partner.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="brain-dump__capture" style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's competing for your attention? Dump it here..."
            className="brain-dump__input"
            style={{
              flex: 1,
              minWidth: '260px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-strong)',
              backgroundColor: 'var(--bg-subtle)',
              fontSize: '15px',
              color: 'var(--text-main)',
              outline: 'none',
              transition: 'border-color 0.15s ease, background 0.15s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
          />

          <button
            className="brain-dump__submit"
            type="submit"
            disabled={!title.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 24px',
              height: '50px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: title.trim() ? 'var(--accent-primary)' : 'var(--bg-hover)',
              color: title.trim() ? '#ffffff' : 'var(--text-light)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: title.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={18} />
            <span>Dump Thought</span>
          </button>
        </div>

        {/* Categories & Sharing Options */}
        <div className="brain-dump__options" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '8px',
          borderTop: '1px dashed var(--border-light)'
        }}>
          {/* Priority Picker */}
          <div className="brain-dump__priorities" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Priority:</span>
            {[CATEGORIES.MUST, CATEGORIES.SHOULD, CATEGORIES.NICE].map(cat => {
              const cfg = CATEGORY_CONFIG[cat];
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: cfg.color,
                    backgroundColor: isSelected ? cfg.bg : 'var(--bg-subtle)',
                    border: `1px solid ${isSelected ? cfg.border : 'transparent'}`,
                    opacity: isSelected ? 1 : 0.7,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Privacy / Share Toggle */}
          <div className="brain-dump__privacy" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsShared(!isShared)}
              title={isShared ? "Visible to both you and your partner" : "Only visible to you"}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 600,
                color: isShared ? 'var(--shared-color)' : 'var(--text-muted)',
                backgroundColor: isShared ? 'var(--shared-bg)' : 'var(--bg-subtle)',
                border: `1px solid ${isShared ? 'var(--shared-border)' : 'var(--border-light)'}`,
                transition: 'all 0.15s ease'
              }}
            >
              {isShared ? <Users size={14} /> : <Lock size={14} />}
              <span>{isShared ? 'Shared with Partner' : 'Private to Me'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation feedback */}
      {feedbackMsg && (
        <div style={{
          marginTop: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--nice-color)',
          fontSize: '12.5px',
          fontWeight: 600
        }}>
          <Check size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}
    </div>
  );
}
