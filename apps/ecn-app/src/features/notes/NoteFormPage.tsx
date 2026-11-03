import { ErrorState, errorMessage, InlineAlert, PageHeader, PageLoader, useNotify } from '@cyient/shared-ui';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useCreateDraft, useUpdateDraft, useUploadAttachment } from './mutations';
import { type PendingUpload, NoteForm } from './NoteForm';
import { useNote } from './queries';
import { isNoteType, typeLabels } from './status';

/**
 * Uploads the documents chosen on the form once the draft is saved. A failed upload doesn't undo the draft: the user
 * is told and sent to the Attachments tab to add it again.
 */
function useUploadAll() {
  const upload = useUploadAttachment();
  const notify = useNotify();
  return {
    uploading: upload.isPending,
    run: async (publicId: string, uploads: readonly PendingUpload[]): Promise<boolean> => {
      for (const { file, kind } of uploads) {
        try {
          await upload.mutateAsync({ publicId, file, kind });
        } catch (error) {
          notify.error(error, `${file.name} could not be uploaded. Add it again on the Attachments tab.`);
          return false;
        }
      }
      return true;
    },
  };
}

/** New ECN / New TCN: saves the draft (and gets its number), then opens it to fill the CFT team. */
export function NewNotePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const notify = useNotify();
  const create = useCreateDraft();
  const uploads = useUploadAll();
  const typeParam = params.get('type');
  const type = isNoteType(typeParam) ? typeParam : null;
  const title = type ? `New ${typeLabels[type]}` : 'New ECN or TCN';

  return (
    <>
      <PageHeader
        title={title}
        subtitle="Save the draft, then name the CFT team and send the meeting notification."
        breadcrumbs={[{ label: 'In progress', to: '/notes' }, { label: title }]}
        backTo="/notes"
      />
      <NoteForm
        type={type}
        saving={create.isPending || uploads.uploading}
        onCancel={() => void navigate('/notes')}
        onSave={async (draft, files) => {
          const note = await create.mutateAsync(draft);
          const uploaded = await uploads.run(note.publicId, files);
          if (uploaded) notify.success(`${typeLabels[note.noteType]} ${note.noteNo} saved as a draft. Name the CFT team next.`);
          await navigate(`/notes/${note.publicId}${uploaded ? '?tab=team' : '?tab=attachments'}`);
        }}
      />
    </>
  );
}

/** Changes the front page of the initiator's draft. */
export function EditNotePage() {
  const { publicId = '' } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const note = useNote(publicId);
  const update = useUpdateDraft(publicId);
  const uploads = useUploadAll();

  if (note.isPending) return <PageLoader />;
  if (note.isError) return <ErrorState message={errorMessage(note.error)} onRetry={() => void note.refetch()} />;

  const details = note.data;
  const title = `${typeLabels[details.noteType]} ${details.noteNo}`;

  return (
    <>
      <PageHeader
        title={`Edit ${title}`}
        breadcrumbs={[{ label: 'In progress', to: '/notes' }, { label: title, to: `/notes/${publicId}` }, { label: 'Edit' }]}
        backTo={`/notes/${publicId}`}
      />
      {details.allowedActions?.canEdit ? (
        <NoteForm
          key={details.version}
          note={details}
          saving={update.isPending || uploads.uploading}
          onCancel={() => void navigate(`/notes/${publicId}`)}
          onSave={async (draft, files) => {
            await update.mutateAsync(draft);
            const uploaded = await uploads.run(publicId, files);
            if (uploaded) notify.success('Changes saved.');
            await navigate(`/notes/${publicId}${uploaded ? '' : '?tab=attachments'}`);
          }}
        />
      ) : (
        <InlineAlert severity="warning" title="This note can't be changed">
          Only the initiator can change the front page, and only while the note is a draft.
        </InlineAlert>
      )}
    </>
  );
}
