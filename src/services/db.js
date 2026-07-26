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

export const cloudDb = {
  async fetchTasks() {
    const client = requireClient();
    await requireUser();
    const { data, error } = await client
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async saveTask(task) {
    const client = requireClient();
    const user = await requireUser();
    const { data, error } = await client
      .from('tasks')
      .insert({
        user_id: user.id,
        owner_email: user.email,
        shared_with_email: task.isShared ? task.sharedWithEmail : null,
        title: task.title,
        notes: task.notes || '',
        category: task.category,
        status: task.status,
        total_time_seconds: task.totalTimeSpentSeconds || 0
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTask(taskId, updates) {
    const client = requireClient();
    await requireUser();
    const { data, error } = await client
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTask(taskId) {
    const client = requireClient();
    await requireUser();
    const { error } = await client.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
  }
};
