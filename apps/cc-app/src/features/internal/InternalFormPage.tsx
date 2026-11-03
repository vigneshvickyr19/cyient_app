import { ErrorState, errorMessage, InlineAlert, PageHeader, PageLoader, useNotify } from '@cyient/shared-ui';
import { useNavigate, useParams } from 'react-router';
import { InternalForm } from './InternalForm';
import { useCreateInternal, useUpdateInternal } from './mutations';
import { useInternalComplaint } from './queries';

/** New internal complaint: it gets its number (ICC/YYYY/NNNN) when it is recorded, then its action matrix is added. */
export function NewInternalPage() {
  const navigate = useNavigate();
  const notify = useNotify();
  const create = useCreateInternal();

  return (
    <>
      <PageHeader
        title="New internal complaint"
        subtitle="It is numbered as soon as it is recorded; then add its actions."
        breadcrumbs={[{ label: 'Internal complaints', to: '/internal-complaints' }, { label: 'New internal complaint' }]}
        backTo="/internal-complaints"
      />
      <InternalForm
        saving={create.isPending}
        onCancel={() => void navigate('/internal-complaints')}
        onSave={async (input) => {
          const complaint = await create.mutateAsync(input);
          notify.success(`Recorded as ${complaint.complaintNo}. Add its actions.`);
          await navigate(`/internal-complaints/${complaint.publicId}`);
        }}
      />
    </>
  );
}

/** Changes an open internal complaint; the initiator only. */
export function EditInternalPage() {
  const { publicId = '' } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const complaint = useInternalComplaint(publicId);
  const update = useUpdateInternal(publicId);

  if (complaint.isPending) return <PageLoader />;
  if (complaint.isError) return <ErrorState message={errorMessage(complaint.error)} onRetry={() => void complaint.refetch()} />;

  const details = complaint.data;

  return (
    <>
      <PageHeader
        title={`Edit ${details.complaintNo}`}
        breadcrumbs={[
          { label: 'Internal complaints', to: '/internal-complaints' },
          { label: details.complaintNo, to: `/internal-complaints/${publicId}` },
          { label: 'Edit' },
        ]}
        backTo={`/internal-complaints/${publicId}`}
      />
      {details.canEdit ? (
        <InternalForm
          key={details.version}
          complaint={details}
          saving={update.isPending}
          onCancel={() => void navigate(`/internal-complaints/${publicId}`)}
          onSave={async (input) => {
            await update.mutateAsync(input);
            notify.success('Changes saved.');
            await navigate(`/internal-complaints/${publicId}`);
          }}
        />
      ) : (
        <InlineAlert severity="warning" title="This internal complaint can't be changed">
          Only the person who recorded it can change it, and only while it is open.
        </InlineAlert>
      )}
    </>
  );
}
