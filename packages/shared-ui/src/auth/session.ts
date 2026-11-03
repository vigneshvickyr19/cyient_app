import {
  InteractionRequiredAuthError,
  PublicClientApplication,
  type AccountInfo,
  type IPublicClientApplication,
} from '@azure/msal-browser';

/**
 * How the app signs people in, matching the API's Platform:Authentication:Mode:
 * - "entra": Microsoft sign-in (Entra ID); every call carries the access token for this app's API.
 * - "development": no sign-in; the X-Dev-User header names the person to act as (Docker and local APIs only).
 */
export type AuthMode = 'entra' | 'development';

export interface EntraSettings {
  clientId: string;
  tenantId: string;
  /** The API's scope, for example api://cyient-dlm-dcr/access_as_user. */
  scope: string;
  /** Defaults to the app's own address. */
  redirectUri?: string;
}

export interface AuthSession {
  readonly mode: AuthMode;
  /** Completes a returning Microsoft sign-in, or starts one; resolves once calls can be made. */
  initialise(): Promise<void>;
  /** Headers to add to every API call. */
  headers(): Promise<Record<string, string>>;
  signOut(): Promise<void>;
  /** The signed-in Microsoft account's name (Entra ID only). */
  accountName(): string | null;
  /** Development only: the login acted as (null: the API's default user) and a way to change it. */
  readonly development?: {
    login(): string | null;
    setLogin(login: string | null): void;
  };
}

/** Development sign-in: the chosen login is remembered in this browser only. */
export function createDevelopmentSession(storageKey: string): AuthSession {
  const read = (): string | null => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };

  return {
    mode: 'development',
    initialise: () => Promise.resolve(),
    headers: () => {
      const login = read();
      const headers: Record<string, string> = login ? { 'X-Dev-User': login } : {};
      return Promise.resolve(headers);
    },
    signOut: () => Promise.resolve(),
    accountName: () => null,
    development: {
      login: read,
      setLogin(login) {
        try {
          if (login) localStorage.setItem(storageKey, login);
          else localStorage.removeItem(storageKey);
        } catch {
          // Storage blocked: the API's default user is used
        }
      },
    },
  };
}

/** Microsoft sign-in with MSAL; the token is fetched (and renewed) silently for every call. */
export function createEntraSession(settings: EntraSettings): AuthSession {
  let client: IPublicClientApplication | null = null;
  const scopes = [settings.scope];

  const account = (): AccountInfo | null => client?.getActiveAccount() ?? client?.getAllAccounts()[0] ?? null;

  return {
    mode: 'entra',

    async initialise() {
      client = await PublicClientApplication.createPublicClientApplication({
        auth: {
          clientId: settings.clientId,
          authority: `https://login.microsoftonline.com/${settings.tenantId}`,
          redirectUri: settings.redirectUri ?? window.location.origin + window.location.pathname,
          navigateToLoginRequestUrl: true,
        },
        cache: { cacheLocation: 'sessionStorage' },
      });

      const result = await client.handleRedirectPromise();
      const signedIn = result?.account ?? account();
      if (signedIn) {
        client.setActiveAccount(signedIn);
        return;
      }
      await client.loginRedirect({ scopes });
      // The browser is on its way to Microsoft's sign-in page
      await new Promise<never>(() => undefined);
    },

    async headers(): Promise<Record<string, string>> {
      const current = account();
      if (!client || !current) return {};
      try {
        const token = await client.acquireTokenSilent({ scopes, account: current });
        return { Authorization: `Bearer ${token.accessToken}` };
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          await client.acquireTokenRedirect({ scopes, account: current });
        }
        throw error;
      }
    },

    async signOut() {
      await client?.logoutRedirect({ account: account() });
    },

    accountName: () => account()?.name ?? account()?.username ?? null,
  };
}
