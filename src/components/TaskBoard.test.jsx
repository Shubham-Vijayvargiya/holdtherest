import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaskBoard } from './TaskBoard';

const task = {
  id: 'task-1',
  userId: 'user-1',
  userEmail: 'owner@example.com',
  title: 'Plan product launch',
  notes: 'Coordinate the final checklist',
  category: 'must_do',
  status: 'backlog',
  totalTimeSpentSeconds: 120,
  createdAt: '2026-07-01T10:00:00.000Z',
  updatedAt: '2026-07-01T10:00:00.000Z',
  dueAt: '2026-08-01T14:00:00.000Z',
  reminderEnabled: true,
  sharedWithEmails: ['partner@example.com'],
  isShared: true
};

const renderBoard = (overrides = {}) => {
  const props = {
    tasks: [task],
    members: [],
    onToggleComplete: vi.fn(),
    onMoveTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onScheduleTask: vi.fn(),
    onStartFocus: vi.fn(),
    ...overrides
  };
  render(<TaskBoard {...props} />);
  return props;
};

describe('TaskBoard usability controls', () => {
  it('filters tasks by title and note text', () => {
    renderBoard();
    const search = screen.getByLabelText('Search tasks');

    fireEvent.change(search, { target: { value: 'checklist' } });
    expect(screen.getByText('Plan product launch')).toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'unrelated' } });
    expect(screen.queryByText('Plan product launch')).not.toBeInTheDocument();
    expect(screen.getByText(/No tasks match/)).toBeInTheDocument();
  });

  it('moves a task through the accessible priority selector', () => {
    const props = renderBoard();
    fireEvent.change(screen.getByLabelText('Move Plan product launch'), {
      target: { value: 'should_do' }
    });
    expect(props.onMoveTask).toHaveBeenCalledWith(task, 'should_do');
  });

  it('opens focus mode from the task card', () => {
    const props = renderBoard();
    fireEvent.click(screen.getByRole('button', { name: /Focus/i }));
    expect(props.onStartFocus).toHaveBeenCalledWith(task);
  });
});
