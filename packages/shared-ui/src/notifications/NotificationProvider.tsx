import { Box } from '@mui/material';
import { createContext, use, useState, useCallback, type ReactNode } from 'react';
import { errorMessage } from '../errors/errorMessage';
import { Toast, type ToastSeverity } from './Toast';

export interface ToastOptions {
  title?: string;
  duration?: number;
}

export interface Notifier {
  success(message: string, options?: ToastOptions): void;
  info(message: string, options?: ToastOptions): void;
  warning(message: string, options?: ToastOptions): void;
  /** Shows the message of any error (an ApiError's message, with a reference for server errors). */
  error(error: unknown, fallback?: string, options?: ToastOptions): void;
}

interface NoticeItem {
  id: number;
  message: string;
  severity: ToastSeverity;
  title?: string;
  duration?: number;
  exiting?: boolean;
}

const NotificationContext = createContext<Notifier | null>(null);

let nextId = 1;
const MAX_VISIBLE_TOASTS = 4;
const EXIT_ANIMATION_MS = 240;

/**
 * Modern notification provider: smoothly stacks toasts in the bottom-right corner
 * with slide-up/fade-in entrance and smooth exit animations.
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<NoticeItem[]>([]);

  const dismiss = useCallback((id: number) => {
    // 1. Mark item as exiting to trigger slide-out fade-out animation
    setNotices((current) =>
      current.map((n) => (n.id === id ? { ...n, exiting: true } : n)),
    );
    // 2. Remove from queue after the exit animation completes
    setTimeout(() => {
      setNotices((current) => current.filter((n) => n.id !== id));
    }, EXIT_ANIMATION_MS);
  }, []);

  const [notifier] = useState<Notifier>(() => {
    const push = (severity: ToastSeverity, message: string, options?: ToastOptions) => {
      setNotices((current) => [
        ...current,
        {
          id: nextId++,
          message,
          severity,
          title: options?.title,
          duration: options?.duration,
          exiting: false,
        },
      ]);
    };

    return {
      success: (message, options) => {
        push('success', message, options);
      },
      info: (message, options) => {
        push('info', message, options);
      },
      warning: (message, options) => {
        push('warning', message, options);
      },
      error: (error, fallback, options) => {
        push('error', errorMessage(error, fallback), options);
      },
    };
  });

  // Display up to MAX_VISIBLE_TOASTS active notifications simultaneously
  const visibleNotices = notices.slice(0, MAX_VISIBLE_TOASTS);

  return (
    <NotificationContext value={notifier}>
      {children}
      {visibleNotices.length > 0 && (
        <Box
          data-testid="toast-container"
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 1.25,
            pointerEvents: 'none',
            maxWidth: { xs: 'calc(100vw - 32px)', sm: 440 },
            width: '100%',
          }}
        >
          {visibleNotices.map((notice) => (
            <Toast
              key={notice.id}
              id={notice.id}
              message={notice.message}
              title={notice.title}
              severity={notice.severity}
              duration={notice.duration}
              exiting={notice.exiting}
              onDismiss={dismiss}
            />
          ))}
        </Box>
      )}
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
