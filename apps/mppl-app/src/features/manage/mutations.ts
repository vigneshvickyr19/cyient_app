import type { AdminActionInput } from '@cyient/api-client/mppl';
import { useNotify } from '@cyient/shared-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMpplApi } from '../../lib/api';
import { issueKeys } from '../issues/keys';
import { manageKeys } from './keys';

/** Closes an open issue for Sourcing, with a reason; every view of issues is then out of date. */
export function useAdminCloseIssue(publicId: string) {
  const api = useMpplApi();
  const notify = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminActionInput) => api.post('/api/v1/admin/issues/{publicId}/close', { path: { publicId }, body: input }),
    onSuccess: (result) => {
      queryClient.setQueryData(issueKeys.detail(publicId), result.data);
      void queryClient.invalidateQueries({ queryKey: manageKeys.all });
      void queryClient.invalidateQueries({ queryKey: issueKeys.all });
      notify.success(result.message ?? 'The issue is closed. The buyer is emailed, with the Sourcing Lead in copy.');
    },
  });
}
