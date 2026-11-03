import { ApiError } from '@cyient/api-client';
import { useQuery } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test';
import { useActionFailure } from './useActionFailure';

function Record({ error, onConflict, read }: { error: unknown; onConflict: () => void; read: () => string }) {
  const record = useQuery({ queryKey: ['test', 'record', 'abc'], queryFn: read });
  const failed = useActionFailure(['test', 'record', 'abc'], { onConflict, fallback: 'The change could not be saved.' });
  return (
    <>
      <p>{record.data}</p>
      <button
        type="button"
        onClick={() => {
          failed(error);
        }}
      >
        Save
      </button>
    </>
  );
}

describe('useActionFailure', () => {
  it('shows the error, and after a conflict reads the record again and closes the dialog', async () => {
    const read = vi.fn().mockReturnValueOnce('Version 1').mockReturnValue('Version 2');
    const onConflict = vi.fn();
    const conflict = new ApiError(409, 'Someone else changed this request. It has been reloaded.');
    renderWithProviders(<Record error={conflict} onConflict={onConflict} read={read} />);
    expect(await screen.findByText('Version 1')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Someone else changed this request. It has been reloaded.')).toBeInTheDocument();
    expect(await screen.findByText('Version 2')).toBeInTheDocument();
    expect(onConflict).toHaveBeenCalledTimes(1);
  });

  it('only shows any other error, with the fallback when it has no message', async () => {
    const read = vi.fn().mockReturnValue('Version 1');
    const onConflict = vi.fn();
    renderWithProviders(<Record error={null} onConflict={onConflict} read={read} />);
    await screen.findByText('Version 1');

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('The change could not be saved.')).toBeInTheDocument();
    expect(read).toHaveBeenCalledTimes(1);
    expect(onConflict).not.toHaveBeenCalled();
  });
});
