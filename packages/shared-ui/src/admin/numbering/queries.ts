import { useQuery } from '@tanstack/react-query';
import { usePlatformApi } from '../../index';
import { adminTags } from '../../api/api-tags';
import { platformEndpoints } from '../../api/api-endpoints';

export function useSequences() {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminTags.sequences(),
    queryFn: async ({ signal }) => (await api.get(platformEndpoints.sequence.collection, { signal })).data,
  });
}

/** Compares each counter with the numbers given out; runs only once asked for. */
export function useNumberingCheck(requested: boolean) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminTags.sequenceCheck(),
    queryFn: async ({ signal }) => (await api.get(platformEndpoints.sequence.check, { signal })).data,
    enabled: requested,
    staleTime: 0,
  });
}
