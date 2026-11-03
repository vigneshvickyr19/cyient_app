import {
  Button,
  ConfirmDialog,
  ErrorState,
  errorMessage,
  LinkButton,
  PageHeader,
  PageLoader,
  RecordHistoryTabs,
  StatusChip,
  useActionFailure,
} from '@cyient/shared-ui';
import { useState } from 'react';
import { useParams } from 'react-router';
import { complaintKeys } from '../complaints/keys';
import { useComplaint } from '../complaints/queries';
import { statusInfo } from '../complaints/status';
import { useCancelComplaint, useComplaintRecord } from './queries';

/** One complaint for administrators: cancel it with a reason, and see its history, emails and audit trail. */
export function ManageComplaintPage() {
  const { publicId = '' } = useParams();
  const failed = useActionFailure(complaintKeys.detail(publicId));
  const complaint = useComplaint(publicId);
  const cancel = useCancelComplaint(publicId);
  const record = useComplaintRecord(publicId);
  const [cancelling, setCancelling] = useState(false);

  if (complaint.isPending) return <PageLoader />;
  if (complaint.isError) return <ErrorState message={errorMessage(complaint.error)} onRetry={() => void complaint.refetch()} />;

  const details = complaint.data;
  const title = details.complaintNo ?? 'Draft complaint';
  const cancellable = details.status !== 'Closed' && details.status !== 'Cancelled';

  return (
    <>
      <PageHeader
        title={title}
        subtitle={`${details.customer.name ?? ''} · raised by ${details.initiator.name ?? ''}`}
        breadcrumbs={[{ label: 'All complaints (administration)', to: '/manage/complaints' }, { label: title }]}
        backTo="/manage/complaints"
        status={<StatusChip {...statusInfo[details.status]} />}
        actions={
          <>
            <LinkButton to={`/complaints/${publicId}`}>Open complaint</LinkButton>
            {cancellable && (
              <Button color="error" variant="outlined" onClick={() => { setCancelling(true); }}>
                Cancel complaint
              </Button>
            )}
          </>
        }
      />
      <RecordHistoryTabs {...record} />

      <ConfirmDialog
        open={cancelling}
        title={`Cancel ${title}?`}
        message="Open actions close and the initiator is emailed. This can't be undone."
        confirmLabel="Cancel complaint"
        cancelLabel="Keep it"
        danger
        comment="required"
        commentLabel="Reason"
        loading={cancel.isPending}
        onClose={() => { setCancelling(false); }}
        onConfirm={(reason) => {
          cancel.mutate({ reason, version: details.version }, { onSuccess: () => { setCancelling(false); }, onError: failed });
        }}
      />
    </>
  );
}
