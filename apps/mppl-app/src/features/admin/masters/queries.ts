import type { MasterItemInput } from '@cyient/api-client/platform';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlatformApi } from '@cyient/shared-ui';
import { platformKeys } from '@cyient/shared-ui';
import { adminKeys } from '../adminKeys';

/** The master lists there are (Location, Department, ReasonCategory...). */
export function useMasterTypes() {
  const api = usePlatformApi();
  return useQuery({
    queryKey: platformKeys.masterTypes(),
    queryFn: async ({ signal }) => (await api.get('/api/v1/masters', { signal })).data,
    staleTime: 10 * 60_000,
  });
}

/** Every item of one list, switched-off ones included. */
export function useAdminMasterItems(masterType: string) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminKeys.masterItems(masterType),
    queryFn: async ({ signal }) => (await api.get('/api/v1/admin/masters/{masterType}', { path: { masterType }, signal })).data,
  });
}

/** Adds an item (no id) or changes one; the drop-downs of every page are refreshed too. */
export function useSaveMasterItem(masterType: string) {
  const api = usePlatformApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | null; body: MasterItemInput }) =>
      id === null
        ? api.post('/api/v1/admin/masters/{masterType}', { path: { masterType }, body })
        : api.put('/api/v1/admin/masters/{masterType}/{id}', { path: { masterType, id }, body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.masterItems(masterType) });
      void queryClient.invalidateQueries({ queryKey: platformKeys.masters(masterType) });
    },
  });
}
