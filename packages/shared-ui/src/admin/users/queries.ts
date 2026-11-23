import type { ApiResult } from '@cyient/api-client';
import type { paths, UserDetails, UserStatusInput } from '@cyient/api-client/platform';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlatformApi } from '../../index';
import { adminTags } from '../../api/api-tags';
import { platformEndpoints } from '../../api/api-endpoints';
import { toastMeta } from '../../notifications/MutationToasts';

export type UserQuery = NonNullable<paths[typeof platformEndpoints.user.collection]['get']['parameters']['query']>;

export function useUsers(query: UserQuery) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminTags.userList(query),
    queryFn: async ({ signal }) => api.get(platformEndpoints.user.collection, { query, signal }),
    placeholderData: keepPreviousData,
  });
}

export function useUser(userId: number) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminTags.user(userId),
    queryFn: async ({ signal }) => (await api.get(platformEndpoints.user.item, { path: { userId }, signal })).data,
  });
}

export function useSetUserStatus(userId: number) {
  const api = usePlatformApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UserStatusInput) => api.put(platformEndpoints.user.status, { path: { userId }, body }),
    meta: toastMeta<ApiResult<UserDetails>>({
      success: (result) => (result.data.isActive ? 'The user has been switched on.' : 'The user has been switched off.'),
      error: 'The user could not be changed.',
    }),
    onSuccess: (result) => {
      queryClient.setQueryData(adminTags.user(userId), result.data);
      void queryClient.invalidateQueries({ queryKey: adminTags.userLists() });
    },
  });
}
