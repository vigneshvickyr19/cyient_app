import { useQuery } from '@tanstack/react-query';
import { usePlatformApi } from '../../api/HttpClientContext';
import { adminKeys } from '../adminKeys';

export function useSequences() {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminKeys.sequences(),
    queryFn: async ({ signal }) => (await api.get('/api/v1/admin/sequences', { signal })).data,
  });
}

/** Compares each counter with the numbers given out; runs only once asked for. */
export function useNumberingCheck(requested: boolean) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminKeys.sequenceCheck(),
    queryFn: async ({ signal }) => (await api.get('/api/v1/admin/sequences/check', { signal })).data,
    enabled: requested,
    staleTime: 0,
  });
}
