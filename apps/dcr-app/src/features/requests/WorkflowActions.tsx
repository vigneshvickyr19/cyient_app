import type { RequestDetails } from '@cyient/api-client/dcr';
import { Button, ConfirmDialog, DateField, LinkButton, useActionFailure } from '@cyient/shared-ui';
import { businessToday } from '@cyient/shared-utils';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Typography } from '@mui/material';
import { useState } from 'react';
import { requestKeys } from './keys';
import { useRelease, useWorkflowAction, type WorkflowStep } from './mutations';

type Dialog = WorkflowStep | 'release' | null;

/** How each step asks: its button, its question and whether a comment is needed (BRD-05: revert and reject need one). */
const steps: Record<WorkflowStep, { label: string; title: string; message: string; comment: 'optional' | 'required'; danger?: boolean }> = {
  submit: {
    label: 'Submit',
    title: 'Submit this request?',
    message: 'It goes to the IMS team for review. You can no longer change it unless it is sent back to you.',
    comment: 'optional',
  },
  approve: { label: 'Approve', title: 'Approve this request?', message: 'It moves on to the next review.', comment: 'optional' },
  revert: {
    label: 'Send back',
    title: 'Send back to the requester?',
    message: 'The requester can change it and submit it again; it then starts again at IMS Review.',
    comment: 'required',
  },
  reject: { label: 'Reject', title: 'Reject this request?', message: 'The requester is emailed, with the IMS team in copy. This ends the request.', comment: 'required', danger: true },
};

/** The buttons for what the signed-in user may do now, as the API says (allowedActions). */
export function WorkflowActions({ request }: { request: RequestDetails }) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [effectiveDate, setEffectiveDate] = useState<string | null>(null);
  const action = useWorkflowAction(request.publicId);
  const release = useRelease(request.publicId);
  const allowed = request.allowedActions;

  // Someone acted in between: show the request as it is now
  const failed = useActionFailure(requestKeys.detail(request.publicId), {
    onConflict: () => {
      setDialog(null);
    },
  });

  const available: WorkflowStep[] = [
    ...(allowed?.canSubmit ? (['submit'] as const) : []),
    ...(allowed?.canApprove ? (['approve'] as const) : []),
    ...(allowed?.canRevert ? (['revert'] as const) : []),
    ...(allowed?.canReject ? (['reject'] as const) : []),
  ];
  const step = dialog && dialog !== 'release' ? steps[dialog] : null;

  return (
    <>
      {allowed?.canEdit && (
        <LinkButton to={`/requests/${request.publicId}/edit`} startIcon={<EditOutlinedIcon />}>
          Edit
        </LinkButton>
      )}
      {available.map((name) => (
        <Button
          key={name}
          variant={name === 'submit' || name === 'approve' ? 'contained' : 'outlined'}
          color={steps[name].danger ? 'error' : 'primary'}
          onClick={() => {
            setDialog(name);
          }}
        >
          {steps[name].label}
        </Button>
      ))}
      {allowed?.canRelease && (
        <Button
          variant="contained"
          onClick={() => {
            setEffectiveDate(businessToday());
            setDialog('release');
          }}
        >
          Release
        </Button>
      )}

      {step && dialog && dialog !== 'release' && (
        <ConfirmDialog
          open
          title={step.title}
          message={step.message}
          confirmLabel={step.label}
          danger={step.danger}
          comment={step.comment}
          loading={action.isPending}
          onClose={() => {
            setDialog(null);
          }}
          onConfirm={(comment) => {
            action.mutate(
              { step: dialog, input: { comment: comment || null, version: request.version } },
              { onSuccess: () => { setDialog(null); }, onError: failed },
            );
          }}
        />
      )}

      <ConfirmDialog
        open={dialog === 'release'}
        title="Release the document?"
        message="Records the release date as today. The requester and the Department Head are emailed."
        confirmLabel="Release"
        loading={release.isPending}
        canConfirm={Boolean(effectiveDate && effectiveDate >= businessToday())}
        onClose={() => {
          setDialog(null);
        }}
        onConfirm={() => {
          release.mutate(
            { effectiveImplementationDate: effectiveDate, version: request.version },
            { onSuccess: () => { setDialog(null); }, onError: failed },
          );
        }}
      >
        <DateField label="Effective implementation date" required value={effectiveDate} minDate={businessToday()} onChange={setEffectiveDate} />
        <Typography variant="caption" color="text.secondary">
          The date the changed document takes effect; today or later.
        </Typography>
      </ConfirmDialog>
    </>
  );
}
