import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test';
import { ConfirmDialog } from './index';

describe('ConfirmDialog', () => {
  it('will not confirm without a required comment, then passes the comment on', async () => {
    const onConfirm = vi.fn();
    renderWithProviders(
      <ConfirmDialog open title="Reject this request?" comment="required" commentLabel="Reason" confirmLabel="Reject" danger onConfirm={onConfirm} onClose={vi.fn()} />,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Reject' }));
    expect(screen.getByText('Reason is required.')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    await userEvent.type(screen.getByRole('textbox', { name: /Reason/ }), '  Wrong template  ');
    await userEvent.click(screen.getByRole('button', { name: 'Reject' }));
    expect(onConfirm).toHaveBeenCalledWith('Wrong template');
  });
});
