import type { ApiResult } from '@cyient/api-client';
import type { MasterItemDetails, MasterItemInput } from '@cyient/api-client/platform';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlatformApi } from '../../index';
import { platformTags } from '../../index';
import { adminTags } from '../../api/api-tags';
import { platformEndpoints } from '../../api/api-endpoints';
import { toastMeta } from '../../notifications/MutationToasts';

/** The master lists there are (Location, Department, ReasonCategory...). */
export function useMasterTypes() {
  const api = usePlatformApi();
  return useQuery({
    queryKey: platformTags.masterTypes(),
    queryFn: async ({ signal }) => (await api.get(platformEndpoints.master.types, { signal })).data,
    staleTime: 10 * 60_000,
  });
}

/** Every item of one list, switched-off ones included. */
export function useAdminMasterItems(masterType: string) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminTags.masterItems(masterType),
    queryFn: async ({ signal }) => (await api.get(platformEndpoints.master.adminItems, { path: { masterType }, signal })).data,
  });
}

/** Adds an item (no id) or changes one; the drop-downs of every page are refreshed too. */
export function useSaveMasterItem(masterType: string) {
  const api = usePlatformApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | null; body: MasterItemInput }) =>
      id === null
        ? api.post(platformEndpoints.master.adminItems, { path: { masterType }, body })
        : api.put(platformEndpoints.master.adminItem, { path: { masterType, id }, body }),
    meta: toastMeta<ApiResult<MasterItemDetails>, { id: number | null }>({
      success: (result, { id }) => (id === null ? `"${result.data.name}" has been added.` : `"${result.data.name}" has been saved.`),
      error: 'The item could not be saved.',
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminTags.masterItems(masterType) });
      void queryClient.invalidateQueries({ queryKey: platformTags.masters(masterType) });
    },
  });
}
