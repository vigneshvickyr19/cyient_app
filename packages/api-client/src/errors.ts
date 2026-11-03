/** One problem reported by the API: a code the front end can act on, the field it concerns (if any) and a message. */
export interface ApiErrorItem {
  code: string;
  field: string | null;
  message: string;
}

export const NETWORK_ERROR = 'NETWORK_ERROR';
export const INVALID_RESPONSE = 'INVALID_RESPONSE';

/**
 * A call that did not succeed: an error envelope from the API, an HTTP failure without one, an unreadable response or
 * an unreachable server (status 0). The message is always fit to show to the user.
 */
export class ApiError extends Error {
  override readonly name = 'ApiError';

  readonly status: number;

  readonly errors: readonly ApiErrorItem[];

  /** Quote it to support: it finds the call in the API's log. */
  readonly traceId: string | null;

  /** After 429, how long to wait before trying again. */
  readonly retryAfterSeconds: number | null;

  constructor(
    status: number,
    message: string,
    options: { errors?: readonly ApiErrorItem[]; traceId?: string | null; retryAfterSeconds?: number | null } = {},
  ) {
    super(message);
    this.status = status;
    this.errors = options.errors ?? [];
    this.traceId = options.traceId ?? null;
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
  }

  /** The first error code, such as DCR_NOT_DRAFT or PLATFORM_CONCURRENCY. */
  get code(): string | null {
    return this.errors[0]?.code ?? null;
  }

  hasCode(code: string): boolean {
    return this.errors.some((e) => e.code === code);
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** Someone saved the record in between: the user should reload it. */
  get isConflict(): boolean {
    return this.status === 409;
  }

  get isValidation(): boolean {
    return this.status === 400 || this.status === 422;
  }

  /** Field name (as the API names it, for example documentReference) to its first message. */
  fieldErrors(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const error of this.errors) {
      if (error.field && !(error.field in result)) {
        result[error.field] = error.message;
      }
    }
    return result;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

const statusMessages: Record<number, string> = {
  400: 'The request could not be accepted. Check the details and try again.',
  401: 'Your sign-in has expired. Sign in again.',
  403: "You don't have permission to do this.",
  404: 'This record was not found. It may have been removed.',
  409: 'Someone else changed this record. Reload it and try again.',
  413: 'The file is too large.',
  415: 'This type of file is not accepted.',
  429: 'Too many requests. Wait a moment and try again.',
};

/** A message for an HTTP status when the API sent none of its own. */
export function messageForStatus(status: number): string {
  if (status >= 500) {
    return 'Something went wrong on the server. Try again, and contact support if it keeps happening.';
  }
  return statusMessages[status] ?? `The request failed (HTTP ${status}).`;
}
