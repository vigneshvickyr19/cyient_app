import type { EmailStatus, paths } from '@cyient/api-client/platform';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Tone } from '../../components/display';
import { usePlatformApi } from '../../api/HttpClientContext';
import { adminKeys } from '../adminKeys';

export type EmailQuery = NonNullable<paths['/api/v1/admin/emails']['get']['parameters']['query']>;

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
    queryKey: adminKeys.emailList(query),
    queryFn: async ({ signal }) => api.get('/api/v1/admin/emails', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

export function useEmail(emailId: number) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminKeys.email(emailId),
    queryFn: async ({ signal }) => (await api.get('/api/v1/admin/emails/{emailId}', { path: { emailId }, signal })).data,
  });
}

/** Queues a failed email to be tried again; the email comes back with its new state. */
export function useRetryEmail(emailId: number) {
  const api = usePlatformApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/v1/admin/emails/{emailId}/retry', { path: { emailId } }),
    onSuccess: (result) => {
      queryClient.setQueryData(adminKeys.email(emailId), result.data);
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.emails(), 'list'] });
    },
  });
}

/** Queues a new copy of a sent email; the answer is the new email. */
export function useResendEmail(emailId: number) {
  const api = usePlatformApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/v1/admin/emails/{emailId}/resend', { path: { emailId } }),
    onSuccess: (result) => {
      queryClient.setQueryData(adminKeys.email(result.data.id), result.data);
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.emails(), 'list'] });
    },
  });
}
