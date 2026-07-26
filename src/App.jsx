import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { authService, isSupabaseConfigured } from './services/supabase';
import { cloudDb } from './services/db';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { ConfirmModal } from './components/ConfirmModal';
import { BrainDumpInput } from './components/BrainDumpInput';
import { TaskBoard } from './components/TaskBoard';
import { FocusMode } from './components/FocusMode';
import { AnalyticsView } from './components/AnalyticsView';
import { SharedView } from './components/SharedView';
import { ParkingLotDrawer } from './components/ParkingLotDrawer';
import { MembersView } from './components/MembersView';
import { ProfileOnboarding } from './components/ProfileOnboarding';

const emptyDashboard = {
  profile: null,
  members: [],
  tasks: [],
  sessions: [],
  parkedItems: []
};

export function App() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [currentView, setCurrentView] = useState('planner');
  const [activeFocusTask, setActiveFocusTask] = useState(null);
  const [taskDetail, setTaskDetail] = useState(null);
  const [confirmTask, setConfirmTask] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [appError, setAppError] = useState('');

  const loadDashboard = useCallback(async (authUser = user) => {
    if (!authUser) return;
    setLoadingData(true);
    setAppError('');
    try {
      await cloudDb.ensureProfile(authUser);
      const data = await cloudDb.fetchDashboard();
      setDashboard(data);
      setActiveFocusTask((current) => current
        ? data.tasks.find((task) => task.id === current.id) || null
        : null);
    } catch (error) {
      const missingSchema = error?.code === 'PGRST205' || error?.message?.includes('schema cache');
      setAppError(missingSchema
        ? 'The secure cloud database upgrade is not installed yet. Run supabase/migrations/001_initial_schema.sql and 002_product_upgrade.sql in the Supabase SQL Editor.'
        : error?.message || 'Unable to load your private workspace.');
    } finally {
      setLoadingData(false);
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

  const darkMode = dashboard.profile?.theme === 'dark';
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const activeUser = useMemo(() => ({
    id: user?.id,
    email: user?.email,
    name: dashboard.profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  }), [user, dashboard.profile]);

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
      setAppError(error.message);
    }
  };

  const mutate = async (operation, { refreshDetailId } = {}) => {
    setAppError('');
    try {
      await operation();
      await loadDashboard();
      if (refreshDetailId) await refreshTaskDetail(refreshDetailId);
    } catch (error) {
      setAppError(error.message || 'The change could not be saved.');
      throw error;
    }
  };

  const ownerTasks = dashboard.tasks.filter((task) => task.userId === user?.id);
  const sharedTasks = dashboard.tasks.filter((task) => task.isShared);

  if (!isSupabaseConfigured) {
    return <div className="app-loading app-error">Authentication is not configured.</div>;
  }
  if (checkingSession) return <div className="app-loading">Restoring your secure session…</div>;
  if (!user) return <LoginScreen onLogin={() => authService.signInWithGoogle()} />;

  return (
    <div className="app-shell">
      {currentView !== 'focus' && (
        <Header
          profile={dashboard.profile}
          currentView={currentView}
          onNavigate={setCurrentView}
          sharedCount={sharedTasks.filter((task) => task.userId !== user.id).length}
          parkedCount={dashboard.parkedItems.length}
          darkMode={darkMode}
          onToggleTheme={() => mutate(() => cloudDb.updateProfile({ theme: darkMode ? 'light' : 'dark', onboardingComplete: dashboard.profile?.onboarding_complete }))}
          onLogout={async () => {
            await authService.signOut();
            setUser(null);
            setCurrentView('planner');
          }}
        />
      )}

      {appError && <div className="global-error" role="alert">{appError}</div>}
      {loadingData && <div className="loading-bar" aria-label="Loading" />}

      <main className={currentView === 'focus' ? 'app-main app-main--focus' : 'app-main'}>
        {currentView === 'planner' && (
          <>
            <BrainDumpInput
              members={dashboard.members}
              onAddTask={(task) => mutate(() => cloudDb.createTask(task))}
            />
            <TaskBoard
              tasks={ownerTasks}
              activeUser={activeUser}
              onToggleComplete={(task) => task.status === 'completed'
                ? mutate(() => cloudDb.setTaskCompleted(task, false))
                : setConfirmTask(task)}
              onMoveTask={(task, category) => mutate(() => cloudDb.moveTask(task, category))}
              onDeleteTask={(taskId) => mutate(() => cloudDb.deleteTask(taskId))}
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
              if (task?.userId === user.id) setConfirmTask(task);
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
            onDismiss={(id) => mutate(() => cloudDb.removeParkingItem(id))}
            onConvert={(id, category) => {
              const item = dashboard.parkedItems.find((value) => value.id === id);
              if (!item) return;
              return mutate(async () => {
                await cloudDb.createTask({ title: item.text, category });
                await cloudDb.removeParkingItem(id);
              });
            }}
          />
        )}

        {currentView === 'members' && (
          <MembersView
            members={dashboard.members}
            onAddMember={(member) => mutate(() => cloudDb.addMember(member))}
            onRemoveMember={(id) => mutate(() => cloudDb.removeMember(id))}
          />
        )}

        {currentView === 'focus' && activeFocusTask && (
          <FocusMode
            task={activeFocusTask}
            detail={taskDetail}
            members={dashboard.members}
            activeUser={activeUser}
            onExitFocus={() => {
              setActiveFocusTask(null);
              setTaskDetail(null);
              setCurrentView('planner');
              loadDashboard();
            }}
            onCompleteTask={(task) => mutate(() => cloudDb.setTaskCompleted(task, true)).then(() => {
              setActiveFocusTask(null);
              setCurrentView('planner');
            })}
            onParkThought={(text) => mutate(() => cloudDb.addParkingItem(text))}
            onLogSession={(session) => mutate(() => cloudDb.logFocusSession(session), { refreshDetailId: activeFocusTask.id })}
            onSaveNotes={(taskId, notes) => mutate(() => cloudDb.saveTaskNotes(taskId, notes), { refreshDetailId: taskId })}
            onAddComment={(taskId, body) => mutate(() => cloudDb.addComment(taskId, body, activeUser.name), { refreshDetailId: taskId })}
            onUpdateShares={(taskId, emails) => mutate(() => cloudDb.updateTaskShares(taskId, emails), { refreshDetailId: taskId })}
          />
        )}
      </main>

      {dashboard.profile && !dashboard.profile.onboarding_complete && (
        <ProfileOnboarding
          initialName={dashboard.profile.display_name}
          onSave={(displayName) => mutate(() => cloudDb.updateProfile({ displayName, onboardingComplete: true }))}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(confirmTask)}
        title="Complete this task?"
        message={`Mark “${confirmTask?.title}” as complete? Its notes and history will stay available.`}
        confirmLabel="Mark complete"
        cancelLabel="Not yet"
        onConfirm={() => mutate(() => cloudDb.setTaskCompleted(confirmTask, true)).finally(() => setConfirmTask(null))}
        onCancel={() => setConfirmTask(null)}
      />
    </div>
  );
}
