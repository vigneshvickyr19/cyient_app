import type { EmailStatus, paths } from '@cyient/api-client/platform';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Tone } from '../../index';
import { usePlatformApi } from '../../index';
import { adminTags } from '../../api/api-tags';
import { platformEndpoints } from '../../api/api-endpoints';
import { toastMeta } from '../../notifications/MutationToasts';

export type EmailQuery = NonNullable<paths[typeof platformEndpoints.email.collection]['get']['parameters']['query']>;

export const emailStatuses = ['Pending', 'Sending', 'Sent', 'Failed'] as const satisfies readonly EmailStatus[];

export function emailStatusTone(status: EmailStatus): Tone {
  switch (status) {
    case 'Pending':
    case 'Sending':
      return 'info';
    case 'Sent':
      return 'success';
    case 'Failed':
      return 'error';
  }
}

export function useEmails(query: EmailQuery) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminTags.emailList(query),
    queryFn: async ({ signal }) => api.get(platformEndpoints.email.collection, { query, signal }),
    placeholderData: keepPreviousData,
  });
}

export function useEmail(emailId: number) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminTags.email(emailId),
    queryFn: async ({ signal }) => (await api.get(platformEndpoints.email.item, { path: { emailId }, signal })).data,
  });
}

/** Queues a failed email to be tried again; the email comes back with its new state. */
export function useRetryEmail(emailId: number) {
  const api = usePlatformApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(platformEndpoints.email.retry, { path: { emailId } }),
    meta: toastMeta({ success: 'The email is queued to be tried again.', error: 'The email could not be retried.' }),
    onSuccess: (result) => {
      queryClient.setQueryData(adminTags.email(emailId), result.data);
      void queryClient.invalidateQueries({ queryKey: adminTags.emailLists() });
    },
  });
}

/** Queues a new copy of a sent email; the answer is the new email. */
export function useResendEmail(emailId: number) {
  const api = usePlatformApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(platformEndpoints.email.resend, { path: { emailId } }),
    meta: toastMeta({ success: 'A new copy of the email is queued.', error: 'The email could not be resent.' }),
    onSuccess: (result) => {
      queryClient.setQueryData(adminTags.email(result.data.id), result.data);
      void queryClient.invalidateQueries({ queryKey: adminTags.emailLists() });
    },
  });
}
