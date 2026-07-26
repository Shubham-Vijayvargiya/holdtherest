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

const mapTask = (row) => ({
  id: row.id,
  userId: row.user_id,
  userEmail: row.owner_email,
  title: row.title,
  notes: row.notes || '',
  category: row.category,
  status: row.status,
  totalTimeSpentSeconds: row.total_time_seconds || 0,
  createdAt: row.created_at,
  completedAt: row.completed_at,
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

const insertActivity = async (taskId, eventType, eventData = {}) => {
  const client = requireClient();
  const user = await requireUser();
  const actorName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const { error } = await client.from('task_activity').insert({
    task_id: taskId,
    actor_id: user.id,
    actor_name: actorName,
    event_type: eventType,
    event_data: eventData
  });
  if (error) throw error;
};

const replaceShares = async (taskId, memberEmails) => {
  const client = requireClient();
  const user = await requireUser();
  const normalized = [...new Set((memberEmails || []).map(normalizeEmail).filter(Boolean))].slice(0, 3);
  const { error: deleteError } = await client.from('task_shares').delete().eq('task_id', taskId);
  if (deleteError) throw deleteError;
  if (!normalized.length) return;
  const { error } = await client.from('task_shares').insert(
    normalized.map((email) => ({ task_id: taskId, shared_by: user.id, member_email: email }))
  );
  if (error) throw error;
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
    const [profileResult, membersResult, tasksResult, sessionsResult, parkingResult] = await Promise.all([
      client.from('profiles').select('*').single(),
      client.from('members').select('*').order('created_at'),
      client.from('tasks').select('*, task_shares(member_email)').order('created_at', { ascending: false }),
      client.from('focus_sessions').select('*').order('started_at', { ascending: false }),
      client.from('parking_items').select('*').order('created_at', { ascending: false })
    ]);
    const error = profileResult.error || membersResult.error || tasksResult.error || sessionsResult.error || parkingResult.error;
    if (error) throw error;
    return {
      profile: profileResult.data,
      members: membersResult.data,
      tasks: tasksResult.data.map(mapTask),
      sessions: sessionsResult.data.map(mapSession),
      parkedItems: parkingResult.data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        text: row.text,
        createdAt: row.created_at
      }))
    };
  },

  async updateProfile({ displayName, theme, onboardingComplete = true }) {
    const client = requireClient();
    const user = await requireUser();
    const updates = {
      updated_at: new Date().toISOString()
    };
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

  async createTask({ title, category, sharedWithEmails = [] }) {
    const client = requireClient();
    const user = await requireUser();
    const { data, error } = await client.from('tasks').insert({
      user_id: user.id,
      owner_email: normalizeEmail(user.email),
      title: String(title).trim(),
      notes: '',
      category,
      status: 'backlog'
    }).select().single();
    if (error) throw error;
    await replaceShares(data.id, sharedWithEmails);
    await insertActivity(data.id, 'created', { category });
    return data.id;
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
    const { error } = await client.from('tasks').update({
      notes: String(notes || '').slice(0, 5000),
      updated_at: new Date().toISOString()
    }).eq('id', taskId);
    if (error) throw error;
    await insertActivity(taskId, 'notes_updated');
  },

  async updateTaskShares(taskId, emails) {
    await replaceShares(taskId, emails);
    await insertActivity(taskId, 'sharing_updated', { recipients: emails });
  },

  async setTaskCompleted(task, completed) {
    const client = requireClient();
    const { error } = await client.from('tasks').update({
      status: completed ? 'completed' : 'backlog',
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }).eq('id', task.id);
    if (error) throw error;
    await insertActivity(task.id, completed ? 'completed' : 'reopened');
  },

  async deleteTask(taskId) {
    const client = requireClient();
    const { error } = await client.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
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
    const { error } = await client.from('task_comments').insert({
      task_id: taskId,
      author_id: user.id,
      author_email: normalizeEmail(user.email),
      author_name: String(authorName || user.email?.split('@')[0] || 'User').slice(0, 80),
      body: String(body).trim()
    });
    if (error) throw error;
  },

  async logFocusSession({ taskId, taskTitle, category, durationSeconds, startedAt }) {
    const client = requireClient();
    const user = await requireUser();
    const duration = Math.max(1, Math.round(durationSeconds));
    const endedAt = new Date();
    const { error } = await client.from('focus_sessions').insert({
      task_id: taskId,
      user_id: user.id,
      user_email: normalizeEmail(user.email),
      task_title: taskTitle,
      category,
      started_at: startedAt || new Date(endedAt.getTime() - duration * 1000).toISOString(),
      ended_at: endedAt.toISOString(),
      duration_seconds: duration
    });
    if (error) throw error;
  },

  async addParkingItem(text) {
    const client = requireClient();
    const user = await requireUser();
    const { error } = await client.from('parking_items').insert({
      user_id: user.id,
      text: String(text).trim()
    });
    if (error) throw error;
  },

  async removeParkingItem(id) {
    const client = requireClient();
    const { error } = await client.from('parking_items').delete().eq('id', id);
    if (error) throw error;
  }
};
