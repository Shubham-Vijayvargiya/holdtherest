import React, { useState } from 'react';
import { CheckCircle2, Clock, Users, Inbox, Heart, LogOut, Mail } from 'lucide-react';
import { storage } from '../services/storage';

export function Header({
  activeUser,
  onLogout,
  currentView,
  onNavigate,
  parkedCount,
  sharedCount,
  onUpdatePartnerEmail
}) {
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerEmailInput, setPartnerEmailInput] = useState(() => storage.getPartnerEmail());

  const handleSavePartnerEmail = (e) => {
    e.preventDefault();
    if (partnerEmailInput.trim()) {
      storage.setPartnerEmail(partnerEmailInput.trim());
      if (onUpdatePartnerEmail) onUpdatePartnerEmail(partnerEmailInput.trim());
      setShowPartnerModal(false);
    }
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border-light)',
      backgroundColor: 'var(--bg-main)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate('planner')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'var(--accent-primary-bg)',
            border: '1px solid var(--accent-primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}>
            <Heart size={20} />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-main)',
              lineHeight: 1.1
            }}>
              MindDump & Focus
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Calm Daily Planner & Time Tracker
            </p>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => onNavigate('planner')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              color: currentView === 'planner' ? 'var(--accent-primary)' : 'var(--text-muted)',
              backgroundColor: currentView === 'planner' ? 'var(--accent-primary-bg)' : 'transparent',
              border: currentView === 'planner' ? '1px solid var(--accent-primary-border)' : '1px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            <CheckCircle2 size={16} />
            <span>My Tasks</span>
          </button>

          <button
            onClick={() => onNavigate('shared')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              color: currentView === 'shared' ? 'var(--shared-color)' : 'var(--text-muted)',
              backgroundColor: currentView === 'shared' ? 'var(--shared-bg)' : 'transparent',
              border: currentView === 'shared' ? '1px solid var(--shared-border)' : '1px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={16} />
            <span>Shared Hub</span>
            {sharedCount > 0 && (
              <span style={{
                backgroundColor: 'var(--shared-color)',
                color: '#fff',
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '999px',
                fontWeight: 700
              }}>
                {sharedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('analytics')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              color: currentView === 'analytics' ? '#4f46e5' : 'var(--text-muted)',
              backgroundColor: currentView === 'analytics' ? '#eef2ff' : 'transparent',
              border: currentView === 'analytics' ? '1px solid #c7d2fe' : '1px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            <Clock size={16} />
            <span>Time Analytics</span>
          </button>

          <button
            onClick={() => onNavigate('parking')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              color: currentView === 'parking' ? '#0f766e' : 'var(--text-muted)',
              backgroundColor: currentView === 'parking' ? '#f0fdfa' : 'transparent',
              border: currentView === 'parking' ? '1px solid #99f6e4' : '1px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            <Inbox size={16} />
            <span>Parking Lot</span>
            {parkedCount > 0 && (
              <span style={{
                backgroundColor: '#0f766e',
                color: '#fff',
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '999px',
                fontWeight: 700
              }}>
                {parkedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Logged In User Gmail Profile & Logout Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowPartnerModal(true)}
            title="Set Spouse / Partner Gmail ID for task sharing"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)',
              fontSize: '12.5px',
              fontWeight: 600,
              color: 'var(--text-main)'
            }}
          >
            <Mail size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>{activeUser.email}</span>
            <span style={{ fontSize: '10px', color: 'var(--shared-color)', backgroundColor: 'var(--shared-bg)', padding: '1px 6px', borderRadius: '4px', border: '1px solid var(--shared-border)' }}>
              {activeUser.partnerEmail ? `Partner: ${activeUser.partnerEmail}` : 'Set partner'}
            </span>
          </button>

          <button
            onClick={onLogout}
            title="Sign out of account"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fff1f2',
              color: '#e11d48',
              border: '1px solid #fecdd3',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={15} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Partner Gmail ID Config Modal */}
      {showPartnerModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 400,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-main)',
            width: '100%',
            maxWidth: '440px',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              Family & Spouse Task Sharing
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              Type your spouse or family member's Gmail ID. When you toggle "Shared" on any task, it will automatically appear in their Shared Household Hub!
            </p>

            <form onSubmit={handleSavePartnerEmail}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Spouse / Partner Gmail ID:
              </label>
              <input
                type="email"
                value={partnerEmailInput}
                onChange={(e) => setPartnerEmailInput(e.target.value)}
                placeholder="e.g. spouse@gmail.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-strong)',
                  fontSize: '14px',
                  outline: 'none',
                  marginBottom: '20px'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPartnerModal(false)}
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
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  Save Partner Gmail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
