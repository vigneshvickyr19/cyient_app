import { toastMeta } from '@cyient/shared-ui';
import type { AdminActionInput } from '@cyient/api-client/mppl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mpplTags } from '@/api-callers/api-tags';
import { closeIssueAsAdmin } from '@/api-callers/manage/admin-issue.api';
import { useMpplApi } from '@/hooks/useMpplApi';

/** Closes an open issue for Sourcing, with a reason; every view of issues is then out of date. */
export function useAdminCloseIssue(publicId: string) {
  const api = useMpplApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta({ success: 'The issue is closed. The buyer is emailed, with the Sourcing Lead in copy.' }),
    mutationFn: (input: AdminActionInput) => closeIssueAsAdmin(api, publicId, input),
    onSuccess: (result) => {
      queryClient.setQueryData(mpplTags.issue.detail(publicId), result.data);
      void queryClient.invalidateQueries({ queryKey: mpplTags.manage.all });
      void queryClient.invalidateQueries({ queryKey: mpplTags.issue.all });
    },
  });
}
