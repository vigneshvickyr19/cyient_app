import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Toast } from './Toast';
import { NotificationProvider, useNotify } from './NotificationProvider';

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders title, message, and accessibility alert role', () => {
    const handleDismiss = vi.fn();
    render(
      <Toast
        id={1}
        title="Operation Successful"
        message="Your changes were saved to the system."
        severity="success"
        onDismiss={handleDismiss}
      />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Operation Successful')).toBeInTheDocument();
    expect(screen.getByText('Your changes were saved to the system.')).toBeInTheDocument();
  });

  it('supports success, error, warning, and info severities', () => {
    const { rerender } = render(
      <Toast id={1} message="Success note" severity="success" onDismiss={vi.fn()} />,
    );
    expect(screen.getByText('Success note')).toBeInTheDocument();

    rerender(<Toast id={2} message="Error note" severity="error" onDismiss={vi.fn()} />);
    expect(screen.getByText('Error note')).toBeInTheDocument();

    rerender(<Toast id={3} message="Warning note" severity="warning" onDismiss={vi.fn()} />);
    expect(screen.getByText('Warning note')).toBeInTheDocument();

    rerender(<Toast id={4} message="Info note" severity="info" onDismiss={vi.fn()} />);
    expect(screen.getByText('Info note')).toBeInTheDocument();
  });

  it('triggers onDismiss when close button is clicked', async () => {
    vi.useRealTimers();
    const handleDismiss = vi.fn();
    render(<Toast id={10} message="Dismissable toast" onDismiss={handleDismiss} />);

    const closeBtn = screen.getByRole('button', { name: 'Dismiss notification' });
    expect(closeBtn).toBeInTheDocument();
    await userEvent.click(closeBtn);
    expect(handleDismiss).toHaveBeenCalledWith(10);
  });

  it('automatically triggers onDismiss when autoHide duration expires', () => {
    const handleDismiss = vi.fn();
    render(
      <Toast
        id={20}
        message="Timed message"
        duration={3000}
        onDismiss={handleDismiss}
      />,
    );

    expect(handleDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(handleDismiss).toHaveBeenCalledWith(20);
  });
});

describe('NotificationProvider stacking & notifier API', () => {
  function TestConsumer() {
    const notify = useNotify();
    return (
      <div>
        <button onClick={() => notify.success('First toast')}>Push Success</button>
        <button onClick={() => notify.error('Second toast')}>Push Error</button>
        <button onClick={() => notify.warning('Third toast')}>Push Warning</button>
        <button onClick={() => notify.info('Fourth toast', { title: 'Update' })}>Push Info</button>
      </div>
    );
  }

  it('stacks multiple notifications in the bottom-right corner', async () => {
    render(
      <NotificationProvider>
        <TestConsumer />
      </NotificationProvider>,
    );

    const successBtn = screen.getByText('Push Success');
    const errorBtn = screen.getByText('Push Error');
    const warningBtn = screen.getByText('Push Warning');

    await userEvent.click(successBtn);
    await userEvent.click(errorBtn);
    await userEvent.click(warningBtn);

    expect(await screen.findByText('First toast')).toBeInTheDocument();
    expect(await screen.findByText('Second toast')).toBeInTheDocument();
    expect(await screen.findByText('Third toast')).toBeInTheDocument();

    // Verify all 3 toasts are rendered in the container
    const alerts = screen.getAllByRole('alert');
    expect(alerts.length).toBe(3);
  });

  it('supports custom title option in notifications', async () => {
    render(
      <NotificationProvider>
        <TestConsumer />
      </NotificationProvider>,
    );

    const infoBtn = screen.getByText('Push Info');
    await userEvent.click(infoBtn);

    expect(await screen.findByText('Update')).toBeInTheDocument();
    expect(await screen.findByText('Fourth toast')).toBeInTheDocument();
  });
});
