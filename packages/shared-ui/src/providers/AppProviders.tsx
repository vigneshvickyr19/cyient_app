import type { HttpClient } from '@cyient/api-client';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, type Theme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import 'dayjs/locale/en-gb';
import { useState, type ReactNode } from 'react';
import { HttpClientProvider } from '../api/HttpClientContext';
import { createQueryClient } from '../api/queryClient';
import { AuthProvider } from '../auth/AuthProvider';
import type { AuthSession } from '../auth/session';
import { ErrorBoundary } from '../errors/ErrorBoundary';
import { NotificationProvider } from '../notifications/NotificationProvider';
import { createAppTheme } from '../theme';

export interface AppProvidersProps {
  /** How the app signs in (created once, from the app's env). */
  session: AuthSession;
  /** The app's HTTP client for its own API. */
  http: HttpClient;
  /** Defaults to the shared query client settings. */
  queryClient?: QueryClient;
  /** Defaults to the shared theme; extend it with createAppTheme(options). */
  theme?: Theme;
  children: ReactNode;
}

const defaultTheme = createAppTheme();

/**
 * Everything an app needs around its router, outermost first: theme and baseline styles, a last-resort error
 * boundary, date pickers, server state (TanStack Query), the API client, notifications and sign-in. Routing is set up
 * by each app inside these providers.
 */
export function AppProviders({ session, http, queryClient, theme = defaultTheme, children }: AppProvidersProps) {
  const [client] = useState(() => queryClient ?? createQueryClient());
  return (
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline enableColorScheme />
      <ErrorBoundary>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
          <QueryClientProvider client={client}>
            <HttpClientProvider client={http}>
              <NotificationProvider>
                <AuthProvider session={session}>{children}</AuthProvider>
              </NotificationProvider>
            </HttpClientProvider>
          </QueryClientProvider>
        </LocalizationProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
