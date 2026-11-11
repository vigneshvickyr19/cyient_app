import type { paths, UserStatusInput } from '@cyient/api-client/platform';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlatformApi } from '@cyient/shared-ui';
import { adminKeys } from '../adminKeys';

export type UserQuery = NonNullable<paths['/api/v1/admin/users']['get']['parameters']['query']>;

export function useUsers(query: UserQuery) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminKeys.userList(query),
    queryFn: async ({ signal }) => api.get('/api/v1/admin/users', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

export function useUser(userId: number) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminKeys.user(userId),
    queryFn: async ({ signal }) => (await api.get('/api/v1/admin/users/{userId}', { path: { userId }, signal })).data,
  });
}

export function useSetUserStatus(userId: number) {
  const api = usePlatformApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UserStatusInput) => api.put('/api/v1/admin/users/{userId}/status', { path: { userId }, body }),
    onSuccess: (result) => {
      queryClient.setQueryData(adminKeys.user(userId), result.data);
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.users(), 'list'] });
    },
  });
}
