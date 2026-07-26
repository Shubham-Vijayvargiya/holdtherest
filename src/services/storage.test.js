import { beforeEach, describe, expect, it } from 'vitest';
import { storage } from './storage';

describe('local storage authorization', () => {
  beforeEach(() => {
    localStorage.clear();
    storage.setActiveUserEmail('owner@example.com');
    storage.setPartnerEmail('partner@example.com');
  });

  it('shows private tasks only to their owner', () => {
    storage.addTask({ title: 'Private thought', isShared: false });
    expect(storage.getUserVisibleTasks('owner@example.com')).toHaveLength(1);
    expect(storage.getUserVisibleTasks('partner@example.com')).toHaveLength(0);
  });

  it('shows shared tasks only to the explicit recipient', () => {
    storage.addTask({
      title: 'Shared errand',
      isShared: true,
      sharedWithEmail: 'partner@example.com'
    });
    expect(storage.getUserVisibleTasks('partner@example.com')).toHaveLength(1);
    expect(storage.getUserVisibleTasks('stranger@example.com')).toHaveLength(0);
  });

  it('prevents a recipient from deleting or changing sharing', () => {
    const task = storage.addTask({
      title: 'Shared errand',
      isShared: true,
      sharedWithEmail: 'partner@example.com'
    });
    storage.setActiveUserEmail('partner@example.com');
    expect(storage.deleteTask(task.id)).toBe(false);
    expect(storage.toggleTaskShared(task.id)).toBeNull();
    expect(storage.getTasks().find((candidate) => candidate.id === task.id)).toBeTruthy();
    expect(storage.getTasks().find((candidate) => candidate.id === task.id)?.isShared).toBe(true);
  });

  it('allows an explicit recipient to complete a shared task', () => {
    const task = storage.addTask({
      title: 'Shared errand',
      isShared: true,
      sharedWithEmail: 'partner@example.com'
    });
    storage.setActiveUserEmail('partner@example.com');
    expect(storage.toggleTaskComplete(task.id)?.status).toBe('completed');
  });
});
