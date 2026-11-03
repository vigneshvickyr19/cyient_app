import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { ClauseDetails, DraftDetails, PersonResult, RequestDetails, RequestListItem, paths } from './generated/dcr';
import { createHttpClient } from './http';
import { createApiClient } from './typed';

function client() {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(() =>
    Promise.resolve(
      new Response(JSON.stringify({ success: true, data: null, message: null, errors: [], meta: null, traceId: 't', timestamp: '' }), {
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
  return { fetch, api: createApiClient<paths>(createHttpClient({ baseUrl: 'http://api.test', fetch })) };
}

describe('createApiClient', () => {
  it('types data, path values, query and body from the generated paths', () => {
    const { api } = client();

    expectTypeOf(api.get<'/api/v1/requests/{publicId}'>).returns.resolves.toHaveProperty('data').toEqualTypeOf<RequestDetails>();
    expectTypeOf(api.get<'/api/v1/requests'>).returns.resolves.toHaveProperty('data').toEqualTypeOf<RequestListItem[]>();
    expectTypeOf(api.get<'/api/v1/directory/users'>).returns.resolves.toHaveProperty('data').toEqualTypeOf<PersonResult[]>();
    expectTypeOf(api.post<'/api/v1/requests/{publicId}/clauses'>).returns.resolves.toHaveProperty('data').toEqualTypeOf<ClauseDetails>();
    expectTypeOf(api.put<'/api/v1/requests/{publicId}'>).parameter(1).toMatchTypeOf<{ path: { publicId: string }; body: DraftDetails }>();

    // Checked by the compiler only, never called
    const misuses = () => [
      // @ts-expect-error a path the API doesn't have
      api.get('/api/v1/nothing'),
      // @ts-expect-error the request needs its publicId
      api.get('/api/v1/requests/{publicId}'),
      // @ts-expect-error submit is a POST, not a GET
      api.get('/api/v1/requests/{publicId}/submit', { path: { publicId: 'x' } }),
      // @ts-expect-error an unknown query parameter
      api.get('/api/v1/requests', { query: { Colour: 'red' } }),
    ];
    expectTypeOf(misuses).toBeFunction();
  });

  it('calls the right method and path at run time', async () => {
    const { api, fetch } = client();

    await api.post('/api/v1/requests/{publicId}/approve', { path: { publicId: 'p1' }, body: { comment: 'ok', version: 'v1' } });
    await api.get('/api/v1/requests', { query: { Scope: 'Mine', Page: 2 } });

    expect(fetch.mock.calls.map(([url, init]) => `${init?.method ?? ''} ${url as string}`)).toEqual([
      'POST http://api.test/api/v1/requests/p1/approve',
      'GET http://api.test/api/v1/requests?Scope=Mine&Page=2',
    ]);
  });
});
