import { describe, expect, it, vi } from 'vitest';
import { createHttpClient } from './http';
import { createApiClient } from './typed';

function client() {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(() =>
    Promise.resolve(
      new Response(JSON.stringify({ success: true, data: { ok: true }, message: null, errors: [], meta: null, traceId: 't', timestamp: '' }), {
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
  return { fetch, api: createApiClient(createHttpClient({ baseUrl: 'http://api.test', fetch })) };
}

describe('createApiClient', () => {
  it('calls the right method and path at run time without openapi coupling', async () => {
    const { api, fetch } = client();

    const postRes = await api.post('/api/v1/requests/{publicId}/approve', { path: { publicId: 'p1' }, body: { comment: 'ok', version: 'v1' } });
    const getRes = await api.get('/api/v1/requests', { query: { Scope: 'Mine', Page: 2 } });

    expect(postRes.data).toEqual({ ok: true });
    expect(getRes.data).toEqual({ ok: true });

    expect(fetch.mock.calls.map(([url, init]) => `${init?.method ?? ''} ${url as string}`)).toEqual([
      'POST http://api.test/api/v1/requests/p1/approve',
      'GET http://api.test/api/v1/requests?Scope=Mine&Page=2',
    ]);
  });
});
