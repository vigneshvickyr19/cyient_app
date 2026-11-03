import { createDevelopmentSession, createEntraSession, type AuthMode, type AuthSession, type EntraSettings } from './session';

export interface AuthSettings {
  mode: AuthMode;
  /** Required for "entra". */
  entra?: EntraSettings;
  /** Where development sign-in remembers the chosen login, one key per app. */
  storageKey: string;
}

/** The sign-in an app's env asks for; Entra ID settings missing is a set-up error, reported at start. */
export function createAuthSession(settings: AuthSettings): AuthSession {
  if (settings.mode === 'development') {
    return createDevelopmentSession(settings.storageKey);
  }
  if (!settings.entra?.clientId || !settings.entra.tenantId || !settings.entra.scope) {
    throw new Error('Entra ID sign-in needs VITE_ENTRA_CLIENT_ID, VITE_ENTRA_TENANT_ID and VITE_ENTRA_SCOPE.');
  }
  return createEntraSession(settings.entra);
}
