import { isApiError } from '@cyient/api-client';
import { QueryClient } from '@tanstack/react-query';

/** A request worth trying again: a lost connection or a server error, never a refusal (4xx). */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (!isApiError(error)) return true;
  return error.isNetworkError || error.status >= 500;
}

/** The query client of every app: short-lived cache, retries only where they can help, no refetch on focus. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
