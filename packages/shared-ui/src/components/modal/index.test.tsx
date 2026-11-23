import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './index';

describe('Modal', () => {
  it('renders title and children when open', () => {
    render(
      <Modal open title="Dialog Title" onClose={vi.fn()}>
        <div>Modal Body Content</div>
      </Modal>,
    );

    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Modal Body Content')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Dialog Title" onClose={onClose}>
        <div>Modal Content</div>
      </Modal>,
    );

    const closeBtn = screen.getByRole('button', { name: 'Close' });
    await userEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders actions and handles submit when onSubmit provided', async () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <Modal
        open
        title="Form Modal"
        onClose={vi.fn()}
        onSubmit={onSubmit}
        actions={<button type="submit">Save</button>}
      >
        <input placeholder="Name" />
      </Modal>,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('does not allow closing when busy is true', () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Busy Modal" onClose={onClose} busy>
        <div>Saving...</div>
      </Modal>,
    );

    const closeBtn = screen.getByRole('button', { name: 'Close' });
    expect(closeBtn).toBeDisabled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
