import type { ApiResult } from '@cyient/api-client';
import type { HolderInput, RoleDetails, RoleInput } from '@cyient/api-client/platform';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlatformApi } from '../../index';
import { platformTags } from '../../index';
import { adminTags } from '../../api/api-tags';
import { platformEndpoints } from '../../api/api-endpoints';
import { toastMeta } from '../../notifications/MutationToasts';

export function useRoles(enabled = true) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminTags.roles(),
    queryFn: async ({ signal }) => (await api.get(platformEndpoints.role.collection, { signal })).data,
    enabled,
  });
}

export function useRole(roleId: number) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminTags.role(roleId),
    queryFn: async ({ signal }) => (await api.get(platformEndpoints.role.item, { path: { roleId }, signal })).data,
  });
}

/** The permission catalogue; it only changes with a new release. */
export function usePermissions() {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminTags.permissions(),
    queryFn: async ({ signal }) => (await api.get(platformEndpoints.permission.collection, { signal })).data,
    staleTime: Infinity,
  });
}

/** After any change to a role: the list, the users' roles and the signed-in person's own permissions may differ. */
function useRoleChanged() {
  const queryClient = useQueryClient();
  return (role: RoleDetails) => {
    queryClient.setQueryData(adminTags.role(role.id), role);
    void queryClient.invalidateQueries({ queryKey: adminTags.roles(), exact: true });
    void queryClient.invalidateQueries({ queryKey: adminTags.users() });
    void queryClient.invalidateQueries({ queryKey: platformTags.me() });
  };
}

export function useCreateRole() {
  const api = usePlatformApi();
  const changed = useRoleChanged();
  return useMutation({
    mutationFn: (body: RoleInput) => api.post(platformEndpoints.role.collection, { body }),
    meta: toastMeta<ApiResult<RoleDetails>>({
      success: (result) => `Role "${result.data.name}" added. Choose its permissions now.`,
      error: 'The role could not be added.',
    }),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

export function useSaveRole(roleId: number) {
  const api = usePlatformApi();
  const changed = useRoleChanged();
  return useMutation({
    mutationFn: (body: RoleInput) => api.put(platformEndpoints.role.item, { path: { roleId }, body }),
    meta: toastMeta({ success: 'The role has been saved.', error: 'The role could not be saved.' }),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

export function useAddHolder(roleId: number) {
  const api = usePlatformApi();
  const changed = useRoleChanged();
  return useMutation({
    mutationFn: (body: HolderInput) => api.post(platformEndpoints.role.holders, { path: { roleId }, body }),
    meta: toastMeta({ success: 'The role has been given.', error: 'The role could not be given.' }),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

export function useRemoveHolder(roleId: number) {
  const api = usePlatformApi();
  const changed = useRoleChanged();
  return useMutation({
    mutationFn: (holderId: number) => api.delete(platformEndpoints.role.holder, { path: { roleId, holderId } }),
    meta: toastMeta({ success: 'The role has been taken away.', error: 'The role could not be taken away.' }),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}
