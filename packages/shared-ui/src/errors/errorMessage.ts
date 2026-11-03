import { isApiError } from '@cyient/api-client';

/** A message fit to show for any error; server errors add the trace ID to quote to support. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Try again.'): string {
  if (isApiError(error)) {
    return error.status >= 500 && error.traceId ? `${error.message} (Reference: ${error.traceId})` : error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
