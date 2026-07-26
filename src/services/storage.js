import { CATEGORIES } from '../types';

const TASKS_KEY = 'minddump_tasks_v2';
const SESSIONS_KEY = 'minddump_focus_sessions_v2';
const PARKING_KEY = 'minddump_parking_lot_v2';
const ACTIVE_USER_KEY = 'minddump_active_user_email';
const PARTNER_EMAIL_PREFIX = 'minddump_partner_email:';
const ACTIVE_FOCUS_PREFIX = 'minddump_active_focus:';

const normalizeEmail = (value = '') => value.trim().toLowerCase();
const makeId = (prefix) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

const readArray = (key, fallback = []) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
};

const writeArray = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const INITIAL_TASKS = [
  {
    id: 'task-demo-1',
    userId: 'demo:shubh@gmail.com',
    userEmail: 'shubh@gmail.com',
    title: 'Review project outline and dump all ideas',
    notes: 'Get everything out of my head onto paper.',
    category: CATEGORIES.MUST,
    status: 'backlog',
    isShared: false,
    sharedWithEmail: '',
    createdAt: Date.now() - 14_400_000,
    totalTimeSpentSeconds: 1200
  },
  {
    id: 'task-demo-2',
    userId: 'demo:shubh@gmail.com',
    userEmail: 'shubh@gmail.com',
    title: 'Order weekly groceries and household essentials',
    notes: 'Milk, fruits, coffee, paper towels',
    category: CATEGORIES.SHOULD,
    status: 'backlog',
    isShared: true,
    sharedWithEmail: 'wife@gmail.com',
    createdAt: Date.now() - 7_200_000,
    totalTimeSpentSeconds: 450
  }
];

export const storage = {
  getActiveUserEmail() {
    return normalizeEmail(localStorage.getItem(ACTIVE_USER_KEY) || 'shubh@gmail.com');
  },

  setActiveUserEmail(email) {
    localStorage.setItem(ACTIVE_USER_KEY, normalizeEmail(email));
  },

  getPartnerEmail(userEmail = this.getActiveUserEmail()) {
    return normalizeEmail(localStorage.getItem(PARTNER_EMAIL_PREFIX + normalizeEmail(userEmail)) || 'wife@gmail.com');
  },

  setPartnerEmail(email, userEmail = this.getActiveUserEmail()) {
    localStorage.setItem(PARTNER_EMAIL_PREFIX + normalizeEmail(userEmail), normalizeEmail(email));
  },

  getCurrentUser() {
    const email = this.getActiveUserEmail();
    const name = email.split('@')[0] || 'user';
    return {
      id: `demo:${email}`,
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      avatar: '👤',
      partnerEmail: this.getPartnerEmail(email)
    };
  },

  getTasks() {
    const tasks = readArray(TASKS_KEY, null);
    if (tasks) return tasks;
    const initialTasks = INITIAL_TASKS.map((task) => ({ ...task }));
    writeArray(TASKS_KEY, initialTasks);
    return initialTasks;
  },

  getUserVisibleTasks(userEmail = this.getActiveUserEmail()) {
    const actor = normalizeEmail(userEmail);
    return this.getTasks().filter(
      (task) => normalizeEmail(task.userEmail) === actor ||
        (task.isShared && normalizeEmail(task.sharedWithEmail) === actor)
    );
  },

  getSharedTasks(userEmail = this.getActiveUserEmail()) {
    const actor = normalizeEmail(userEmail);
    return this.getTasks().filter(
      (task) => task.isShared &&
        (normalizeEmail(task.userEmail) === actor || normalizeEmail(task.sharedWithEmail) === actor)
    );
  },

  saveTasks(tasks) {
    writeArray(TASKS_KEY, tasks);
  },

  addTask(taskData) {
    const tasks = this.getTasks();
    const userEmail = this.getActiveUserEmail();
    const newTask = {
      id: makeId('task'),
      userId: `demo:${userEmail}`,
      userEmail,
      title: String(taskData.title || '').trim(),
      notes: String(taskData.notes || '').trim(),
      category: taskData.category || CATEGORIES.MUST,
      status: 'backlog',
      isShared: Boolean(taskData.isShared),
      sharedWithEmail: taskData.isShared
        ? normalizeEmail(taskData.sharedWithEmail || this.getPartnerEmail(userEmail))
        : '',
      createdAt: Date.now(),
      completedAt: null,
      totalTimeSpentSeconds: 0
    };
    if (!newTask.title) throw new Error('A task title is required.');
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    return newTask;
  },

  updateTask(taskId, updates) {
    const tasks = this.getTasks();
    const task = tasks.find((candidate) => candidate.id === taskId);
    if (!task || normalizeEmail(task.userEmail) !== this.getActiveUserEmail()) return null;
    Object.assign(task, updates, { id: task.id, userEmail: task.userEmail, userId: task.userId });
    this.saveTasks(tasks);
    return task;
  },

  deleteTask(taskId) {
    const actor = this.getActiveUserEmail();
    const tasks = this.getTasks();
    const task = tasks.find((candidate) => candidate.id === taskId);
    if (!task || normalizeEmail(task.userEmail) !== actor) return false;
    this.saveTasks(tasks.filter((candidate) => candidate.id !== taskId));
    return true;
  },

  toggleTaskComplete(taskId) {
    const actor = this.getActiveUserEmail();
    const tasks = this.getTasks();
    const task = tasks.find((candidate) => candidate.id === taskId);
    const canComplete = task && (
      normalizeEmail(task.userEmail) === actor ||
      (task.isShared && normalizeEmail(task.sharedWithEmail) === actor)
    );
    if (!canComplete) return null;
    const isCompleted = task.status === 'completed';
    task.status = isCompleted ? 'backlog' : 'completed';
    task.completedAt = isCompleted ? null : Date.now();
    this.saveTasks(tasks);
    return task;
  },

  toggleTaskShared(taskId, targetEmail = '') {
    const actor = this.getActiveUserEmail();
    const tasks = this.getTasks();
    const task = tasks.find((candidate) => candidate.id === taskId);
    if (!task || normalizeEmail(task.userEmail) !== actor) return null;
    task.isShared = !task.isShared;
    task.sharedWithEmail = task.isShared
      ? normalizeEmail(targetEmail || this.getPartnerEmail(actor))
      : '';
    this.saveTasks(tasks);
    return task;
  },

  getSessions() {
    return readArray(SESSIONS_KEY);
  },

  saveSessions(sessions) {
    writeArray(SESSIONS_KEY, sessions);
  },

  logFocusSession({ taskId, taskTitle, category, durationSeconds }) {
    const duration = Math.max(0, Math.round(Number(durationSeconds) || 0));
    if (!duration) return null;
    const userEmail = this.getActiveUserEmail();
    const sessions = this.getSessions();
    const endedAt = Date.now();
    const newSession = {
      id: makeId('session'),
      userId: `demo:${userEmail}`,
      userEmail,
      taskId,
      taskTitle,
      category,
      startedAt: endedAt - duration * 1000,
      endedAt,
      durationSeconds: duration
    };
    sessions.unshift(newSession);
    this.saveSessions(sessions);

    const tasks = this.getTasks();
    const task = tasks.find((candidate) => candidate.id === taskId);
    if (task && (
      normalizeEmail(task.userEmail) === userEmail ||
      normalizeEmail(task.sharedWithEmail) === userEmail
    )) {
      task.totalTimeSpentSeconds = (task.totalTimeSpentSeconds || 0) + duration;
      this.saveTasks(tasks);
    }
    return newSession;
  },

  getParkedThoughts() {
    return readArray(PARKING_KEY);
  },

  saveParkedThoughts(items) {
    writeArray(PARKING_KEY, items);
  },

  addParkedThought(text) {
    const value = String(text || '').trim();
    if (!value) return null;
    const userEmail = this.getActiveUserEmail();
    const items = this.getParkedThoughts();
    const item = {
      id: makeId('parked'),
      userId: `demo:${userEmail}`,
      userEmail,
      text: value,
      createdAt: Date.now(),
      status: 'parked'
    };
    items.unshift(item);
    this.saveParkedThoughts(items);
    return item;
  },

  dismissParkedThought(id) {
    const actor = this.getActiveUserEmail();
    const items = this.getParkedThoughts();
    const item = items.find((candidate) => candidate.id === id);
    if (!item || normalizeEmail(item.userEmail) !== actor) return false;
    this.saveParkedThoughts(items.filter((candidate) => candidate.id !== id));
    return true;
  },

  convertParkedToTask(id, category = CATEGORIES.MUST) {
    const actor = this.getActiveUserEmail();
    const item = this.getParkedThoughts().find((candidate) => candidate.id === id);
    if (!item || normalizeEmail(item.userEmail) !== actor) return null;
    const task = this.addTask({ title: item.text, category, isShared: false });
    this.dismissParkedThought(id);
    return task;
  },

  getActiveFocusTaskId(userEmail = this.getActiveUserEmail()) {
    return localStorage.getItem(ACTIVE_FOCUS_PREFIX + normalizeEmail(userEmail));
  },

  setActiveFocusTaskId(taskId, userEmail = this.getActiveUserEmail()) {
    const key = ACTIVE_FOCUS_PREFIX + normalizeEmail(userEmail);
    if (taskId) localStorage.setItem(key, taskId);
    else localStorage.removeItem(key);
  }
};
