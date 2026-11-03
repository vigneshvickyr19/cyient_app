import { describe, expect, it, vi } from 'vitest';
import { ApiError } from './errors';
import { buildUrl, createHttpClient, fileNameFrom } from './http';

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

function envelope<T>(data: T, extra: Record<string, unknown> = {}) {
  return { success: true, data, message: null, errors: [], meta: null, traceId: 'trace-1', timestamp: '2026-11-03T10:00:00Z', ...extra };
}

describe('buildUrl', () => {
  it('fills path values, encodes them and leaves empty query values out', () => {
    const url = buildUrl('http://api.test/', '/api/v1/requests/{publicId}/clauses/{clauseId}', {
      path: { publicId: 'a b', clauseId: 7 },
      query: { Search: 'pump', Status: undefined, Scope: '', Page: 2, Tags: ['x', 'y'], Descending: false },
    });
    expect(url).toBe('http://api.test/api/v1/requests/a%20b/clauses/7?Search=pump&Page=2&Tags=x&Tags=y&Descending=false');
  });

  it('refuses a path with a placeholder left unfilled', () => {
    expect(() => buildUrl('http://api.test', '/api/v1/requests/{publicId}')).toThrow('{publicId}');
  });
});

describe('fileNameFrom', () => {
  it('prefers the UTF-8 file name', () => {
    expect(fileNameFrom(`attachment; filename=DCR.pdf; filename*=UTF-8''DCR%202026%E2%80%930042.pdf`)).toBe('DCR 2026–0042.pdf');
  });

  it('reads a quoted plain file name and copes with none', () => {
    expect(fileNameFrom('attachment; filename="Requests.xlsx"')).toBe('Requests.xlsx');
    expect(fileNameFrom(null)).toBeNull();
  });
});

describe('createHttpClient', () => {
  it('sends sign-in headers and a JSON body, and returns data, paging and message', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      json(200, envelope([{ id: 1 }], { message: 'Saved', meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1 } })),
    );
    const client = createHttpClient({ baseUrl: 'http://api.test', getHeaders: () => ({ 'X-Dev-User': 'CYIENTDLM\\ims' }), fetch });

    const result = await client.request<{ id: number }[]>('post', '/api/v1/requests', { body: { needByDate: '2026-12-01' } });

    expect(result).toEqual({
      data: [{ id: 1 }],
      meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1 },
      message: 'Saved',
      traceId: 'trace-1',
    });
    const [, init] = fetch.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(init?.method).toBe('POST');
    expect(headers.get('X-Dev-User')).toBe('CYIENTDLM\\ims');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(init?.body).toBe('{"needByDate":"2026-12-01"}');
  });

  it('sends FormData as it is, so the browser sets the multipart boundary', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(json(200, envelope({ id: 5 })));
    const client = createHttpClient({ baseUrl: 'http://api.test', fetch });
    const form = new FormData();
    form.append('file', new Blob(['x']), 'a.pdf');

    await client.request('post', '/api/v1/requests/{publicId}/documents', { path: { publicId: 'p1' }, body: form });

    const [, init] = fetch.mock.calls[0]!;
    expect(init?.body).toBe(form);
    expect(new Headers(init?.headers).has('Content-Type')).toBe(false);
  });

  it('turns an error envelope into an ApiError with codes, field errors and the trace ID', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      json(400, {
        ...envelope(null),
        success: false,
        message: 'Check the highlighted fields.',
        errors: [
          { code: 'VALIDATION', field: 'needByDate', message: 'Need-by date cannot be in the past.' },
          { code: 'VALIDATION', field: 'needByDate', message: 'Second message' },
        ],
      }),
    );
    const client = createHttpClient({ baseUrl: 'http://api.test', fetch });

    const error = await client.request('post', '/x').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ApiError;
    expect(apiError.status).toBe(400);
    expect(apiError.message).toBe('Check the highlighted fields.');
    expect(apiError.code).toBe('VALIDATION');
    expect(apiError.isValidation).toBe(true);
    expect(apiError.traceId).toBe('trace-1');
    expect(apiError.fieldErrors()).toEqual({ needByDate: 'Need-by date cannot be in the past.' });
  });

  it('explains an HTTP failure without an envelope, and calls back on 401', async () => {
    const onUnauthorized = vi.fn();
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response('', { status: 401 }));
    const client = createHttpClient({ baseUrl: 'http://api.test', fetch, onUnauthorized });

    const error = (await client.request('get', '/api/v1/me').catch((e: unknown) => e)) as ApiError;

    expect(error.isUnauthorized).toBe(true);
    expect(error.message).toBe('Your sign-in has expired. Sign in again.');
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('says how long to wait after 429', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response('', { status: 429, headers: { 'Retry-After': '12' } }));
    const client = createHttpClient({ baseUrl: 'http://api.test', fetch });

    const error = (await client.request('get', '/x').catch((e: unknown) => e)) as ApiError;

    expect(error.retryAfterSeconds).toBe(12);
    expect(error.message).toBe('Too many requests. Try again in 12 seconds.');
  });

  it('reports an unreachable server as status 0 but lets an abort through', async () => {
    const offline = createHttpClient({ baseUrl: 'http://api.test', fetch: vi.fn<typeof globalThis.fetch>().mockRejectedValue(new TypeError('Failed to fetch')) });
    const error = (await offline.request('get', '/x').catch((e: unknown) => e)) as ApiError;
    expect(error.isNetworkError).toBe(true);

    const aborted = createHttpClient({
      baseUrl: 'http://api.test',
      fetch: vi.fn<typeof globalThis.fetch>().mockRejectedValue(new DOMException('Aborted', 'AbortError')),
    });
    await expect(aborted.request('get', '/x')).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('accepts an empty or non-JSON success response', async () => {
    const client = createHttpClient({ baseUrl: 'http://api.test', fetch: vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(null, { status: 204 })) });
    await expect(client.request('delete', '/x')).resolves.toMatchObject({ data: null, meta: null });
  });

  it('downloads a file with its name, and reads the error envelope of a failed download', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(
        new Response('%PDF', { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="DCR.pdf"' } }),
      )
      .mockResolvedValueOnce(json(403, { ...envelope(null), success: false, message: 'Not yours', errors: [{ code: 'AUTH_FORBIDDEN', field: null, message: 'Not yours' }] }));
    const client = createHttpClient({ baseUrl: 'http://api.test', fetch });

    const file = await client.download('/api/v1/requests/{publicId}/pdf', { path: { publicId: 'p1' } });
    expect(file.fileName).toBe('DCR.pdf');
    expect(file.contentType).toBe('application/pdf');
    expect(await file.blob.text()).toBe('%PDF');

    await expect(client.download('/x')).rejects.toMatchObject({ status: 403, message: 'Not yours' });
  });
});
