import {
  Button,
  ConfirmDialog,
  DetailList,
  ErrorState,
  errorMessage,
  LinkButton,
  PageHeader,
  PageLoader,
  SectionCard,
  StatusChip,
  useActionFailure,
} from '@cyient/shared-ui';
import { formatDate, formatDateTime } from '@cyient/shared-utils';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Stack } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router';
import { InternalActionsSection } from './InternalActionsSection';
import { internalKeys } from './keys';
import { useCloseInternal } from './mutations';
import { useInternalComplaint } from './queries';
import { internalStatusInfo } from './status';

/** One internal complaint: its details, its action matrix and, for the person who recorded it, close. */
export function InternalDetailsPage() {
  const { publicId = '' } = useParams();
  const complaint = useInternalComplaint(publicId);
  const close = useCloseInternal(publicId);
  const failed = useActionFailure(internalKeys.detail(publicId));
  const [closing, setClosing] = useState(false);

  if (complaint.isPending) return <PageLoader />;
  if (complaint.isError) {
    return <ErrorState title="This internal complaint could not be opened" message={errorMessage(complaint.error)} onRetry={() => void complaint.refetch()} />;
  }

  const details = complaint.data;

  return (
    <>
      <PageHeader
        title={details.complaintNo}
        subtitle={[details.customer.name, details.internalPartNo].filter(Boolean).join(' · ')}
        breadcrumbs={[{ label: 'Internal complaints', to: '/internal-complaints' }, { label: details.complaintNo }]}
        status={<StatusChip {...internalStatusInfo[details.status]} />}
        actions={
          details.canEdit && (
            <>
              <LinkButton to={`/internal-complaints/${publicId}/edit`} startIcon={<EditOutlinedIcon />}>
                Edit
              </LinkButton>
              <Button variant="contained" onClick={() => { setClosing(true); }}>
                Close complaint
              </Button>
            </>
          )
        }
      />

      <Stack spacing={3}>
        <SectionCard title="Internal complaint">
          <DetailList
            items={[
              { label: 'Customer', value: details.customer.name },
              { label: 'Complaint date', value: formatDate(details.complaintDate) },
              { label: 'Recorded by', value: details.initiator.name },
              { label: 'Location', value: details.location?.name },
              { label: 'Internal part no', value: details.internalPartNo },
              { label: 'Rejected quantity', value: details.rejectedQuantity === null ? null : String(details.rejectedQuantity) },
              { label: 'Detection stage', value: details.detectionStage?.name },
              { label: 'Closed', value: formatDateTime(details.closedAt) },
              { label: 'Part description', value: details.partDescription, wide: true },
              { label: 'Problem description', value: details.problemDescription, wide: true },
            ]}
          />
        </SectionCard>
        <InternalActionsSection complaint={details} />
      </Stack>

      <ConfirmDialog
        open={closing}
        title={`Close ${details.complaintNo}?`}
        message="Once closed, the internal complaint and its actions can no longer be changed."
        confirmLabel="Close complaint"
        comment="optional"
        loading={close.isPending}
        onClose={() => {
          setClosing(false);
        }}
        onConfirm={(comment) => {
          close.mutate(
            { comment: comment || null, version: details.version },
            {
              onSuccess: () => {
                setClosing(false);
              },
              onError: (error) => {
                failed(error);
                setClosing(false);
              },
            },
          );
        }}
      />
    </>
  );
}
