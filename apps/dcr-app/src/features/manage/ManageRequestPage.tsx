import type { RequestDetails } from '@cyient/api-client/dcr';
import {
  applyServerErrors,
  Button,
  ConfirmDialog,
  ErrorState,
  errorMessage,
  Form,
  FormDatePicker,
  FormInput,
  FormTextArea,
  LinkButton,
  Modal,
  PageHeader,
  PageLoader,
  RecordHistoryTabs,
  StatusChip,
  useNotify,
} from '@cyient/shared-ui';
import { maxLength, notInPast, required } from '@cyient/shared-utils';
import { Stack } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { useRequest } from '../requests/queries';
import { statusInfo } from '../requests/status';
import { useCancelRequest, useCorrectRequest, useRequestRecord } from './queries';

const open = (status: RequestDetails['status']) => !['Approved', 'Cancelled', 'Withdrawn', 'ImsRejected', 'DeptManagerRejected', 'DeptHeadRejected', 'MrRejected'].includes(status);

interface CorrectionValues {
  documentReference: string;
  currentRevisionNo: string;
  documentDescription: string;
  reasonForChanges: string;
  riskToQms: string;
  riskToDevices: string;
  needByDate: string | null;
  effectiveImplementationDate: string | null;
  reason: string;
}

/** Corrects the details of a submitted DCR; only changed fields are sent, and the old values stay in the audit trail. */
function CorrectDialog({ request, onClose }: { request: RequestDetails; onClose: () => void }) {
  const notify = useNotify();
  const correct = useCorrectRequest(request.publicId);
  const defaults: CorrectionValues = {
    documentReference: request.documentReference,
    currentRevisionNo: request.currentRevisionNo,
    documentDescription: request.documentDescription,
    reasonForChanges: request.reasonForChanges,
    riskToQms: request.riskToQms,
    riskToDevices: request.riskToDevices,
    needByDate: request.needByDate,
    effectiveImplementationDate: request.effectiveImplementationDate,
    reason: '',
  };
  const form = useForm<CorrectionValues>({ defaultValues: defaults });

  const submit = (values: CorrectionValues) => {
    const changed = <K extends keyof CorrectionValues>(key: K) => (values[key] !== defaults[key] ? values[key] : null);
    correct.mutate(
      {
        documentReference: changed('documentReference'),
        currentRevisionNo: changed('currentRevisionNo'),
        documentDescription: changed('documentDescription'),
        reasonForChanges: changed('reasonForChanges'),
        riskToQms: changed('riskToQms'),
        riskToDevices: changed('riskToDevices'),
        needByDate: changed('needByDate'),
        effectiveImplementationDate: changed('effectiveImplementationDate'),
        reason: values.reason.trim(),
        version: request.version,
      },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!applyServerErrors(error, form)) notify.error(error);
        },
      },
    );
  };

  return (
    <Modal
      open
      title={`Correct ${request.requestNo ?? 'request'}`}
      onClose={onClose}
      busy={correct.isPending}
      maxWidth="md"
      actions={
        <>
          <Button onClick={onClose} disabled={correct.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="correct-form" variant="contained" loading={correct.isPending}>
            Save correction
          </Button>
        </>
      }
    >
      <Form form={form} onSubmit={submit} id="correct-form">
        <Stack spacing={2}>
          <FormInput<CorrectionValues> name="documentReference" label="Document reference" rules={{ ...required('Document Reference'), ...maxLength(100, 'Document Reference') }} />
          <FormInput<CorrectionValues> name="currentRevisionNo" label="Current revision no" rules={{ ...required('Current Revision No'), ...maxLength(20, 'Current Revision No') }} />
          <FormTextArea<CorrectionValues> name="documentDescription" label="Document description" rules={required('Document Description')} />
          <FormTextArea<CorrectionValues> name="reasonForChanges" label="Reason for changes" rules={required('Reason for Changes')} />
          <FormTextArea<CorrectionValues> name="riskToQms" label="Risk and impact on the QMS" rules={required('Risk and impact on the QMS')} />
          <FormTextArea<CorrectionValues> name="riskToDevices" label="Risk and impact on the devices" rules={required('Risk and impact on the devices')} />
          <FormDatePicker<CorrectionValues> name="needByDate" label="Need by date" rules={required('Need By Date')} />
          {request.releasedStatus === 'Released' && (
            <FormDatePicker<CorrectionValues> name="effectiveImplementationDate" label="Effective implementation date" rules={{ validate: notInPast('Effective Implementation Date') }} />
          )}
          <FormTextArea<CorrectionValues> name="reason" label="Reason for the correction" minRows={2} rules={required('A reason')} />
        </Stack>
      </Form>
    </Modal>
  );
}

/** One request for administrators: cancel it, correct it, and see its history, emails and audit trail. */
export function ManageRequestPage() {
  const { publicId = '' } = useParams();
  const notify = useNotify();
  const request = useRequest(publicId);
  const cancel = useCancelRequest(publicId);
  const record = useRequestRecord(publicId);
  const [dialog, setDialog] = useState<'cancel' | 'correct' | null>(null);

  if (request.isPending) return <PageLoader />;
  if (request.isError) return <ErrorState message={errorMessage(request.error)} onRetry={() => void request.refetch()} />;

  const details = request.data;
  const title = details.requestNo ?? 'Draft request';

  return (
    <>
      <PageHeader
        title={title}
        subtitle={details.documentReference}
        breadcrumbs={[{ label: 'All requests (administration)', to: '/manage/requests' }, { label: title }]}
        backTo="/manage/requests"
        status={<StatusChip {...statusInfo[details.status]} />}
        actions={
          <>
            <LinkButton to={`/requests/${publicId}`}>Open request</LinkButton>
            {details.status !== 'Draft' && details.status !== 'Cancelled' && <Button onClick={() => { setDialog('correct'); }}>Correct</Button>}
            {open(details.status) && (
              <Button color="error" variant="outlined" onClick={() => { setDialog('cancel'); }}>
                Cancel request
              </Button>
            )}
          </>
        }
      />
      <RecordHistoryTabs {...record} />

      <ConfirmDialog
        open={dialog === 'cancel'}
        title={`Cancel ${title}?`}
        message="Open reviews close and the requester is emailed. This can't be undone."
        confirmLabel="Cancel request"
        cancelLabel="Keep it"
        danger
        comment="required"
        commentLabel="Reason"
        loading={cancel.isPending}
        onClose={() => { setDialog(null); }}
        onConfirm={(reason) => {
          cancel.mutate({ reason, version: details.version }, { onSuccess: () => { setDialog(null); }, onError: (error) => { notify.error(error); } });
        }}
      />
      {dialog === 'correct' && <CorrectDialog request={details} onClose={() => { setDialog(null); }} />}
    </>
  );
}
