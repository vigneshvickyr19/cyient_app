import { ErrorState, errorMessage, InlineAlert, PageHeader, PageLoader, useNotify } from '@cyient/shared-ui';
import { useNavigate, useParams } from 'react-router';
import { useCreateDraft, useUpdateDraft } from './mutations';
import { useRequest } from './queries';
import { RequestForm } from './RequestForm';

/** New deviation: saves a draft, then opens it to add documents and submit it. */
export function NewRequestPage() {
  const navigate = useNavigate();
  const notify = useNotify();
  const create = useCreateDraft();

  return (
    <>
      <PageHeader
        title="New deviation"
        subtitle="Save the draft, then add any reference documents and submit it."
        breadcrumbs={[{ label: 'Requests', to: '/requests' }, { label: 'New deviation' }]}
        backTo="/requests"
      />
      <RequestForm
        saving={create.isPending}
        onCancel={() => void navigate('/requests')}
        onSave={async (draft) => {
          const request = await create.mutateAsync(draft);
          notify.success('Draft saved. Add any reference documents, then submit it.');
          await navigate(`/requests/${request.publicId}`);
        }}
      />
    </>
  );
}

/** Changes a draft; only its initiator can, and only before it is submitted. */
export function EditRequestPage() {
  const { publicId = '' } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const request = useRequest(publicId);
  const update = useUpdateDraft(publicId);

  if (request.isPending) return <PageLoader />;
  if (request.isError) return <ErrorState message={errorMessage(request.error)} onRetry={() => void request.refetch()} />;

  const details = request.data;
  const title = details.requestNo ?? 'Draft deviation';

  return (
    <>
      <PageHeader
        title={`Edit ${title}`}
        breadcrumbs={[{ label: 'Requests', to: '/requests' }, { label: title, to: `/requests/${publicId}` }, { label: 'Edit' }]}
        backTo={`/requests/${publicId}`}
      />
      {details.allowedActions?.canEdit ? (
        <RequestForm
          key={details.version}
          request={details}
          saving={update.isPending}
          onCancel={() => void navigate(`/requests/${publicId}`)}
          onSave={async (draft) => {
            await update.mutateAsync(draft);
            notify.success('Changes saved.');
            await navigate(`/requests/${publicId}`);
          }}
        />
      ) : (
        <InlineAlert severity="warning" title="This deviation can't be changed">
          Only the initiator can change a deviation, and only while it is a draft.
        </InlineAlert>
      )}
    </>
  );
}
