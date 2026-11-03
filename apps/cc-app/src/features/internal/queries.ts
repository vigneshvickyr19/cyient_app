import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCcApi } from '../../lib/api';
import { internalKeys, type InternalListQuery } from './keys';

/** Internal complaints, paged and filtered on the server. */
export function useInternalList(query: InternalListQuery) {
  const api = useCcApi();
  return useQuery({
    queryKey: internalKeys.list(query),
    queryFn: ({ signal }) => api.get('/api/v1/internal-complaints', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** One internal complaint with its action lines and its version. */
export function useInternalComplaint(publicId: string) {
  const api = useCcApi();
  return useQuery({
    queryKey: internalKeys.detail(publicId),
    queryFn: async ({ signal }) => (await api.get('/api/v1/internal-complaints/{publicId}', { path: { publicId }, signal })).data,
  });
}
