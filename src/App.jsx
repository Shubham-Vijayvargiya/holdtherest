import React, { useState, useEffect, useCallback } from 'react';
import { storage } from './services/storage';
import { authService, isSupabaseConfigured } from './services/supabase';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { ConfirmModal } from './components/ConfirmModal';
import { BrainDumpInput } from './components/BrainDumpInput';
import { TaskBoard } from './components/TaskBoard';
import { FocusMode } from './components/FocusMode';
import { AnalyticsView } from './components/AnalyticsView';
import { SharedView } from './components/SharedView';
import { ParkingLotDrawer } from './components/ParkingLotDrawer';

export function App() {
  const [isCheckingSession, setIsCheckingSession] = useState(isSupabaseConfigured);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !isSupabaseConfigured && localStorage.getItem('minddump_demo_authenticated') === 'true';
  });

  const [activeUserEmail, setActiveUserEmail] = useState(() => storage.getActiveUserEmail());
  const [partnerEmail, setPartnerEmail] = useState(() => storage.getPartnerEmail());
  const [currentView, setCurrentView] = useState('planner');
  const [activeFocusTask, setActiveFocusTask] = useState(null);

  // Double-Check Confirmation State
  const [confirmTask, setConfirmTask] = useState(null);

  // Core Data States
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [parkedItems, setParkedItems] = useState([]);

  // Refresh data on mount or user switch
  const refreshData = useCallback(() => {
    if (isAuthenticated) {
      setTasks(storage.getTasks());
      setSessions(storage.getSessions());
      setParkedItems(storage.getParkedThoughts());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let active = true;
    authService.getSession()
      .then((session) => {
        if (!active) return;
        if (session?.user?.email) {
          storage.setActiveUserEmail(session.user.email);
          setActiveUserEmail(session.user.email);
          setIsAuthenticated(true);
        }
      })
      .catch((error) => console.error('Unable to restore session:', error))
      .finally(() => active && setIsCheckingSession(false));

    const unsubscribe = authService.onAuthStateChange((session) => {
      if (session?.user?.email) {
        storage.setActiveUserEmail(session.user.email);
        setActiveUserEmail(session.user.email);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsCheckingSession(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    refreshData();
  }, [activeUserEmail, partnerEmail, isAuthenticated, refreshData]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const focusTaskId = storage.getActiveFocusTaskId(activeUserEmail);
    if (!focusTaskId) return;
    const task = storage.getUserVisibleTasks(activeUserEmail)
      .find((candidate) => candidate.id === focusTaskId && candidate.status !== 'completed');
    if (task) {
      setActiveFocusTask(task);
      setCurrentView('focus');
    } else {
      storage.setActiveFocusTaskId(null, activeUserEmail);
    }
  }, [activeUserEmail, isAuthenticated]);

  const activeUser = storage.getCurrentUser();

  const handleLogin = async (userEmail = 'shubh@gmail.com') => {
    if (isSupabaseConfigured) {
      await authService.signInWithGoogle();
      return;
    }
    storage.setActiveUserEmail(userEmail);
    setActiveUserEmail(userEmail);
    localStorage.setItem('minddump_demo_authenticated', 'true');
    setIsAuthenticated(true);
    setCurrentView('planner');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) await authService.signOut();
    localStorage.removeItem('minddump_demo_authenticated');
    setIsAuthenticated(false);
    setActiveFocusTask(null);
    setCurrentView('planner');
  };

  const handleUpdatePartnerEmail = (newPartnerEmail) => {
    storage.setPartnerEmail(newPartnerEmail);
    setPartnerEmail(newPartnerEmail);
    refreshData();
  };

  // Task Actions
  const handleAddTask = (taskData) => {
    storage.addTask(taskData);
    refreshData();
  };

  // Trigger Confirmation Modal before completing task
  const handleRequestComplete = (taskId) => {
    const allTasks = storage.getTasks();
    const target = allTasks.find(t => t.id === taskId);
    if (target) {
      if (target.status === 'completed') {
        storage.toggleTaskComplete(taskId);
        refreshData();
      } else {
        setConfirmTask(target);
      }
    }
  };

  const handleConfirmComplete = () => {
    if (confirmTask) {
      storage.toggleTaskComplete(confirmTask.id);
      refreshData();
      setConfirmTask(null);
    }
  };

  const handleToggleShared = (taskId) => {
    storage.toggleTaskShared(taskId);
    refreshData();
  };

  const handleDeleteTask = (taskId) => {
    storage.deleteTask(taskId);
    refreshData();
  };

  // Focus Mode Actions
  const handleStartFocus = (task) => {
    storage.setActiveFocusTaskId(task.id, activeUserEmail);
    setActiveFocusTask(task);
    setCurrentView('focus');
  };

  const handleCompleteFocusTask = (taskId) => {
    storage.toggleTaskComplete(taskId);
    storage.setActiveFocusTaskId(null, activeUserEmail);
    refreshData();
    setCurrentView('planner');
    setActiveFocusTask(null);
  };

  const handleExitFocus = () => {
    storage.setActiveFocusTaskId(null, activeUserEmail);
    refreshData();
    setCurrentView('planner');
    setActiveFocusTask(null);
  };

  const handleLogFocusSession = (sessionData) => {
    storage.logFocusSession(sessionData);
    refreshData();
  };

  // Parking Lot Actions
  const handleParkThought = (text) => {
    storage.addParkedThought(text);
    refreshData();
  };

  const handleConvertParked = (id, category) => {
    storage.convertParkedToTask(id, category);
    refreshData();
  };

  const handleDismissParked = (id) => {
    storage.dismissParkedThought(id);
    refreshData();
  };

  // If unauthenticated, force login landing gate!
  if (isCheckingSession) {
    return <div className="app-loading" role="status">Restoring your session…</div>;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} isCloudConfigured={isSupabaseConfigured} />;
  }

  // Filter tasks visible to active user email
  const userTasks = storage.getUserVisibleTasks(activeUserEmail);
  const sharedTasks = storage.getSharedTasks(activeUserEmail);
  const userParkedCount = parkedItems.filter(p => p.userEmail === activeUserEmail).length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* Header with Log Out button */}
      {currentView !== 'focus' && (
        <Header
          activeUser={activeUser}
          onLogout={handleLogout}
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          parkedCount={userParkedCount}
          sharedCount={sharedTasks.length}
          onUpdatePartnerEmail={handleUpdatePartnerEmail}
        />
      )}

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: currentView === 'focus' ? '0' : '32px 24px' }}>
        {currentView === 'planner' && (
          <div className="animate-fade-in">
            <BrainDumpInput
              onAddTask={handleAddTask}
              activeUser={activeUser}
            />

            <TaskBoard
              tasks={userTasks}
              activeUser={activeUser}
              onToggleComplete={handleRequestComplete}
              onToggleShared={handleToggleShared}
              onDeleteTask={handleDeleteTask}
              onStartFocus={handleStartFocus}
            />
          </div>
        )}

        {currentView === 'shared' && (
          <div className="animate-fade-in">
            <SharedView
              sharedTasks={sharedTasks}
              activeUser={activeUser}
              onToggleComplete={handleRequestComplete}
              onToggleShared={handleToggleShared}
              onStartFocus={handleStartFocus}
            />
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="animate-fade-in">
            <AnalyticsView
              sessions={sessions}
              tasks={tasks}
              activeUser={activeUser}
            />
          </div>
        )}

        {currentView === 'parking' && (
          <div className="animate-fade-in">
            <ParkingLotDrawer
              parkedItems={parkedItems}
              activeUser={activeUser}
              onConvert={handleConvertParked}
              onDismiss={handleDismissParked}
            />
          </div>
        )}

        {currentView === 'focus' && activeFocusTask && (
          <div className="animate-fade-in">
            <FocusMode
              task={activeFocusTask}
              onCompleteTask={handleCompleteFocusTask}
              onExitFocus={handleExitFocus}
              onParkThought={handleParkThought}
              onLogSession={handleLogFocusSession}
            />
          </div>
        )}
      </main>

      {/* Double-Check Completion Modal */}
      <ConfirmModal
        isOpen={!!confirmTask}
        title="Double Check: Complete Task?"
        message={`Are you sure you want to mark "${confirmTask?.title}" as complete? It will move to your Completed list.`}
        confirmLabel="Yes, Mark Complete"
        cancelLabel="Not Yet"
        onConfirm={handleConfirmComplete}
        onCancel={() => setConfirmTask(null)}
      />
    </div>
  );
}
