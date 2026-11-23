import type { MeResponse } from '@cyient/api-client/platform';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, use, useState, type ReactNode } from 'react';
import { usePlatformApi } from '../api/HttpClientContext';
import { platformTags } from '../api/api-tags';
import { ErrorState } from '../components/error-state';
import { PageLoader } from '../components/loader';
import { errorMessage } from '../errors/errorMessage';
import type { AuthMode, AuthSession } from './session';
import { platformEndpoints } from '../api/api-endpoints';

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
  const [signedOut, setSignedOut] = useState(false);

  const signedIn = useQuery({
    queryKey: platformTags.session(),
    queryFn: async () => {
      await session.initialise();
      return true;
    },
    staleTime: Infinity,
    retry: false,
  });

  const me = useQuery({
    queryKey: platformTags.meAs(devLogin),
    queryFn: async ({ signal }) => (await api.get(platformEndpoints.account.me, { signal })).data,
    enabled: signedIn.isSuccess,
    staleTime: 60_000,
  });

  const switchUser = (login: string | null) => {
    session.development?.setLogin(login);
    setDevLogin(login);
    // Everything cached belongs to the previous person
    void queryClient.resetQueries();
  };

  if (signedOut) {
    return (
      <SignedOut
        onSignIn={(login) => {
          switchUser(login);
          setSignedOut(false);
        }}
      />
    );
  }

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
    return (
      <PageLoader
        label="Signing you in…"
        subtitle="Verifying your credentials and preparing your workspace…"
        fullPage
      />
    );
  }

  const user = me.data;
  const permissions = new Set(user.permissions);
  const value: AuthContextValue = {
    mode: session.mode,
    user,
    can: (permission) => permissions.has(permission),
    canAny: (...codes) => codes.some((code) => permissions.has(code)),
    signOut: () => {
      if (!session.development) {
        void session.signOut();
        return;
      }
      // Development sign-in has no session to end: forget the login and ask who to act as next
      switchUser(null);
      setSignedOut(true);
    },
    refresh: () => void me.refetch(),
    development: session.development ? { login: devLogin, switchUser } : null,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

/** Development only: lets the developer act as another sample person when the current one has no account. */
function DevLoginReset({ onSubmit, submitLabel = 'Switch' }: { onSubmit: (login: string | null) => void; submitLabel?: string }) {
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
        <Button type="submit" variant="contained" sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  );
}

/** Development sign-in after "Sign out": who to act as next. Empty is the API's default user. */
function SignedOut({ onSignIn }: { onSignIn: (login: string | null) => void }) {
  return (
    <Stack spacing={2} sx={{ minHeight: '100vh', justifyContent: 'center', alignItems: 'center', p: 3 }}>
      <Typography variant="h5" component="h1">
        You have signed out
      </Typography>
      <DevLoginReset onSubmit={onSignIn} submitLabel="Sign in" />
    </Stack>
  );
}

export function useAuth(): AuthContextValue {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AppProviders');
  }
  return value;
}
