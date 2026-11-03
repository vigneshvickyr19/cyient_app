import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMpplApi } from '../../lib/api';
import { sourcingKeys, type SourcingListQuery } from './keys';

/** The sourcing master, paged and filtered on the server. */
export function useSourcingList(query: SourcingListQuery) {
  const api = useMpplApi();
  return useQuery({
    queryKey: sourcingKeys.list(query),
    queryFn: ({ signal }) => api.get('/api/v1/admin/sourcing', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** One row with its current version, read again before it is changed. */
export function useSourcingRow(id: number) {
  const api = useMpplApi();
  return useQuery({
    queryKey: sourcingKeys.row(id),
    queryFn: async ({ signal }) => (await api.get('/api/v1/admin/sourcing/{id}', { path: { id }, signal })).data,
  });
}
