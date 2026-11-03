import { createHttpClient, type HttpClient } from '@cyient/api-client';
import type { MeResponse } from '@cyient/api-client/platform';
import { QueryClient } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { createDevelopmentSession } from '../auth/session';
import { AppProviders } from '../providers/AppProviders';

/** A fake API answer: data in the success envelope, or a Response for anything else (errors, files). */
export type MockHandler = (request: { url: URL; params: Record<string, string>; body: unknown }) => unknown;

/** Handlers by "METHOD /path/{param}", for example "GET /api/v1/requests/{publicId}". */
export type MockRoutes = Record<string, MockHandler>;

export const testUser: MeResponse = {
  userId: 1,
  displayName: 'Riya Requester',
  roles: ['Requester'],
  permissions: [],
  pendingCount: 0,
};

function matcher(route: string) {
  const [method = 'GET', path = '/'] = route.split(' ');
  const names: string[] = [];
  const pattern = new RegExp(
    `^${path.replace(/\{([^}]+)\}/g, (_, name: string) => {
      names.push(name);
      return '([^/]+)';
    })}$`,
  );
  return { method: method.toUpperCase(), pattern, names };
}

/** An HttpClient answering from handlers; an unhandled call fails the test with its address. */
export function createMockHttp(routes: MockRoutes, me: MeResponse = testUser): HttpClient {
  const all: MockRoutes = { 'GET /api/v1/me': () => me, ...routes };
  const table = Object.entries(all).map(([route, handler]) => ({ ...matcher(route), handler }));

  return createHttpClient({
    baseUrl: 'http://api.test',
    fetch: async (input, init) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      const method = (init?.method ?? 'GET').toUpperCase();
      for (const route of table) {
        const match = route.method === method ? route.pattern.exec(url.pathname) : null;
        if (!match) continue;
        const params = Object.fromEntries(route.names.map((name, i) => [name, decodeURIComponent(match[i + 1] ?? '')]));
        const body: unknown = typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body;
        const result = await route.handler({ url, params, body });
        if (result instanceof Response) return result;
        return new Response(
          JSON.stringify({ success: true, data: result ?? null, message: null, errors: [], meta: null, traceId: 'test', timestamp: new Date().toISOString() }),
          { headers: { 'Content-Type': 'application/json' } },
        );
      }
      throw new Error(`No mock for ${method} ${url.pathname}`);
    },
  });
}

/** An error envelope response for a mock handler. */
export function errorResponse(status: number, code: string, message: string, field: string | null = null): Response {
  return new Response(
    JSON.stringify({ success: false, data: null, message, errors: [{ code, field, message }], meta: null, traceId: 'test', timestamp: '' }),
    { status, headers: { 'Content-Type': 'application/json' } },
  );
}

interface RenderOptions {
  routes?: MockRoutes;
  me?: Partial<MeResponse>;
  /** The address the page is shown at. */
  path?: string;
}

/** Renders inside the real providers (theme, query, sign-in, notifications) and a router, against mock API routes. */
export function renderWithProviders(ui: ReactNode, { routes = {}, me, path = '/' }: RenderOptions = {}): RenderResult {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <AppProviders session={createDevelopmentSession('test-user')} http={createMockHttp(routes, { ...testUser, ...me })} queryClient={queryClient}>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </AppProviders>,
  );
}
