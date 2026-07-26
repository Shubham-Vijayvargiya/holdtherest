import { describe, expect, it } from 'vitest';
import { mapTask } from './db';

describe('cloud task mapping', () => {
  it('maps scheduling and explicit sharing without exposing database field names', () => {
    const mapped = mapTask({
      id: 'task-1',
      user_id: 'user-1',
      owner_email: 'owner@example.com',
      title: 'Secure task',
      notes: 'Private notes',
      category: 'must_do',
      status: 'backlog',
      total_time_seconds: 90,
      created_at: '2026-07-01T00:00:00.000Z',
      updated_at: '2026-07-02T00:00:00.000Z',
      due_at: '2026-07-03T00:00:00.000Z',
      reminder_enabled: true,
      deleted_at: null,
      task_shares: [{ member_email: 'partner@example.com' }]
    });

    expect(mapped.userId).toBe('user-1');
    expect(mapped.dueAt).toBe('2026-07-03T00:00:00.000Z');
    expect(mapped.reminderEnabled).toBe(true);
    expect(mapped.sharedWithEmails).toEqual(['partner@example.com']);
    expect(mapped.isShared).toBe(true);
  });
});
