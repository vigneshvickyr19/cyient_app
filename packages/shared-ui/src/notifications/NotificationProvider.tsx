import { Alert, Snackbar, type AlertColor } from '@mui/material';
import { createContext, use, useState, type ReactNode } from 'react';
import { errorMessage } from '../errors/errorMessage';

interface Notice {
  id: number;
  message: string;
  severity: AlertColor;
}

export interface Notifier {
  success(message: string): void;
  info(message: string): void;
  warning(message: string): void;
  /** Shows the message of any error (an ApiError's message, with a reference for server errors). */
  error(error: unknown, fallback?: string): void;
}

const NotificationContext = createContext<Notifier | null>(null);

let nextId = 1;

/** Short confirmations and errors, one at a time, at the bottom of the screen. */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Notice[]>([]);
  // Created once: setQueue never changes, so consumers never re-render because of the notifier
  const [notifier] = useState<Notifier>(() => {
    const push = (severity: AlertColor, message: string) => {
      setQueue((current) => [...current, { id: nextId++, message, severity }]);
    };
    return {
      success: (message) => {
        push('success', message);
      },
      info: (message) => {
        push('info', message);
      },
      warning: (message) => {
        push('warning', message);
      },
      error: (error, fallback) => {
        push('error', errorMessage(error, fallback));
      },
    };
  });

  const current = queue[0];
  const dismiss = () => {
    setQueue((items) => items.slice(1));
  };

  return (
    <NotificationContext value={notifier}>
      {children}
      <Snackbar
        key={current?.id}
        open={Boolean(current)}
        autoHideDuration={current?.severity === 'error' ? 8000 : 4000}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') dismiss();
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={current?.severity ?? 'info'} variant="filled" onClose={dismiss} sx={{ width: '100%' }}>
          {current?.message}
        </Alert>
      </Snackbar>
    </NotificationContext>
  );
}

export function useNotify(): Notifier {
  const notifier = use(NotificationContext);
  if (!notifier) {
    throw new Error('useNotify must be used inside AppProviders');
  }
  return notifier;
}
