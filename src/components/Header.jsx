import React, { useState } from 'react';
import { CheckCircle2, Clock, Users, Inbox, Heart, LogOut, Menu, Moon, Sun, UserRound } from 'lucide-react';

const navItems = [
  { id: 'planner', label: 'Tasks', icon: CheckCircle2 },
  { id: 'shared', label: 'Shared', icon: Users },
  { id: 'analytics', label: 'History', icon: Clock },
  { id: 'members', label: 'People', icon: UserRound }
];

export function Header({ profile, onLogout, currentView, onNavigate, parkedCount, sharedCount, darkMode, themeSaving, onToggleTheme }) {
  const [showMore, setShowMore] = useState(false);
  const navigate = (view) => {
    setShowMore(false);
    onNavigate(view);
  };

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <button className="app-header__brand" onClick={() => navigate('planner')}>
          <span className="brand-mark"><Heart size={20} /></span>
          <span>
            <strong>Hold the Rest</strong>
            <small>Welcome back, {profile?.display_name || 'friend'}</small>
          </span>
        </button>

        <nav className="app-header__nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const count = item.id === 'shared' ? sharedCount : 0;
            return (
              <button
                className="app-header__nav-item"
                data-active={currentView === item.id}
                aria-current={currentView === item.id ? 'page' : undefined}
                key={item.id}
                onClick={() => navigate(item.id)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {count > 0 && <b>{count}</b>}
              </button>
            );
          })}
          <button
            className="app-header__nav-item desktop-nav-only"
            data-active={currentView === 'parking'}
            aria-current={currentView === 'parking' ? 'page' : undefined}
            onClick={() => navigate('parking')}
          >
            <Inbox size={17} />
            <span>Parking</span>
            {parkedCount > 0 && <b>{parkedCount}</b>}
          </button>
          <button
            className="app-header__nav-item mobile-more-toggle"
            data-active={showMore || currentView === 'parking'}
            aria-expanded={showMore}
            onClick={() => setShowMore((value) => !value)}
          >
            <Menu size={17} />
            <span>More</span>
            {parkedCount > 0 && <b>{parkedCount}</b>}
          </button>
        </nav>

        <div className="app-header__account">
          <button className="icon-button" onClick={onToggleTheme} disabled={themeSaving} aria-busy={themeSaving} aria-label={darkMode ? 'Use light mode' : 'Use dark mode'}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="app-header__logout" onClick={onLogout}>
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>

        {showMore && (
          <div className="mobile-more-menu" role="menu">
            <button role="menuitem" onClick={() => navigate('parking')}><Inbox size={17} /> Parking lot {parkedCount > 0 && <b>{parkedCount}</b>}</button>
            <button role="menuitem" onClick={() => { onToggleTheme(); setShowMore(false); }}>{darkMode ? <Sun size={17} /> : <Moon size={17} />}{darkMode ? 'Light mode' : 'Dark mode'}</button>
            <button role="menuitem" onClick={onLogout}><LogOut size={17} /> Log out</button>
          </div>
        )}
      </div>
    </header>
  );
}
