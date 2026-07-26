import React from 'react';
import { CheckCircle2, Clock, Users, Inbox, Heart, LogOut, Moon, Sun, UserRound } from 'lucide-react';

const navItems = [
  { id: 'planner', label: 'My Tasks', icon: CheckCircle2 },
  { id: 'shared', label: 'Shared', icon: Users },
  { id: 'analytics', label: 'History', icon: Clock },
  { id: 'parking', label: 'Parking', icon: Inbox },
  { id: 'members', label: 'People', icon: UserRound }
];

export function Header({ profile, onLogout, currentView, onNavigate, parkedCount, sharedCount, darkMode, themeSaving, onToggleTheme }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <button className="app-header__brand" onClick={() => onNavigate('planner')}>
          <span className="brand-mark"><Heart size={20} /></span>
          <span>
            <strong>Hold the Rest</strong>
            <small>Welcome back, {profile?.display_name || 'friend'}</small>
          </span>
        </button>

        <nav className="app-header__nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const count = item.id === 'shared' ? sharedCount : item.id === 'parking' ? parkedCount : 0;
            return (
              <button
                className="app-header__nav-item"
                data-active={currentView === item.id}
                key={item.id}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {count > 0 && <b>{count}</b>}
              </button>
            );
          })}
        </nav>

        <div className="app-header__account">
          <button
            className="icon-button"
            onClick={onToggleTheme}
            disabled={themeSaving}
            aria-busy={themeSaving}
            aria-label={darkMode ? 'Use light mode' : 'Use dark mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="app-header__logout" onClick={onLogout}>
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
