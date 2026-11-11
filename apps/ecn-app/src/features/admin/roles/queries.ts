import type { HolderInput, RoleDetails, RoleInput } from '@cyient/api-client/platform';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlatformApi } from '@cyient/shared-ui';
import { platformKeys } from '@cyient/shared-ui';
import { adminKeys } from '../adminKeys';

export function useRoles(enabled = true) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminKeys.roles(),
    queryFn: async ({ signal }) => (await api.get('/api/v1/admin/roles', { signal })).data,
    enabled,
  });
}

export function useRole(roleId: number) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminKeys.role(roleId),
    queryFn: async ({ signal }) => (await api.get('/api/v1/admin/roles/{roleId}', { path: { roleId }, signal })).data,
  });
}

/** The permission catalogue; it only changes with a new release. */
export function usePermissions() {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminKeys.permissions(),
    queryFn: async ({ signal }) => (await api.get('/api/v1/admin/permissions', { signal })).data,
    staleTime: Infinity,
  });
}

/** After any change to a role: the list, the users' roles and the signed-in person's own permissions may differ. */
function useRoleChanged() {
  const queryClient = useQueryClient();
  return (role: RoleDetails) => {
    queryClient.setQueryData(adminKeys.role(role.id), role);
    void queryClient.invalidateQueries({ queryKey: adminKeys.roles(), exact: true });
    void queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    void queryClient.invalidateQueries({ queryKey: platformKeys.me() });
  };
}

export function useCreateRole() {
  const api = usePlatformApi();
  const changed = useRoleChanged();
  return useMutation({
    mutationFn: (body: RoleInput) => api.post('/api/v1/admin/roles', { body }),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

export function useSaveRole(roleId: number) {
  const api = usePlatformApi();
  const changed = useRoleChanged();
  return useMutation({
    mutationFn: (body: RoleInput) => api.put('/api/v1/admin/roles/{roleId}', { path: { roleId }, body }),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

export function useAddHolder(roleId: number) {
  const api = usePlatformApi();
  const changed = useRoleChanged();
  return useMutation({
    mutationFn: (body: HolderInput) => api.post('/api/v1/admin/roles/{roleId}/holders', { path: { roleId }, body }),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}

export function useRemoveHolder(roleId: number) {
  const api = usePlatformApi();
  const changed = useRoleChanged();
  return useMutation({
    mutationFn: (holderId: number) => api.delete('/api/v1/admin/roles/{roleId}/holders/{holderId}', { path: { roleId, holderId } }),
    onSuccess: (result) => {
      changed(result.data);
    },
  });
}
