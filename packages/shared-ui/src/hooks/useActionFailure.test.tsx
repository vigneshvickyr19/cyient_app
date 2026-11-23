import { ApiError } from '@cyient/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { toastMeta } from '../notifications/MutationToasts';
import { renderWithProviders } from '../test';
import { useActionFailure } from './useActionFailure';

/** A record and a change to it that fails with `error`, handled the way the apps handle it. */
function Record({ error, onConflict, read }: { error: unknown; onConflict: () => void; read: () => string }) {
  const record = useQuery({ queryKey: ['test', 'record', 'abc'], queryFn: read });
  const failed = useActionFailure(['test', 'record', 'abc'], { onConflict });
  const save = useMutation({
    // The second test fails with no error object at all, which is the case a fallback text is for
    mutationFn: () => Promise.reject(error as Error),
    meta: toastMeta({ error: 'The change could not be saved.' }),
    onError: failed,
  });
  return (
    <>
      <p>{record.data}</p>
      <button
        type="button"
        onClick={() => {
          save.mutate();
        }}
      >
        Save
      </button>
    </>
  );
}

describe('useActionFailure', () => {
  it('after a conflict reads the record again and closes the dialog, while the toast says why', async () => {
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

  it('leaves any other error to the toast, with the mutation\'s text when the error has no message', async () => {
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
