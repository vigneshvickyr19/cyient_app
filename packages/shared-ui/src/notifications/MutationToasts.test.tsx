import { ApiError, type ApiResult } from '@cyient/api-client';
import { useMutation } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test';
import { toastMeta, type MutationToastMeta } from './MutationToasts';

const result = (message: string | null): ApiResult<{ name: string }> => ({ data: { name: 'Gear' }, meta: null, message, traceId: 'trace' });

/** A button that runs one change; what the change returns or fails with, and its own toast text, come from the test. */
function Change({ run, meta }: { run: () => Promise<unknown>; meta?: MutationToastMeta }) {
  const change = useMutation({ mutationFn: run, meta });
  return (
    <button type="button" onClick={() => { change.mutate(); }}>
      Save
    </button>
  );
}

const save = async () => {
  // The page appears once the signed-in person has loaded
  await userEvent.click(await screen.findByRole('button', { name: 'Save' }));
};

describe('MutationToasts', () => {
  it('says what the API says about a change that worked', async () => {
    renderWithProviders(<Change run={() => Promise.resolve(result('The role has been saved.'))} meta={toastMeta({ success: 'Saved.' })} />);

    await save();

    expect(await screen.findByText('The role has been saved.')).toBeInTheDocument();
  });

  it("uses the change's own text when the API sends none, and can build it from the result and the variables", async () => {
    renderWithProviders(
      <Change
        run={() => Promise.resolve(result(null))}
        meta={toastMeta<ApiResult<{ name: string }>>({ success: (saved) => `${saved.data.name} added.` })}
      />,
    );

    await save();

    expect(await screen.findByText('Gear added.')).toBeInTheDocument();
  });

  it('says "Done." when nothing else is said', async () => {
    renderWithProviders(<Change run={() => Promise.resolve(null)} />);

    await save();

    expect(await screen.findByText('Done.')).toBeInTheDocument();
  });

  it('stays quiet for a success when asked', async () => {
    renderWithProviders(<Change run={() => Promise.resolve(null)} meta={toastMeta({ silent: 'success' })} />);

    await save();
    // A toast, if there were one, would be up within a moment
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(screen.queryByText('Done.')).not.toBeInTheDocument();
  });

  it('shows why a change failed, and the change\'s text when the error has no message', async () => {
    renderWithProviders(<Change run={() => Promise.reject(new ApiError(422, 'Some fields are not valid.'))} meta={toastMeta({ error: 'The role could not be saved.' })} />);
    await save();
    expect(await screen.findByText('Some fields are not valid.')).toBeInTheDocument();
  });

  it('warns, not alarms, when someone else changed the record first', async () => {
    renderWithProviders(<Change run={() => Promise.reject(new ApiError(409, 'Someone else changed this request.'))} />);

    await save();

    expect(await screen.findByRole('alert')).toHaveTextContent('Someone else changed this request.');
  });
});
