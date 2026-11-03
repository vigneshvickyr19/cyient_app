import type { paths } from '@cyient/api-client/platform';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { usePlatformApi } from '../../api/HttpClientContext';
import { adminKeys } from '../adminKeys';

export type LogQuery = NonNullable<paths['/api/v1/admin/logs']['get']['parameters']['query']>;

export function useLogs(query: LogQuery) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminKeys.logs(query),
    queryFn: async ({ signal }) => api.get('/api/v1/admin/logs', { query, signal }),
    placeholderData: keepPreviousData,
  });
}
