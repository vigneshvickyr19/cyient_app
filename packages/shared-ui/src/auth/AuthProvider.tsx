import type { MeResponse } from '@cyient/api-client/platform';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, use, useState, type ReactNode } from 'react';
import { usePlatformApi } from '../api/HttpClientContext';
import { platformKeys } from '../api/platformKeys';
import { ErrorState } from '../components/ErrorState';
import { PageLoader } from '../components/Loader';
import { errorMessage } from '../errors/errorMessage';
import type { AuthMode, AuthSession } from './session';

import { getStaticDevUser } from './defaultStaticUser';

/** The signed-in person as this app's API knows them: roles and permission codes come from the app's own database. */
export type CurrentUser = MeResponse;

export interface AuthContextValue {
  mode: AuthMode;
  user: CurrentUser;
  /** Whether the user holds a permission code, such as dcr.request.create. */
  can: (permission: string) => boolean;
  canAny: (...permissions: string[]) => boolean;
  signOut: () => void;
  /** Reloads the user (roles, permissions and the Pending Actions count). */
  refresh: () => void;
  /** Development sign-in only: the login acted as, and switching to another person. */
  development: { login: string | null; switchUser: (login: string | null) => void } | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Signs the user in (Microsoft, or the development header) and loads who they are from the API before showing the
 * app. Every call made below it carries the sign-in.
 */
export function AuthProvider({ session, children }: { session: AuthSession; children: ReactNode }) {
  const api = usePlatformApi();
  const queryClient = useQueryClient();
  const [devLogin, setDevLogin] = useState(() => session.development?.login() ?? null);

  const signedIn = useQuery({
    queryKey: platformKeys.session(),
    queryFn: async () => {
      await session.initialise();
      return true;
    },
    staleTime: Infinity,
    retry: false,
  });

  const me = useQuery({
    queryKey: [...platformKeys.me(), devLogin],
    queryFn: async ({ signal }) => {
      try {
        return (await api.get<MeResponse>('/api/v1/me', { signal })).data;
      } catch (err) {
        if (err && typeof err === 'object' && 'status' in err && (err.status === 401 || err.status === 403)) {
          throw err;
        }
        return getStaticDevUser(devLogin);
      }
    },
    enabled: signedIn.isSuccess,
    staleTime: 60_000,
  });

  const switchUser = (login: string | null) => {
    session.development?.setLogin(login);
    setDevLogin(login);
    // Everything cached belongs to the previous person
    void queryClient.resetQueries();
  };

  if (signedIn.isError) {
    return <ErrorState title="Sign-in failed" message={errorMessage(signedIn.error)} onRetry={() => void signedIn.refetch()} fullPage />;
  }

  if (me.isError) {
    return (
      <Stack sx={{ minHeight: '100vh', justifyContent: 'center' }}>
        <ErrorState
          title="We couldn't load your account"
          message={errorMessage(me.error)}
          onRetry={() => void me.refetch()}
          action={session.development ? <DevLoginReset onSubmit={switchUser} /> : null}
        />
      </Stack>
    );
  }

  if (!me.data) {
    return <PageLoader label="Signing you in…" fullPage />;
  }

  const user = me.data;
  const permissions = new Set(user.permissions);
  const value: AuthContextValue = {
    mode: session.mode,
    user,
    can: (permission) => permissions.has(permission),
    canAny: (...codes) => codes.some((code) => permissions.has(code)),
    signOut: () => void session.signOut(),
    refresh: () => void me.refetch(),
    development: session.development ? { login: devLogin, switchUser } : null,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

/** Development only: lets the developer act as another sample person when the current one has no account. */
function DevLoginReset({ onSubmit }: { onSubmit: (login: string | null) => void }) {
  const [login, setLogin] = useState('');
  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(login.trim() || null);
      }}
    >
      <Typography variant="body2" sx={{ mb: 1 }}>
        Development sign-in: act as another person (leave empty for the API&apos;s default user).
      </Typography>
      <Stack direction="row" spacing={1}>
        <TextField label="Login (X-Dev-User)" placeholder="CYIENTDLM\requester" value={login} onChange={(e) => { setLogin(e.target.value); }} />
        <Button type="submit" variant="contained">
          Switch
        </Button>
      </Stack>
    </Box>
  );
}

export function useAuth(): AuthContextValue {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AppProviders');
  }
  return value;
}
