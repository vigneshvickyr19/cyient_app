import type { AdminActionInput, paths } from '@cyient/api-client/ecn';
import { platformKeys, useNotify, type RecordHistoryTabsProps } from '@cyient/shared-ui';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEcnApi } from '../../lib/api';
import { noteKeys } from '../notes/keys';
import { reportKeys } from '../reports/queries';

export type TaskQuery = NonNullable<paths['/api/v1/admin/tasks']['get']['parameters']['query']>;

const manageKeys = {
  all: ['ecn', 'manage'] as const,
  tasks: (query: TaskQuery) => [...manageKeys.all, 'tasks', query] as const,
  record: (publicId: string) => [...manageKeys.all, 'record', publicId] as const,
};

/** Open tasks (CFT members, initiators, Reviewers, Approvers, release), longest waiting first. */
export function useOpenTasks(query: TaskQuery) {
  const api = useEcnApi();
  return useQuery({
    queryKey: manageKeys.tasks(query),
    queryFn: ({ signal }) => api.get('/api/v1/admin/tasks', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** The note's history, emails and audit trail, for its Record tabs. */
export function useNoteRecord(publicId: string): Pick<RecordHistoryTabsProps, 'loaders' | 'queryKey'> {
  const api = useEcnApi();
  const path = { publicId };
  return {
    queryKey: manageKeys.record(publicId),
    loaders: {
      history: async ({ signal }) => (await api.get('/api/v1/admin/notes/{publicId}/history', { path, signal })).data,
      emails: ({ page, pageSize, signal }) => api.get('/api/v1/admin/notes/{publicId}/emails', { path, query: { page, pageSize }, signal }),
      audit: ({ page, pageSize, signal }) => api.get('/api/v1/admin/notes/{publicId}/audit', { path, query: { page, pageSize }, signal }),
    },
  };
}

/** Cancels a note not yet released; open tasks close and the initiator is emailed. Every view of notes and tasks is read again. */
export function useCancelNote(publicId: string) {
  const api = useEcnApi();
  const queryClient = useQueryClient();
  const notify = useNotify();
  return useMutation({
    mutationFn: (input: AdminActionInput) => api.post('/api/v1/admin/notes/{publicId}/cancel', { path: { publicId }, body: input }),
    onSuccess: (result) => {
      queryClient.setQueryData(noteKeys.detail(publicId), result.data);
      void queryClient.invalidateQueries({ queryKey: manageKeys.all });
      void queryClient.invalidateQueries({ queryKey: noteKeys.all });
      void queryClient.invalidateQueries({ queryKey: reportKeys.all });
      void queryClient.invalidateQueries({ queryKey: platformKeys.me() });
      notify.success(result.message ?? 'The note is cancelled and the initiator is emailed.');
    },
  });
}
