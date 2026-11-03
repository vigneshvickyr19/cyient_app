import { describe, expect, it } from 'vitest';
import { readAppEnv } from './appEnv';

describe('readAppEnv', () => {
  it('reads development sign-in and trims the API address', () => {
    expect(readAppEnv({ VITE_API_BASE_URL: 'http://localhost:5555/', VITE_AUTH_MODE: 'development' }, 'dcr-dev-user')).toEqual({
      apiBaseUrl: 'http://localhost:5555',
      auth: { mode: 'development', storageKey: 'dcr-dev-user' },
    });
  });

  it('defaults to Entra ID sign-in and needs its settings', () => {
    expect(() => readAppEnv({ VITE_API_BASE_URL: 'https://dcr-api.cyientdlm.com' }, 'k')).toThrow('VITE_ENTRA_CLIENT_ID is not set');
    expect(
      readAppEnv(
        { VITE_API_BASE_URL: 'https://dcr-api.cyientdlm.com', VITE_ENTRA_CLIENT_ID: 'c', VITE_ENTRA_TENANT_ID: 't', VITE_ENTRA_SCOPE: 'api://cyient-dlm-dcr/access_as_user' },
        'k',
      ).auth,
    ).toEqual({ mode: 'entra', storageKey: 'k', entra: { clientId: 'c', tenantId: 't', scope: 'api://cyient-dlm-dcr/access_as_user', redirectUri: undefined } });
  });

  it('names the missing API address and refuses an unknown sign-in mode', () => {
    expect(() => readAppEnv({}, 'k')).toThrow('VITE_API_BASE_URL is not set');
    expect(() => readAppEnv({ VITE_API_BASE_URL: 'x', VITE_AUTH_MODE: 'windows' }, 'k')).toThrow('VITE_AUTH_MODE must be');
  });
});
