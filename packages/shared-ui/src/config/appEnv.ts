import type { AuthSettings } from '../auth/createSession';
import type { AuthMode } from '../auth/session';

/** The VITE_ variables every app reads (see each app's .env.example). */
export interface RawAppEnv {
  VITE_API_BASE_URL?: string;
  VITE_AUTH_MODE?: string;
  VITE_ENTRA_CLIENT_ID?: string;
  VITE_ENTRA_TENANT_ID?: string;
  VITE_ENTRA_SCOPE?: string;
  VITE_ENTRA_REDIRECT_URI?: string;
}

export interface AppEnv {
  /** The app's own API, for example http://localhost:5555. */
  apiBaseUrl: string;
  auth: AuthSettings;
}

function requireValue(raw: RawAppEnv, name: keyof RawAppEnv): string {
  const value = raw[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not set. Copy .env.example to .env.local (or set it for the build) and fill it in.`);
  }
  return value;
}

/**
 * Reads and checks an app's settings once, at start-up: a missing API address or Entra ID value stops the app with a
 * message naming the variable, rather than failing on the first call. Nothing secret lives here: Entra ID client and
 * tenant IDs are public identifiers.
 */
export function readAppEnv(raw: RawAppEnv, storageKey: string): AppEnv {
  const apiBaseUrl = requireValue(raw, 'VITE_API_BASE_URL').replace(/\/+$/, '');
  const modeText = raw.VITE_AUTH_MODE?.trim() ?? '';
  const mode = (modeText === '' ? 'entra' : modeText) as AuthMode;
  if (mode !== 'entra' && mode !== 'development') {
    throw new Error(`VITE_AUTH_MODE must be "entra" or "development", not "${String(raw.VITE_AUTH_MODE)}".`);
  }
  return {
    apiBaseUrl,
    auth:
      mode === 'development'
        ? { mode, storageKey }
        : {
            mode,
            storageKey,
            entra: {
              clientId: requireValue(raw, 'VITE_ENTRA_CLIENT_ID'),
              tenantId: requireValue(raw, 'VITE_ENTRA_TENANT_ID'),
              scope: requireValue(raw, 'VITE_ENTRA_SCOPE'),
              redirectUri: raw.VITE_ENTRA_REDIRECT_URI?.trim() ? raw.VITE_ENTRA_REDIRECT_URI.trim() : undefined,
            },
          },
  };
}
