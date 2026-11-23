import type { AdminActionInput } from '@cyient/api-client/ecn';
import { platformTags, type RecordHistoryTabsProps, toastMeta } from '@cyient/shared-ui';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ecnTags } from '@/api-callers/api-tags';
import { cancelNote, getNoteHistory, listNoteAudit, listNoteEmails } from '@/api-callers/manage/admin-note.api';
import { listOpenTasks } from '@/api-callers/manage/task.api';
import { useEcnApi } from '@/hooks/useEcnApi';
import type { TaskQuery } from '@/types/notes';

/** Open tasks (CFT members, initiators, Reviewers, Approvers, release), longest waiting first. */
export function useOpenTasks(query: TaskQuery) {
  const api = useEcnApi();
  return useQuery({
    queryKey: ecnTags.manage.tasks(query),
    queryFn: ({ signal }) => listOpenTasks(api, query, signal),
    placeholderData: keepPreviousData,
  });
}

/** The note's history, emails and audit trail, for its Record tabs. */
export function useNoteRecord(publicId: string): Pick<RecordHistoryTabsProps, 'loaders' | 'queryKey'> {
  const api = useEcnApi();
  return {
    queryKey: ecnTags.manage.record(publicId),
    loaders: {
      history: ({ signal }) => getNoteHistory(api, publicId, signal),
      emails: ({ page, pageSize, signal }) => listNoteEmails(api, publicId, page, pageSize, signal),
      audit: ({ page, pageSize, signal }) => listNoteAudit(api, publicId, page, pageSize, signal),
    },
  };
}

/** Cancels a note not yet released; open tasks close and the initiator is emailed. Every view of notes and tasks is read again. */
export function useCancelNote(publicId: string) {
  const api = useEcnApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta({ success: 'The note is cancelled and the initiator is emailed.' }),
    mutationFn: (input: AdminActionInput) => cancelNote(api, publicId, input),
    onSuccess: (result) => {
      queryClient.setQueryData(ecnTags.note.detail(publicId), result.data);
      void queryClient.invalidateQueries({ queryKey: ecnTags.manage.all });
      void queryClient.invalidateQueries({ queryKey: ecnTags.note.all });
      void queryClient.invalidateQueries({ queryKey: ecnTags.report.all });
      void queryClient.invalidateQueries({ queryKey: platformTags.me() });
    },
  });
}
