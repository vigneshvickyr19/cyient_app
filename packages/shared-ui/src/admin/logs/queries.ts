import type { paths } from '@cyient/api-client/platform';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { usePlatformApi } from '../../index';
import { adminTags } from '../../api/api-tags';
import { platformEndpoints } from '../../api/api-endpoints';

export type LogQuery = NonNullable<paths[typeof platformEndpoints.log.collection]['get']['parameters']['query']>;

export function useLogs(query: LogQuery) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminTags.logs(query),
    queryFn: async ({ signal }) => api.get(platformEndpoints.log.collection, { query, signal }),
    placeholderData: keepPreviousData,
  });
}
