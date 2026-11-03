import type { RequestDetails, ReviewerDetails } from '@cyient/api-client/dn';
import {
  applyServerErrors,
  Button,
  ConfirmDialog,
  ErrorState,
  errorMessage,
  Form,
  FormDropdown,
  FormInput,
  FormPeoplePicker,
  FormTextArea,
  LinkButton,
  Modal,
  PageHeader,
  PageLoader,
  PeopleListPicker,
  PeoplePicker,
  RecordHistoryTabs,
  StatusChip,
  useActionFailure,
  type PersonOption,
} from '@cyient/shared-ui';
import { maxLength, required } from '@cyient/shared-utils';
import AddIcon from '@mui/icons-material/Add';
import { Stack } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { requestKeys } from '../requests/keys';
import { useRequest } from '../requests/queries';
import { InformedPeople, ReviewerSequence } from '../requests/ReviewersSection';
import { inOrder, isOpenStep, MAX_INFORMED, statusInfo } from '../requests/status';
import {
  useAddReviewer,
  useChangeReviewer,
  useCloseRequest,
  useRemoveReviewer,
  useRequestRecord,
  useSetInformedPeople,
} from './queries';

function ChangePersonDialog({ request, step, onClose }: { request: RequestDetails; step: ReviewerDetails; onClose: () => void }) {
  const change = useChangeReviewer(request.publicId);
  const failed = useActionFailure(requestKeys.detail(request.publicId), { onConflict: onClose });
  const [person, setPerson] = useState<PersonOption | null>(null);
  const waitingHere = step.id === request.currentReviewerId && request.status === 'PendingApproval';

  return (
    <ConfirmDialog
      open
      title={`Change ${step.name}`}
      message={`Now ${step.user.name ?? 'nobody'}.${waitingHere ? ' The deviation is waiting at this step, so the new person gets it and is emailed.' : ''}`}
      confirmLabel="Change person"
      comment="required"
      commentLabel="Reason"
      canConfirm={person !== null}
      loading={change.isPending}
      onClose={onClose}
      onConfirm={(reason) => {
        change.mutate({ reviewerId: step.id, input: { userId: person?.id ?? null, reason, version: request.version } }, { onSuccess: onClose, onError: failed });
      }}
    >
      <PeoplePicker label="New person" required value={person} onChange={setPerson} excludeIds={[request.initiator.id, step.user.id]} />
    </ConfirmDialog>
  );
}

function RemoveStepDialog({ request, step, onClose }: { request: RequestDetails; step: ReviewerDetails; onClose: () => void }) {
  const remove = useRemoveReviewer(request.publicId);
  const failed = useActionFailure(requestKeys.detail(request.publicId), { onConflict: onClose });
  return (
    <ConfirmDialog
      open
      title={`Remove ${step.name}?`}
      message={`${step.user.name ?? 'This person'} will no longer review this deviation.`}
      confirmLabel="Remove step"
      danger
      comment="required"
      commentLabel="Reason"
      loading={remove.isPending}
      onClose={onClose}
      onConfirm={(reason) => {
        remove.mutate({ reviewerId: step.id, input: { reason, version: request.version } }, { onSuccess: onClose, onError: failed });
      }}
    />
  );
}

interface AddReviewerValues {
  afterReviewerId: number | null;
  name: string;
  person: PersonOption | null;
  reason: string;
}

/** Adds a step after one that is not done yet; the head of department stays last. */
function AddReviewerDialog({ request, onClose }: { request: RequestDetails; onClose: () => void }) {
  const failed = useActionFailure(requestKeys.detail(request.publicId));
  const add = useAddReviewer(request.publicId);
  const form = useForm<AddReviewerValues>({ defaultValues: { afterReviewerId: null, name: '', person: null, reason: '' } });
  const after = inOrder(request.reviewers)
    .filter((step) => isOpenStep(step.status) && step.kind !== 'HeadOfDepartment' && step.kind !== 'FinalApprover')
    .map((step) => ({ value: step.id, label: `${step.name} (${step.user.name ?? '—'})` }));

  const submit = (values: AddReviewerValues) => {
    add.mutate(
      { afterReviewerId: values.afterReviewerId, name: values.name.trim(), userId: values.person?.id ?? null, reason: values.reason.trim(), version: request.version },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (!applyServerErrors(error, form, { userId: 'person' })) failed(error);
        },
      },
    );
  };

  return (
    <Modal
      open
      title="Add a reviewer"
      onClose={onClose}
      busy={add.isPending}
      actions={
        <>
          <Button onClick={onClose} disabled={add.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="add-reviewer-form" variant="contained" loading={add.isPending}>
            Add reviewer
          </Button>
        </>
      }
    >
      <Form form={form} onSubmit={submit} id="add-reviewer-form">
        <Stack spacing={2}>
          <FormDropdown<AddReviewerValues, number> name="afterReviewerId" label="Comes after" options={after} rules={{ required: 'Choose the step the new reviewer comes after.' }} />
          <FormInput<AddReviewerValues> name="name" label="Step name" helperText="Shown as the Pending Role." rules={{ ...required('Name'), ...maxLength(50, 'Name') }} />
          <FormPeoplePicker<AddReviewerValues> name="person" label="Reviewer" excludeIds={[request.initiator.id]} rules={{ required: 'Choose the reviewer.' }} />
          <FormTextArea<AddReviewerValues> name="reason" label="Reason" minRows={2} rules={{ required: 'A comment is required.' }} />
        </Stack>
      </Form>
    </Modal>
  );
}

function InformedDialog({ request, onClose }: { request: RequestDetails; onClose: () => void }) {
  const save = useSetInformedPeople(request.publicId);
  const failed = useActionFailure(requestKeys.detail(request.publicId), { onConflict: onClose });
  const [people, setPeople] = useState<PersonOption[]>(() => request.informedPeople.map((person) => ({ id: person.id, name: person.name ?? '' })));

  return (
    <ConfirmDialog
      open
      title="Change the people to be informed"
      message="They are emailed when the deviation is approved."
      confirmLabel="Save"
      comment="required"
      commentLabel="Reason"
      loading={save.isPending}
      onClose={onClose}
      onConfirm={(reason) => {
        save.mutate({ userIds: people.map((person) => person.id), reason, version: request.version }, { onSuccess: onClose, onError: failed });
      }}
    >
      <PeopleListPicker
        label="Add a person"
        listLabel="People to be informed"
        value={people}
        onChange={setPeople}
        max={MAX_INFORMED}
        helperText={people.length === 0 ? 'Nobody will be informed.' : undefined}
      />
    </ConfirmDialog>
  );
}

type Dialog = { kind: 'close' | 'add' | 'informed' } | { kind: 'change' | 'remove'; step: ReviewerDetails } | null;

/** One deviation for administrators: Close DN, change its people while not yet approved, and see its history, emails and audit trail. */
export function ManageRequestPage() {
  const { publicId = '' } = useParams();
  const request = useRequest(publicId);
  const close = useCloseRequest(publicId);
  const record = useRequestRecord(publicId);
  const [dialog, setDialog] = useState<Dialog>(null);
  const dismiss = () => {
    setDialog(null);
  };
  const closeFailed = useActionFailure(requestKeys.detail(publicId), { onConflict: dismiss });

  if (request.isPending) return <PageLoader />;
  if (request.isError) return <ErrorState message={errorMessage(request.error)} onRetry={() => void request.refetch()} />;

  const details = request.data;
  const title = details.requestNo ?? 'Draft deviation';
  const canChangePeople = details.allowedActions?.canChangePeople === true;
  const canAdd = canChangePeople && details.reviewers.some((step) => isOpenStep(step.status) && step.kind !== 'HeadOfDepartment' && step.kind !== 'FinalApprover');

  return (
    <>
      <PageHeader
        title={title}
        subtitle={`${details.changeCategory.name} · ${details.initiator.name ?? ''}`}
        breadcrumbs={[{ label: 'All requests (administration)', to: '/manage/requests' }, { label: title }]}
        backTo="/manage/requests"
        status={<StatusChip {...statusInfo[details.status]} />}
        actions={
          <>
            <LinkButton to={`/requests/${publicId}`}>Open request</LinkButton>
            {details.allowedActions?.canClose && (
              <Button color="error" variant="outlined" onClick={() => { setDialog({ kind: 'close' }); }}>
                Close DN
              </Button>
            )}
          </>
        }
      />

      <Stack spacing={3}>
        <ReviewerSequence
          request={details}
          headerActions={
            canAdd && (
              <Button startIcon={<AddIcon />} onClick={() => { setDialog({ kind: 'add' }); }}>
                Add reviewer
              </Button>
            )
          }
          actions={
            canChangePeople
              ? (step) =>
                  isOpenStep(step.status) && (
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button size="small" aria-label={`Change the person in ${step.name}`} onClick={() => { setDialog({ kind: 'change', step }); }}>
                        Change
                      </Button>
                      {step.status === 'Waiting' && (
                        <Button size="small" color="error" aria-label={`Remove ${step.name}`} onClick={() => { setDialog({ kind: 'remove', step }); }}>
                          Remove
                        </Button>
                      )}
                    </Stack>
                  )
              : undefined
          }
        />
        <InformedPeople
          request={details}
          actions={canChangePeople && <Button onClick={() => { setDialog({ kind: 'informed' }); }}>Change</Button>}
        />
        <RecordHistoryTabs {...record} />
      </Stack>

      <ConfirmDialog
        open={dialog?.kind === 'close'}
        title={`Close ${title}?`}
        message="Open tasks are cancelled and no further emails or reminders follow. Nobody is emailed. This can't be undone."
        confirmLabel="Close DN"
        cancelLabel="Keep it open"
        danger
        comment="required"
        loading={close.isPending}
        onClose={dismiss}
        onConfirm={(reason) => {
          close.mutate({ reason, version: details.version }, { onSuccess: dismiss, onError: closeFailed });
        }}
      />
      {dialog?.kind === 'add' && <AddReviewerDialog request={details} onClose={dismiss} />}
      {dialog?.kind === 'informed' && <InformedDialog request={details} onClose={dismiss} />}
      {dialog?.kind === 'change' && <ChangePersonDialog request={details} step={dialog.step} onClose={dismiss} />}
      {dialog?.kind === 'remove' && <RemoveStepDialog request={details} step={dialog.step} onClose={dismiss} />}
    </>
  );
}
