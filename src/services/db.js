import { supabase } from './supabase';

const requireClient = () => {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
};

const requireUser = async () => {
  const client = requireClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw error || new Error('Authentication is required.');
  return data.user;
};

const normalizeEmail = (value = '') => value.trim().toLowerCase();

export const mapTask = (row) => ({
  id: row.id,
  userId: row.user_id,
  userEmail: row.owner_email,
  title: row.title,
  notes: row.notes || '',
  category: row.category,
  status: row.status,
  totalTimeSpentSeconds: row.total_time_seconds || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  completedAt: row.completed_at,
  dueAt: row.due_at,
  reminderEnabled: Boolean(row.reminder_enabled),
  deletedAt: row.deleted_at,
  sharedWithEmails: (row.task_shares || []).map((share) => share.member_email),
  isShared: Boolean(row.task_shares?.length)
});

const mapSession = (row) => ({
  id: row.id,
  taskId: row.task_id,
  userId: row.user_id,
  userEmail: row.user_email,
  taskTitle: row.task_title,
  category: row.category,
  startedAt: row.started_at,
  endedAt: row.ended_at,
  durationSeconds: row.duration_seconds
});

const mapParkingItem = (row) => ({
  id: row.id,
  userId: row.user_id,
  text: row.text,
  createdAt: row.created_at
});

const insertActivity = async (taskId, eventType, eventData = {}) => {
  const client = requireClient();
  const user = await requireUser();
  const actorName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const { data, error } = await client.from('task_activity').insert({
    task_id: taskId,
    actor_id: user.id,
    actor_name: actorName,
    event_type: eventType,
    event_data: eventData
  }).select().single();
  if (error) throw error;
  return data;
};

const replaceShares = async (taskId, memberEmails) => {
  const client = requireClient();
  const user = await requireUser();
  const normalized = [...new Set((memberEmails || []).map(normalizeEmail).filter(Boolean))].slice(0, 3);
  const { error: deleteError } = await client.from('task_shares').delete().eq('task_id', taskId);
  if (deleteError) throw deleteError;
  if (!normalized.length) return normalized;
  const { error } = await client.from('task_shares').insert(
    normalized.map((email) => ({ task_id: taskId, shared_by: user.id, member_email: email }))
  );
  if (error) throw error;
  return normalized;
};

export const cloudDb = {
  async ensureProfile(user) {
    const client = requireClient();
    const suggestedName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
    const { error: insertError } = await client.from('profiles').upsert(
      {
        user_id: user.id,
        email: normalizeEmail(user.email),
        display_name: suggestedName,
        onboarding_complete: false
      },
      { onConflict: 'user_id', ignoreDuplicates: true }
    );
    if (insertError) throw insertError;
    const { data, error } = await client.from('profiles').select('*').eq('user_id', user.id).single();
    if (error) throw error;
    return data;
  },

  async fetchDashboard() {
    const client = requireClient();
    await requireUser();
    const [profileResult, membersResult, tasksResult, sessionsResult, parkingResult, activeFocusResult] = await Promise.all([
      client.from('profiles').select('*').single(),
      client.from('members').select('*').order('created_at'),
      client.from('tasks').select('*, task_shares(member_email)').is('deleted_at', null).order('created_at', { ascending: false }),
      client.from('focus_sessions').select('*').order('started_at', { ascending: false }).limit(250),
      client.from('parking_items').select('*').order('created_at', { ascending: false }),
      client.from('active_focus_sessions').select('*').maybeSingle()
    ]);
    const error = profileResult.error || membersResult.error || tasksResult.error || sessionsResult.error || parkingResult.error || activeFocusResult.error;
    if (error) throw error;
    return {
      profile: profileResult.data,
      members: membersResult.data,
      tasks: tasksResult.data.map(mapTask),
      sessions: sessionsResult.data.map(mapSession),
      parkedItems: parkingResult.data.map(mapParkingItem),
      activeFocus: activeFocusResult.data
    };
  },

  subscribeToChanges(onChange) {
    const client = requireClient();
    const channel = client.channel(`workspace-${crypto.randomUUID()}`);
    ['tasks', 'task_shares', 'task_comments', 'focus_sessions', 'active_focus_sessions', 'task_activity', 'members', 'parking_items']
      .forEach((table) => {
        channel.on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => onChange(payload));
      });
    channel.subscribe();
    return () => client.removeChannel(channel);
  },

  async updateProfile({ displayName, theme, onboardingComplete = true }) {
    const client = requireClient();
    const user = await requireUser();
    const updates = { updated_at: new Date().toISOString() };
    if (displayName !== undefined) updates.display_name = String(displayName).trim().slice(0, 80);
    if (theme !== undefined) updates.theme = theme;
    if (onboardingComplete !== undefined) updates.onboarding_complete = onboardingComplete;
    const { data, error } = await client.from('profiles').update(updates).eq('user_id', user.id).select().single();
    if (error) throw error;
    return data;
  },

  async addMember({ email, displayName }) {
    const client = requireClient();
    const user = await requireUser();
    const { data, error } = await client.from('members').insert({
      owner_id: user.id,
      member_email: normalizeEmail(email),
      display_name: String(displayName || '').trim().slice(0, 80)
    }).select().single();
    if (error) throw error;
    return data;
  },

  async removeMember(memberId) {
    const client = requireClient();
    const { error } = await client.from('members').delete().eq('id', memberId);
    if (error) throw error;
  },

  async createTask({ title, category, sharedWithEmails = [], dueAt = null, reminderEnabled = false }) {
    const client = requireClient();
    const user = await requireUser();
    const { data, error } = await client.from('tasks').insert({
      user_id: user.id,
      owner_email: normalizeEmail(user.email),
      title: String(title).trim(),
      notes: '',
      category,
      status: 'backlog',
      due_at: dueAt || null,
      reminder_enabled: Boolean(dueAt && reminderEnabled)
    }).select().single();
    if (error) throw error;
    const shares = await replaceShares(data.id, sharedWithEmails);
    await insertActivity(data.id, 'created', { category, dueAt: dueAt || null });
    return mapTask({ ...data, task_shares: shares.map((member_email) => ({ member_email })) });
  },

  async moveTask(task, category) {
    const client = requireClient();
    const { error } = await client.from('tasks').update({
      category,
      updated_at: new Date().toISOString()
    }).eq('id', task.id);
    if (error) throw error;
    await insertActivity(task.id, 'category_changed', { from: task.category, to: category });
  },

  async saveTaskNotes(taskId, notes) {
    const client = requireClient();
    const value = String(notes || '').slice(0, 5000);
    const { error } = await client.from('tasks').update({
      notes: value,
      updated_at: new Date().toISOString()
    }).eq('id', taskId);
    if (error) throw error;
    await insertActivity(taskId, 'notes_updated');
    return value;
  },

  async updateTaskShares(taskId, emails) {
    const recipients = await replaceShares(taskId, emails);
    await insertActivity(taskId, 'sharing_updated', { recipients });
    return recipients;
  },

  async updateTaskSchedule(taskId, { dueAt, reminderEnabled }) {
    const client = requireClient();
    const { error } = await client.from('tasks').update({
      due_at: dueAt || null,
      reminder_enabled: Boolean(dueAt && reminderEnabled),
      updated_at: new Date().toISOString()
    }).eq('id', taskId);
    if (error) throw error;
    await insertActivity(taskId, 'due_date_changed', { dueAt: dueAt || null, reminderEnabled: Boolean(dueAt && reminderEnabled) });
  },

  async setTaskCompleted(task, completed) {
    const client = requireClient();
    const completedAt = completed ? new Date().toISOString() : null;
    const { error } = await client.from('tasks').update({
      status: completed ? 'completed' : 'backlog',
      completed_at: completedAt,
      updated_at: new Date().toISOString()
    }).eq('id', task.id);
    if (error) throw error;
    await insertActivity(task.id, completed ? 'completed' : 'reopened');
    return completedAt;
  },

  async softDeleteTask(taskId) {
    const client = requireClient();
    await insertActivity(taskId, 'deleted');
    const deletedAt = new Date().toISOString();
    const { error } = await client.from('tasks').update({ deleted_at: deletedAt, updated_at: deletedAt }).eq('id', taskId);
    if (error) throw error;
    return deletedAt;
  },

  async restoreTask(taskId) {
    const client = requireClient();
    const { error } = await client.from('tasks').update({
      deleted_at: null,
      updated_at: new Date().toISOString()
    }).eq('id', taskId);
    if (error) throw error;
    await insertActivity(taskId, 'restored');
  },

  async fetchTaskDetail(taskId) {
    const client = requireClient();
    const [commentsResult, sessionsResult, activityResult] = await Promise.all([
      client.from('task_comments').select('*').eq('task_id', taskId).order('created_at', { ascending: true }),
      client.from('focus_sessions').select('*').eq('task_id', taskId).order('started_at', { ascending: false }),
      client.from('task_activity').select('*').eq('task_id', taskId).order('created_at', { ascending: false })
    ]);
    const error = commentsResult.error || sessionsResult.error || activityResult.error;
    if (error) throw error;
    return {
      comments: commentsResult.data,
      sessions: sessionsResult.data.map(mapSession),
      activity: activityResult.data
    };
  },

  async addComment(taskId, body, authorName) {
    const client = requireClient();
    const user = await requireUser();
    const { data, error } = await client.from('task_comments').insert({
      task_id: taskId,
      author_id: user.id,
      author_email: normalizeEmail(user.email),
      author_name: String(authorName || user.email?.split('@')[0] || 'User').slice(0, 80),
      body: String(body).trim()
    }).select().single();
    if (error) throw error;
    return data;
  },

  async logFocusSession({ taskId, taskTitle, category, durationSeconds, startedAt }) {
    const client = requireClient();
    const user = await requireUser();
    const duration = Math.max(1, Math.round(durationSeconds));
    const endedAt = new Date();
    const { data, error } = await client.from('focus_sessions').insert({
      task_id: taskId,
      user_id: user.id,
      user_email: normalizeEmail(user.email),
      task_title: taskTitle,
      category,
      started_at: startedAt || new Date(endedAt.getTime() - duration * 1000).toISOString(),
      ended_at: endedAt.toISOString(),
      duration_seconds: duration
    }).select().single();
    if (error) throw error;
    return mapSession(data);
  },

  async fetchActiveFocus() {
    const client = requireClient();
    const user = await requireUser();
    const { data, error } = await client.from('active_focus_sessions').select('*').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async saveActiveFocus({ taskId, presetSeconds, accumulatedSeconds, startedAt, isRunning }) {
    const client = requireClient();
    const user = await requireUser();
    const { data, error } = await client.from('active_focus_sessions').upsert({
      user_id: user.id,
      task_id: taskId,
      preset_seconds: presetSeconds,
      accumulated_seconds: Math.max(0, Math.round(accumulatedSeconds || 0)),
      started_at: startedAt || null,
      is_running: Boolean(isRunning),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' }).select().single();
    if (error) throw error;
    return data;
  },

  async clearActiveFocus() {
    const client = requireClient();
    const user = await requireUser();
    const { error } = await client.from('active_focus_sessions').delete().eq('user_id', user.id);
    if (error) throw error;
  },

  async addParkingItem(text) {
    const client = requireClient();
    const user = await requireUser();
    const { data, error } = await client.from('parking_items').insert({
      user_id: user.id,
      text: String(text).trim()
    }).select().single();
    if (error) throw error;
    return mapParkingItem(data);
  },

  async removeParkingItem(id) {
    const client = requireClient();
    const { error } = await client.from('parking_items').delete().eq('id', id);
    if (error) throw error;
  }
};
