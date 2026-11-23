import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ecnTags } from '@/api-callers/api-tags';
import { listNoteAttachments } from '@/api-callers/notes/attachment.api';
import { getNote, getNoteLog, listNotes, listPendingNotes } from '@/api-callers/notes/note.api';
import { useEcnApi } from '@/hooks/useEcnApi';
import type { NoteListQuery } from '@/types/notes';

/** In progress, Closed and Search (All), ECNs, TCNs or both: paged, filtered and sorted on the server. */
export function useNoteList(query: NoteListQuery) {
  const api = useEcnApi();
  return useQuery({
    queryKey: ecnTags.note.list(query),
    queryFn: ({ signal }) => listNotes(api, query, signal),
    placeholderData: keepPreviousData,
  });
}

/** What waits for the signed-in user: CFT actions, a note to publish to the Reviewer, a review, an approval or a release. */
export function usePendingNotes(page: number, pageSize: number) {
  const api = useEcnApi();
  return useQuery({
    queryKey: ecnTags.note.pending(page, pageSize),
    queryFn: ({ signal }) => listPendingNotes(api, page, pageSize, signal),
    placeholderData: keepPreviousData,
  });
}

/** One ECN or TCN with every tab, the actions open to the user and its version. */
export function useNote(publicId: string) {
  const api = useEcnApi();
  return useQuery({
    queryKey: ecnTags.note.detail(publicId),
    queryFn: ({ signal }) => getNote(api, publicId, signal),
  });
}

export function useNoteLog(publicId: string) {
  const api = useEcnApi();
  return useQuery({
    queryKey: ecnTags.note.log(publicId),
    queryFn: ({ signal }) => getNoteLog(api, publicId, signal),
  });
}

/** The note's documents: the current version of each, or every version. */
export function useNoteAttachments(publicId: string, allVersions: boolean) {
  const api = useEcnApi();
  return useQuery({
    queryKey: ecnTags.note.attachments(publicId, allVersions),
    queryFn: ({ signal }) => listNoteAttachments(api, publicId, allVersions, signal),
  });
}
