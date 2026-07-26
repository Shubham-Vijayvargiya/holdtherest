import React from 'react';
import { CATEGORIES } from '../types';
import { Inbox, Trash2 } from 'lucide-react';

export function ParkingLotDrawer({
  parkedItems,
  activeUser,
  onConvert,
  onDismiss
}) {
  const userItems = parkedItems.filter(p => p.userId === activeUser.id);

  return (
    <div className="parking-view" style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f766e', marginBottom: '6px' }}>
          <Inbox size={22} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>
            Parking Lot
          </h2>
        </div>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
          Stray thoughts captured during focus sessions. Your mind dumped them safely here so you could keep working uninterrupted.
        </p>
      </div>

      {userItems.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-main)',
          border: '1px dashed var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          <Inbox size={32} style={{ color: '#0f766e', opacity: 0.5, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            Parking Lot is empty
          </h3>
          <p style={{ fontSize: '13px' }}>
            Press <strong>Ctrl+K</strong> or <strong>Cmd+K</strong> during any focus session to park stray thoughts here instantly!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {userItems.map(item => (
            <div
              className="parking-item"
              key={item.id}
              style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div className="parking-item__content" style={{ flex: 1, minWidth: '240px' }}>
                <p style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  "{item.text}"
                </p>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Parked {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Actions */}
              <div className="parking-item__actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Convert to:</span>
                
                <button
                  onClick={() => onConvert(item.id, CATEGORIES.MUST)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: 'var(--must-color)',
                    backgroundColor: 'var(--must-bg)',
                    border: '1px solid var(--must-border)'
                  }}
                >
                  Must Do
                </button>

                <button
                  onClick={() => onConvert(item.id, CATEGORIES.SHOULD)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: 'var(--should-color)',
                    backgroundColor: 'var(--should-bg)',
                    border: '1px solid var(--should-border)'
                  }}
                >
                  Should Do
                </button>

                <button
                  onClick={() => onDismiss(item.id)}
                  title="Dismiss thought"
                  style={{
                    color: 'var(--text-light)',
                    padding: '6px',
                    borderRadius: '4px'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
