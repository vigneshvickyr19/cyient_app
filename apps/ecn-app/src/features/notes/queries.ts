import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEcnApi } from '../../lib/api';
import { noteKeys, type NoteListQuery } from './keys';

/** In progress, Closed and Search (All), ECNs, TCNs or both: paged, filtered and sorted on the server. */
export function useNoteList(query: NoteListQuery) {
  const api = useEcnApi();
  return useQuery({
    queryKey: noteKeys.list(query),
    queryFn: ({ signal }) => api.get('/api/v1/notes', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** What waits for the signed-in user: CFT actions, a note to publish to the Reviewer, a review, an approval or a release. */
export function usePendingNotes(page: number, pageSize: number) {
  const api = useEcnApi();
  return useQuery({
    queryKey: noteKeys.pending(page, pageSize),
    queryFn: ({ signal }) => api.get('/api/v1/notes/pending', { query: { page, pageSize }, signal }),
    placeholderData: keepPreviousData,
  });
}

/** One ECN or TCN with every tab, the actions open to the user and its version. */
export function useNote(publicId: string) {
  const api = useEcnApi();
  return useQuery({
    queryKey: noteKeys.detail(publicId),
    queryFn: async ({ signal }) => (await api.get('/api/v1/notes/{publicId}', { path: { publicId }, signal })).data,
  });
}

export function useNoteLog(publicId: string) {
  const api = useEcnApi();
  return useQuery({
    queryKey: noteKeys.log(publicId),
    queryFn: async ({ signal }) => (await api.get('/api/v1/notes/{publicId}/log', { path: { publicId }, signal })).data,
  });
}

/** The note's documents: the current version of each, or every version. */
export function useNoteAttachments(publicId: string, allVersions: boolean) {
  const api = useEcnApi();
  return useQuery({
    queryKey: noteKeys.attachments(publicId, allVersions),
    queryFn: async ({ signal }) =>
      (await api.get('/api/v1/notes/{publicId}/attachments', { path: { publicId }, query: { allVersions }, signal })).data,
  });
}
