import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorState } from './index';

describe('ErrorState', () => {
  it('renders error title and message', () => {
    render(<ErrorState title="Failed" message="Could not fetch data" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Could not fetch data')).toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);

    const retryBtn = screen.getByRole('button', { name: 'Try again' });
    await userEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalled();
  });
});
