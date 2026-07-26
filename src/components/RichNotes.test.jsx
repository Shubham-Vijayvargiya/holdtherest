import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { RichNotes } from './RichNotes';

describe('RichNotes', () => {
  it('renders readable headings, emphasis, bullets, and checklists', () => {
    render(
      <RichNotes
        value={'## Next steps\nRemember **the context**\n- First item\n- [ ] Follow up\n- [x] Finished'}
      />
    );

    expect(screen.getByRole('heading', { name: 'Next steps' })).toBeInTheDocument();
    expect(screen.getByText('the context').tagName).toBe('STRONG');
    expect(screen.getByText(/First item/)).toBeInTheDocument();
    expect(screen.getByText(/Follow up/)).toBeInTheDocument();
    expect(screen.getByText(/Finished/).classList.contains('rich-notes__check--done')).toBe(true);
  });

  it('shows a useful empty state', () => {
    render(<RichNotes value="" />);
    expect(screen.getByText(/No notes yet/)).toBeInTheDocument();
  });
});
