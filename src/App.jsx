import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authService, isSupabaseConfigured } from './services/supabase';
import { cloudDb } from './services/db';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { BrainDumpInput } from './components/BrainDumpInput';
import { TaskBoard } from './components/TaskBoard';
import { ProfileOnboarding } from './components/ProfileOnboarding';
import { Toast } from './components/Toast';

const FocusMode = lazy(() => import('./components/FocusMode').then((module) => ({ default: module.FocusMode })));
const AnalyticsView = lazy(() => import('./components/AnalyticsView').then((module) => ({ default: module.AnalyticsView })));
const SharedView = lazy(() => import('./components/SharedView').then((module) => ({ default: module.SharedView })));
const ParkingLotDrawer = lazy(() => import('./components/ParkingLotDrawer').then((module) => ({ default: module.ParkingLotDrawer })));
const MembersView = lazy(() => import('./components/MembersView').then((module) => ({ default: module.MembersView })));

const emptyDashboard = {
  profile: null,
  members: [],
  tasks: [],
  sessions: [],
  parkedItems: [],
  activeFocus: null
};

const ViewFallback = () => (
  <div className="view-skeleton" aria-label="Loading view">
    <span /><span /><span />
  </div>
);

export function App() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [currentView, setCurrentView] = useState('planner');
  const [activeFocusTask, setActiveFocusTask] = useState(null);
  const [taskDetail, setTaskDetail] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [appError, setAppError] = useState('');
  const [toast, setToast] = useState(null);
  const [online, setOnline] = useState(() => navigator.onLine);
  const realtimeTimer = useRef(null);
  const restoredFocus = useRef(false);
  const notifiedTasks = useRef(new Set());

  const showError = useCallback((error, retry) => {
    setToast({
      kind: 'error',
      message: error?.message || String(error) || 'That change could not be saved.',
      actionLabel: retry ? 'Retry' : undefined,
      action: retry
    });
  }, []);

  const loadDashboard = useCallback(async (authUser = user, { silent = false } = {}) => {
    if (!authUser) return;
    if (!silent) setLoadingData(true);
    setAppError('');
    try {
      await cloudDb.ensureProfile(authUser);
      const data = await cloudDb.fetchDashboard();
      setDashboard(data);
      setActiveFocusTask((current) => current
        ? data.tasks.find((task) => task.id === current.id) || null
        : current);

      if (!restoredFocus.current) {
        restoredFocus.current = true;
        if (data.activeFocus) {
          const task = data.tasks.find((candidate) => candidate.id === data.activeFocus.task_id);
          if (task) {
            setActiveFocusTask(task);
            setCurrentView('focus');
          }
        }
      }
    } catch (error) {
      const missingSchema = error?.code === 'PGRST205' || error?.message?.includes('schema cache');
      setAppError(missingSchema
        ? 'The latest secure database migration is not installed yet. Run all numbered files in supabase/migrations.'
        : error?.message || 'Unable to load your private workspace.');
    } finally {
      if (!silent) setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setCheckingSession(false);
      return undefined;
    }

    let active = true;
    authService.getSession().then((session) => {
      if (active) setUser(session?.user || null);
    }).catch((error) => setAppError(error.message)).finally(() => active && setCheckingSession(false));

    const unsubscribe = authService.onAuthStateChange((session) => {
      restoredFocus.current = false;
      setUser(session?.user || null);
      setCheckingSession(false);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) loadDashboard(user);
    else setDashboard(emptyDashboard);
  }, [user, loadDashboard]);

  useEffect(() => {
    if (!user) return undefined;
    const unsubscribe = cloudDb.subscribeToChanges(() => {
      window.clearTimeout(realtimeTimer.current);
      realtimeTimer.current = window.setTimeout(() => loadDashboard(user, { silent: true }), 600);
    });
    return () => {
      window.clearTimeout(realtimeTimer.current);
      unsubscribe();
    };
  }, [user, loadDashboard]);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      if (user) loadDashboard(user, { silent: true });
    };
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [user, loadDashboard]);

  const darkMode = dashboard.profile?.theme === 'dark';
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  useEffect(() => {
    if (!user || !('Notification' in window)) return undefined;
    const checkReminders = () => {
      if (Notification.permission !== 'granted') return;
      const now = Date.now();
      dashboard.tasks.forEach((task) => {
        if (
          task.status !== 'completed'
          && task.reminderEnabled
          && task.dueAt
          && new Date(task.dueAt).getTime() <= now
          && !notifiedTasks.current.has(task.id)
        ) {
          notifiedTasks.current.add(task.id);
          new Notification('Hold the Rest reminder', { body: task.title, tag: `task-${task.id}` });
        }
      });
    };
    checkReminders();
    const timer = window.setInterval(checkReminders, 60000);
    return () => window.clearInterval(timer);
  }, [dashboard.tasks, user]);

  useEffect(() => {
    const shortcuts = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag) || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() === 'n' && currentView === 'planner') {
        event.preventDefault();
        document.querySelector('[data-quick-task-input]')?.focus();
      }
      if (event.key === '/' && currentView === 'planner') {
        event.preventDefault();
        document.querySelector('[data-task-search]')?.focus();
      }
    };
    window.addEventListener('keydown', shortcuts);
    return () => window.removeEventListener('keydown', shortcuts);
  }, [currentView]);

  const activeUser = useMemo(() => ({
    id: user?.id,
    email: user?.email,
    name: dashboard.profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  }), [user, dashboard.profile]);
  const dismissToast = useCallback(() => setToast(null), []);

  const updateTaskLocal = useCallback((taskId, updater) => {
    setDashboard((current) => ({
      ...current,
      tasks: current.tasks.map((task) => task.id === taskId ? updater(task) : task)
    }));
    setActiveFocusTask((current) => current?.id === taskId ? updater(current) : current);
  }, []);

  const refreshTaskDetail = async (taskId) => {
    const detail = await cloudDb.fetchTaskDetail(taskId);
    setTaskDetail(detail);
  };

  const handleStartFocus = async (task) => {
    setActiveFocusTask(task);
    setCurrentView('focus');
    setTaskDetail(null);
    try {
      await refreshTaskDetail(task.id);
    } catch (error) {
      showError(error, () => refreshTaskDetail(task.id));
    }
  };

  const handleAddTask = async (input) => {
    const temporaryId = `pending-${crypto.randomUUID()}`;
    const optimisticTask = {
      id: temporaryId,
      userId: user.id,
      userEmail: user.email,
      title: input.title,
      notes: '',
      category: input.category,
      status: 'backlog',
      totalTimeSpentSeconds: 0,
      createdAt: new Date().toISOString(),
      dueAt: input.dueAt || null,
      reminderEnabled: Boolean(input.reminderEnabled),
      sharedWithEmails: input.sharedWithEmails || [],
      isShared: Boolean(input.sharedWithEmails?.length),
      pending: true
    };
    setDashboard((current) => ({ ...current, tasks: [optimisticTask, ...current.tasks] }));
    try {
      const saved = await cloudDb.createTask(input);
      setDashboard((current) => ({
        ...current,
        tasks: current.tasks.map((task) => task.id === temporaryId ? saved : task)
      }));
      setToast({ message: 'Task added.', kind: 'success' });
    } catch (error) {
      setDashboard((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== temporaryId) }));
      showError(error, () => handleAddTask(input));
      throw error;
    }
  };

  const handleMoveTask = async (task, category) => {
    if (task.category === category) return;
    updateTaskLocal(task.id, (current) => ({ ...current, category }));
    try {
      await cloudDb.moveTask(task, category);
      setToast({
        message: `Moved to ${category.replaceAll('_', ' ')}.`,
        action: () => handleMoveTask({ ...task, category }, task.category)
      });
    } catch (error) {
      updateTaskLocal(task.id, (current) => ({ ...current, category: task.category }));
      showError(error, () => handleMoveTask(task, category));
    }
  };

  const handleCompleteTask = async (task, completed = task.status !== 'completed', showUndo = true) => {
    const nextStatus = completed ? 'completed' : 'backlog';
    updateTaskLocal(task.id, (current) => ({ ...current, status: nextStatus, completedAt: completed ? new Date().toISOString() : null }));
    try {
      const completedAt = await cloudDb.setTaskCompleted(task, completed);
      updateTaskLocal(task.id, (current) => ({ ...current, completedAt }));
      if (showUndo) {
        setToast({
          message: completed ? 'Task completed.' : 'Task reopened.',
          action: () => handleCompleteTask({ ...task, status: nextStatus }, !completed, false)
        });
      }
    } catch (error) {
      updateTaskLocal(task.id, () => task);
      showError(error, () => handleCompleteTask(task, completed));
      throw error;
    }
  };

  const handleDeleteTask = async (task) => {
    setDashboard((current) => ({ ...current, tasks: current.tasks.filter((item) => item.id !== task.id) }));
    try {
      await cloudDb.softDeleteTask(task.id);
      setToast({
        message: 'Task moved out of your workspace.',
        action: async () => {
          await cloudDb.restoreTask(task.id);
          setDashboard((current) => ({ ...current, tasks: [task, ...current.tasks] }));
        }
      });
    } catch (error) {
      setDashboard((current) => ({ ...current, tasks: [task, ...current.tasks] }));
      showError(error, () => handleDeleteTask(task));
    }
  };

  const handleSaveNotes = async (taskId, notes) => {
    const previous = dashboard.tasks.find((task) => task.id === taskId)?.notes || '';
    updateTaskLocal(taskId, (task) => ({ ...task, notes }));
    try {
      await cloudDb.saveTaskNotes(taskId, notes);
    } catch (error) {
      updateTaskLocal(taskId, (task) => ({ ...task, notes: previous }));
      showError(error, () => handleSaveNotes(taskId, notes));
      throw error;
    }
  };

  const handleUpdateShares = async (taskId, emails) => {
    const previous = dashboard.tasks.find((task) => task.id === taskId)?.sharedWithEmails || [];
    updateTaskLocal(taskId, (task) => ({ ...task, sharedWithEmails: emails, isShared: emails.length > 0 }));
    try {
      await cloudDb.updateTaskShares(taskId, emails);
    } catch (error) {
      updateTaskLocal(taskId, (task) => ({ ...task, sharedWithEmails: previous, isShared: previous.length > 0 }));
      showError(error, () => handleUpdateShares(taskId, emails));
    }
  };

  const handleScheduleTask = async (task, schedule) => {
    const previous = { dueAt: task.dueAt, reminderEnabled: task.reminderEnabled };
    updateTaskLocal(task.id, (current) => ({ ...current, dueAt: schedule.dueAt, reminderEnabled: schedule.reminderEnabled }));
    try {
      await cloudDb.updateTaskSchedule(task.id, schedule);
      setToast({ message: schedule.dueAt ? 'Schedule saved.' : 'Due date removed.' });
    } catch (error) {
      updateTaskLocal(task.id, (current) => ({ ...current, ...previous }));
      showError(error, () => handleScheduleTask(task, schedule));
    }
  };

  const handleAddComment = async (taskId, body) => {
    try {
      const saved = await cloudDb.addComment(taskId, body, activeUser.name);
      setTaskDetail((current) => ({ ...current, comments: [...(current?.comments || []), saved] }));
    } catch (error) {
      showError(error, () => handleAddComment(taskId, body));
      throw error;
    }
  };

  const handleLogSession = async (session) => {
    const saved = await cloudDb.logFocusSession(session);
    setDashboard((current) => ({
      ...current,
      sessions: [saved, ...current.sessions],
      tasks: current.tasks.map((task) => task.id === saved.taskId
        ? { ...task, totalTimeSpentSeconds: task.totalTimeSpentSeconds + saved.durationSeconds }
        : task)
    }));
    setTaskDetail((current) => current ? ({ ...current, sessions: [saved, ...current.sessions] }) : current);
    return saved;
  };

  const handleToggleTheme = async () => {
    if (savingTheme || !dashboard.profile) return;
    const previousTheme = dashboard.profile.theme || 'light';
    const nextTheme = previousTheme === 'dark' ? 'light' : 'dark';
    setSavingTheme(true);
    setDashboard((current) => ({ ...current, profile: { ...current.profile, theme: nextTheme } }));
    try {
      await cloudDb.updateProfile({ theme: nextTheme, onboardingComplete: dashboard.profile.onboarding_complete });
    } catch (error) {
      setDashboard((current) => ({ ...current, profile: { ...current.profile, theme: previousTheme } }));
      showError(error, handleToggleTheme);
    } finally {
      setSavingTheme(false);
    }
  };

  const requestReminderPermission = async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    return (await Notification.requestPermission()) === 'granted';
  };

  const ownerTasks = dashboard.tasks.filter((task) => task.userId === user?.id);
  const sharedTasks = dashboard.tasks.filter((task) => task.isShared);

  if (!isSupabaseConfigured) return <div className="app-loading app-error">Authentication is not configured.</div>;
  if (checkingSession) return <div className="app-loading">Restoring your secure session…</div>;
  if (!user) return <LoginScreen onLogin={() => authService.signInWithGoogle()} />;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      {currentView !== 'focus' && (
        <Header
          profile={dashboard.profile}
          currentView={currentView}
          onNavigate={setCurrentView}
          sharedCount={sharedTasks.filter((task) => task.userId !== user.id).length}
          parkedCount={dashboard.parkedItems.length}
          darkMode={darkMode}
          themeSaving={savingTheme}
          onToggleTheme={handleToggleTheme}
          onLogout={async () => {
            await authService.signOut();
            setUser(null);
            setCurrentView('planner');
          }}
        />
      )}

      {!online && <div className="offline-banner" role="status">You’re offline. Saved cloud data remains private; changes will resume when you reconnect.</div>}
      {appError && (
        <div className="global-error" role="alert">
          <span>{appError}</span>
          <button onClick={() => loadDashboard(user)}>Retry</button>
        </div>
      )}
      {loadingData && <div className="loading-bar" aria-label="Loading" />}

      <main id="main-content" className={currentView === 'focus' ? 'app-main app-main--focus' : 'app-main'}>
        <Suspense fallback={<ViewFallback />}>
          {currentView === 'planner' && (
            <>
              <BrainDumpInput
                members={dashboard.members}
                onAddTask={handleAddTask}
                onRequestReminderPermission={requestReminderPermission}
              />
              <TaskBoard
                tasks={ownerTasks}
                members={dashboard.members}
                activeUser={activeUser}
                onToggleComplete={handleCompleteTask}
                onMoveTask={handleMoveTask}
                onDeleteTask={handleDeleteTask}
                onScheduleTask={handleScheduleTask}
                onRequestReminderPermission={requestReminderPermission}
                onStartFocus={handleStartFocus}
              />
            </>
          )}

          {currentView === 'shared' && (
            <SharedView
              sharedTasks={sharedTasks}
              activeUser={activeUser}
              onToggleComplete={(taskId) => {
                const task = dashboard.tasks.find((item) => item.id === taskId);
                if (task?.userId === user.id) handleCompleteTask(task);
              }}
              onToggleShared={() => setCurrentView('members')}
              onStartFocus={handleStartFocus}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView sessions={dashboard.sessions} tasks={dashboard.tasks} activeUser={activeUser} />
          )}

          {currentView === 'parking' && (
            <ParkingLotDrawer
              parkedItems={dashboard.parkedItems}
              activeUser={activeUser}
              onDismiss={async (id) => {
                const item = dashboard.parkedItems.find((value) => value.id === id);
                setDashboard((current) => ({ ...current, parkedItems: current.parkedItems.filter((value) => value.id !== id) }));
                try {
                  await cloudDb.removeParkingItem(id);
                } catch (error) {
                  setDashboard((current) => ({ ...current, parkedItems: item ? [item, ...current.parkedItems] : current.parkedItems }));
                  showError(error);
                }
              }}
              onConvert={async (id, category) => {
                const item = dashboard.parkedItems.find((value) => value.id === id);
                if (!item) return;
                await handleAddTask({ title: item.text, category });
                await cloudDb.removeParkingItem(id);
                setDashboard((current) => ({ ...current, parkedItems: current.parkedItems.filter((value) => value.id !== id) }));
              }}
            />
          )}

          {currentView === 'members' && (
            <MembersView
              members={dashboard.members}
              onAddMember={async (member) => {
                const saved = await cloudDb.addMember(member);
                setDashboard((current) => ({ ...current, members: [...current.members, saved] }));
              }}
              onRemoveMember={async (id) => {
                const member = dashboard.members.find((item) => item.id === id);
                setDashboard((current) => ({ ...current, members: current.members.filter((item) => item.id !== id) }));
                try {
                  await cloudDb.removeMember(id);
                  setToast({ message: 'Member removed and task access revoked.' });
                } catch (error) {
                  setDashboard((current) => ({ ...current, members: member ? [...current.members, member] : current.members }));
                  showError(error);
                }
              }}
            />
          )}

          {currentView === 'focus' && activeFocusTask && (
            <FocusMode
              task={activeFocusTask}
              detail={taskDetail}
              members={dashboard.members}
              activeUser={activeUser}
              persistedFocus={dashboard.activeFocus?.task_id === activeFocusTask.id ? dashboard.activeFocus : null}
              onExitFocus={() => {
                setActiveFocusTask(null);
                setTaskDetail(null);
                setCurrentView('planner');
              }}
              onCompleteTask={async (task) => {
                await handleCompleteTask(task, true);
                await cloudDb.clearActiveFocus();
                setDashboard((current) => ({ ...current, activeFocus: null }));
                setActiveFocusTask(null);
                setCurrentView('planner');
              }}
              onParkThought={async (text) => {
                const saved = await cloudDb.addParkingItem(text);
                setDashboard((current) => ({ ...current, parkedItems: [saved, ...current.parkedItems] }));
              }}
              onLogSession={handleLogSession}
              onSaveNotes={handleSaveNotes}
              onAddComment={handleAddComment}
              onUpdateShares={handleUpdateShares}
              onUpdateSchedule={handleScheduleTask}
              onSaveActiveFocus={async (state) => {
                const saved = await cloudDb.saveActiveFocus(state);
                setDashboard((current) => ({ ...current, activeFocus: saved }));
              }}
              onClearActiveFocus={async () => {
                await cloudDb.clearActiveFocus();
                setDashboard((current) => ({ ...current, activeFocus: null }));
              }}
            />
          )}
        </Suspense>
      </main>

      {dashboard.profile && !dashboard.profile.onboarding_complete && (
        <ProfileOnboarding
          initialName={dashboard.profile.display_name}
          onSave={async (displayName) => {
            const profile = await cloudDb.updateProfile({ displayName, onboardingComplete: true });
            setDashboard((current) => ({ ...current, profile }));
          }}
        />
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
