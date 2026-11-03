import { ErrorState, errorMessage, InlineAlert, PageHeader, PageLoader, useNotify } from '@cyient/shared-ui';
import { useNavigate, useParams } from 'react-router';
import { ComplaintForm } from './ComplaintForm';
import { useCreateComplaint, useUpdateComplaint } from './mutations';
import { useComplaint } from './queries';

/** New complaint: saves the first page as a draft, then opens it to add containment actions and evidence and publish it. */
export function NewComplaintPage() {
  const navigate = useNavigate();
  const notify = useNotify();
  const create = useCreateComplaint();

  return (
    <>
      <PageHeader
        title="New complaint"
        subtitle="Save the draft, then add the containment actions and evidence, and publish it to the team."
        breadcrumbs={[{ label: 'External complaints', to: '/complaints' }, { label: 'New complaint' }]}
        backTo="/complaints"
      />
      <ComplaintForm
        saving={create.isPending}
        onCancel={() => void navigate('/complaints')}
        onSave={async (input) => {
          const complaint = await create.mutateAsync(input);
          notify.success('Draft saved. Only you can see it until it is published.');
          await navigate(`/complaints/${complaint.publicId}`);
        }}
      />
    </>
  );
}

/** Changes the first page and the team; the initiator can do this until the complaint is closed. */
export function EditComplaintPage() {
  const { publicId = '' } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const complaint = useComplaint(publicId);
  const update = useUpdateComplaint(publicId);

  if (complaint.isPending) return <PageLoader />;
  if (complaint.isError) return <ErrorState message={errorMessage(complaint.error)} onRetry={() => void complaint.refetch()} />;

  const details = complaint.data;
  const title = details.complaintNo ?? 'Draft complaint';

  return (
    <>
      <PageHeader
        title={`Edit ${title}`}
        breadcrumbs={[{ label: 'External complaints', to: '/complaints' }, { label: title, to: `/complaints/${publicId}` }, { label: 'Edit' }]}
        backTo={`/complaints/${publicId}`}
      />
      {details.allowedActions?.canEdit ? (
        <ComplaintForm
          key={details.version}
          complaint={details}
          saving={update.isPending}
          onCancel={() => void navigate(`/complaints/${publicId}`)}
          onSave={async (input) => {
            await update.mutateAsync(input);
            notify.success('Changes saved.');
            await navigate(`/complaints/${publicId}`);
          }}
        />
      ) : (
        <InlineAlert severity="warning" title="This complaint can't be changed">
          Only the initiator can change the first page, and only until the complaint is closed.
        </InlineAlert>
      )}
    </>
  );
}
