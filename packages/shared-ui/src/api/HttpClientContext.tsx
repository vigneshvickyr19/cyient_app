import { createApiClient, type ApiClient, type HttpClient } from '@cyient/api-client';
import type { paths as PlatformPaths } from '@cyient/api-client/platform';
import { createContext, use, type ReactNode } from 'react';

const HttpClientContext = createContext<HttpClient | null>(null);

/** Makes the app's API client available to the shared hooks (sign-in, master lists, people, administration). */
export function HttpClientProvider({ client, children }: { client: HttpClient; children: ReactNode }) {
  return <HttpClientContext value={client}>{children}</HttpClientContext>;
}

export function useHttpClient(): HttpClient {
  const client = use(HttpClientContext);
  if (!client) {
    throw new Error('useHttpClient must be used inside AppProviders');
  }
  return client;
}

/** The endpoints every API shares, typed: /me, masters, people, administration. */
export function usePlatformApi(): ApiClient<PlatformPaths> {
  return createApiClient<PlatformPaths>(useHttpClient());
}
