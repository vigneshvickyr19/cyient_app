import type { ApiEnvelope, ApiResult, FileResult } from './envelope';
import { ApiError, INVALID_RESPONSE, messageForStatus, NETWORK_ERROR, type ApiErrorItem } from './errors';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

type Scalar = string | number | boolean;

export interface HttpRequestOptions {
  /** Values for the {placeholders} in the path. */
  path?: Readonly<Record<string, Scalar>>;
  /** Query string; empty values are left out and arrays repeat the name. */
  query?: object;
  /** A plain object is sent as JSON; FormData as multipart (uploads). */
  body?: unknown;
  headers?: Readonly<Record<string, string>>;
  signal?: AbortSignal;
}

export interface HttpClientOptions {
  /** The API's address, for example http://localhost:5555. */
  baseUrl: string;
  /** Sign-in headers for every call: Authorization with Entra ID, X-Dev-User in development. */
  getHeaders?: () => Promise<Readonly<Record<string, string>>> | Readonly<Record<string, string>>;
  /** Called when the API answers 401, before the error is thrown. */
  onUnauthorized?: () => void;
  /** For tests. */
  fetch?: typeof fetch;
}

export interface HttpClient {
  readonly baseUrl: string;
  request<T = unknown>(method: HttpMethod, path: string, options?: HttpRequestOptions): Promise<ApiResult<T>>;
  get<T = unknown>(path: string, options?: HttpRequestOptions): Promise<ApiResult<T>>;
  post<T = unknown>(path: string, options?: HttpRequestOptions): Promise<ApiResult<T>>;
  put<T = unknown>(path: string, options?: HttpRequestOptions): Promise<ApiResult<T>>;
  patch<T = unknown>(path: string, options?: HttpRequestOptions): Promise<ApiResult<T>>;
  delete<T = unknown>(path: string, options?: HttpRequestOptions): Promise<ApiResult<T>>;
  download(path: string, options?: HttpRequestOptions): Promise<FileResult>;
}

export function buildUrl(baseUrl: string, path: string, options: Pick<HttpRequestOptions, 'path' | 'query'> = {}): string {
  const resolved = path.replace(/\{([^}]+)\}/g, (_, name: string) => {
    const value = options.path?.[name];
    if (value === undefined) {
      throw new Error(`No value for {${name}} in ${path}`);
    }
    return encodeURIComponent(String(value));
  });

  const search = new URLSearchParams();
  for (const [name, value] of Object.entries(options.query ?? {}) as [string, unknown][]) {
    for (const item of Array.isArray(value) ? (value as unknown[]) : [value]) {
      if ((typeof item === 'string' && item !== '') || typeof item === 'number' || typeof item === 'boolean') {
        search.append(name, String(item));
      }
    }
  }

  const query = search.toString();
  return `${baseUrl.replace(/\/+$/, '')}${resolved}${query ? `?${query}` : ''}`;
}

/** The file name from Content-Disposition, preferring the UTF-8 form (filename*=UTF-8''...). */
export function fileNameFrom(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;
  const encoded = /filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/.exec(contentDisposition);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, ''));
    } catch {
      return null;
    }
  }
  const plain = /filename\s*=\s*"?([^";]+)"?/.exec(contentDisposition);
  return plain?.[1]?.trim() ?? null;
}

function retryAfter(response: Response): number | null {
  const value = Number(response.headers.get('Retry-After'));
  return Number.isFinite(value) && value > 0 ? value : null;
}

async function readEnvelope(response: Response): Promise<ApiEnvelope<unknown> | null> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  if (!(response.headers.get('Content-Type') ?? '').includes('json')) return null;
  try {
    return JSON.parse(text) as ApiEnvelope<unknown>;
  } catch {
    throw new ApiError(response.status, 'The server sent a response that could not be read.', {
      errors: [{ code: INVALID_RESPONSE, field: null, message: 'Invalid JSON' }],
    });
  }
}

function errorFrom(response: Response, envelope: ApiEnvelope<unknown> | null): ApiError {
  const errors: ApiErrorItem[] = envelope?.errors ?? [];
  const message =
    response.status === 429 && retryAfter(response)
      ? `Too many requests. Try again in ${retryAfter(response)} seconds.`
      : (envelope?.message ?? errors[0]?.message ?? messageForStatus(response.status));
  return new ApiError(response.status, message, {
    errors,
    traceId: envelope?.traceId ?? null,
    retryAfterSeconds: retryAfter(response),
  });
}

/** The client every app creates once, for its own API. */
export function createHttpClient(options: HttpClientOptions): HttpClient {
  const fetchImpl = options.fetch ?? ((input: RequestInfo | URL, init?: RequestInit) => fetch(input, init));

  async function send(method: HttpMethod, path: string, request: HttpRequestOptions, accept: string): Promise<Response> {
    const headers = new Headers({ Accept: accept });
    for (const [name, value] of Object.entries(await options.getHeaders?.() ?? {})) headers.set(name, value);
    for (const [name, value] of Object.entries(request.headers ?? {})) headers.set(name, value);

    let body: BodyInit | undefined;
    if (request.body instanceof FormData) {
      body = request.body;
    } else if (request.body !== undefined) {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(request.body);
    }

    let response: Response;
    try {
      response = await fetchImpl(buildUrl(options.baseUrl, path, request), {
        method: method.toUpperCase(),
        headers,
        body,
        signal: request.signal ?? null,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      throw new ApiError(0, 'The server could not be reached. Check your connection and try again.', {
        errors: [{ code: NETWORK_ERROR, field: null, message: error instanceof Error ? error.message : 'Network error' }],
      });
    }

    if (response.status === 401) options.onUnauthorized?.();
    return response;
  }

  return {
    baseUrl: options.baseUrl,

    async request<T>(method: HttpMethod, path: string, request: HttpRequestOptions = {}): Promise<ApiResult<T>> {
      const response = await send(method, path, request, 'application/json');
      const envelope = await readEnvelope(response);
      if (!response.ok || envelope?.success === false) {
        throw errorFrom(response, envelope);
      }
      return {
        data: (envelope?.data ?? null) as T,
        meta: envelope?.meta ?? null,
        message: envelope?.message ?? null,
        traceId: envelope?.traceId ?? null,
      };
    },

    get<T = unknown>(path: string, request?: HttpRequestOptions): Promise<ApiResult<T>> {
      return this.request<T>('get', path, request);
    },

    post<T = unknown>(path: string, request?: HttpRequestOptions): Promise<ApiResult<T>> {
      return this.request<T>('post', path, request);
    },

    put<T = unknown>(path: string, request?: HttpRequestOptions): Promise<ApiResult<T>> {
      return this.request<T>('put', path, request);
    },

    patch<T = unknown>(path: string, request?: HttpRequestOptions): Promise<ApiResult<T>> {
      return this.request<T>('patch', path, request);
    },

    delete<T = unknown>(path: string, request?: HttpRequestOptions): Promise<ApiResult<T>> {
      return this.request<T>('delete', path, request);
    },

    async download(path: string, request: HttpRequestOptions = {}): Promise<FileResult> {
      const response = await send('get', path, request, '*/*');
      if (!response.ok) {
        throw errorFrom(response, await readEnvelope(response));
      }
      return {
        blob: await response.blob(),
        fileName: fileNameFrom(response.headers.get('Content-Disposition')),
        contentType: response.headers.get('Content-Type') ?? 'application/octet-stream',
      };
    },
  };
}

/** A fresh Idempotency-Key for a create call, so a retried request can't create a record twice. */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}
