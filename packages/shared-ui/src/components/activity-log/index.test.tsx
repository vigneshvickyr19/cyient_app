import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ActivityLog } from './index';

describe('ActivityLog', () => {
  it('renders entries with user and comment', () => {
    const entries = [
      {
        at: '2026-11-01T10:00:00Z',
        user: 'Alice',
        action: 'CREATED',
        comment: 'Initial submission',
      },
    ];

    render(<ActivityLog entries={entries} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Initial submission')).toBeInTheDocument();
  });
});
