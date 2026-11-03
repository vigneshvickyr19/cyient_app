import { isApiError } from '@cyient/api-client';
import type { RequestDetails } from '@cyient/api-client/dn';
import {
  Button,
  ConfirmDialog,
  InlineAlert,
  LinkButton,
  PeoplePicker,
  RadioGroupField,
  useActionFailure,
  useAuth,
  type PersonOption,
} from '@cyient/shared-ui';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box } from '@mui/material';
import { useState } from 'react';
import { requestKeys } from './keys';
import { useWorkflowAction, type WorkflowCall, type WorkflowStep } from './mutations';

interface StepText {
  label: string;
  title: string;
  message: string;
  commentLabel?: string;
  danger?: boolean;
}

/** The step the deviation waits at, or (after Require more details) the step that asked. */
const currentStep = (request: RequestDetails) => request.reviewers.find((reviewer) => reviewer.id === request.currentReviewerId);

/** How each action asks. Every reviewer action and a resubmission need a comment (BRD-03 RULE-04, RULE-05). */
function stepText(step: WorkflowStep, request: RequestDetails): StepText {
  switch (step) {
    case 'submit': {
      if (request.status === 'MoreDetailsRequired') {
        const asked = currentStep(request);
        return {
          label: 'Resubmit',
          title: 'Resubmit with the details asked for?',
          message: `It goes back to ${asked ? `${asked.name} (${asked.user.name ?? 'the reviewer'})` : 'the reviewer who asked'} only.`,
          commentLabel: 'Your answer',
        };
      }
      return {
        label: 'Submit',
        title: 'Submit this deviation?',
        message: 'It gets its number and goes to your reporting manager, then to the reviewers in order. You can no longer change it.',
      };
    }
    case 'update':
      return { label: 'Update', title: 'Save your comment?', message: 'Your comment is saved on your step. The deviation stays with you.' };
    case 'approve':
      return { label: 'Approve', title: 'Approve this deviation?', message: 'It moves on to the next step in the sequence.' };
    case 'more-details':
      return {
        label: 'Require more details',
        title: 'Ask the initiator for more details?',
        message: 'The initiator is emailed. When they resubmit, it comes back to you.',
        commentLabel: 'Details needed',
      };
    case 'reject':
      return { label: 'Reject', title: 'Reject this deviation?', message: 'The initiator is emailed with your comment. This closes the deviation.', danger: true };
  }
}

/** The buttons for what the signed-in user may do now, as the API says (allowedActions). */
export function WorkflowActions({ request }: { request: RequestDetails }) {
  const { user } = useAuth();
  const [dialog, setDialog] = useState<WorkflowStep | null>(null);
  const [problems, setProblems] = useState<readonly string[]>([]);
  const [further, setFurther] = useState<'yes' | 'no' | null>(null);
  const [finalApprover, setFinalApprover] = useState<PersonOption | null>(null);
  const action = useWorkflowAction(request.publicId);
  const allowed = request.allowedActions;
  const hodApproves = dialog === 'approve' && allowed?.answersFurtherApproval === true;

  const open = (step: WorkflowStep) => {
    setProblems([]);
    setFurther(null);
    setFinalApprover(null);
    setDialog(step);
  };

  // Someone acted in between: show the deviation as it is now
  const showFailure = useActionFailure(requestKeys.detail(request.publicId), {
    onConflict: () => {
      setDialog(null);
    },
  });
  const failed = (error: unknown) => {
    if (isApiError(error) && error.isValidation && error.errors.length > 0) {
      setProblems(error.errors.map((problem) => problem.message));
    } else {
      showFailure(error);
    }
  };

  const callFor = (step: WorkflowStep, comment: string): WorkflowCall => {
    const base = { comment: comment || null, version: request.version };
    if (step !== 'approve') return { step, input: base };
    return hodApproves
      ? { step, input: { ...base, furtherApprovalRequired: further === 'yes', finalApproverUserId: further === 'yes' ? (finalApprover?.id ?? null) : null } }
      : { step, input: base };
  };

  const available: WorkflowStep[] = [
    ...(allowed?.canSubmit ? (['submit'] as const) : []),
    ...(allowed?.canReview ? (['approve', 'update', 'more-details', 'reject'] as const) : []),
  ];
  const text = dialog ? stepText(dialog, request) : null;

  return (
    <>
      {allowed?.canEdit && (
        <LinkButton to={`/requests/${request.publicId}/edit`} startIcon={<EditOutlinedIcon />}>
          Edit
        </LinkButton>
      )}
      {available.map((step) => {
        const { label, danger } = stepText(step, request);
        return (
          <Button
            key={step}
            variant={step === 'submit' || step === 'approve' ? 'contained' : 'outlined'}
            color={danger ? 'error' : 'primary'}
            onClick={() => {
              open(step);
            }}
          >
            {label}
          </Button>
        );
      })}

      {dialog && text && (
        <ConfirmDialog
          open
          title={text.title}
          message={text.message}
          confirmLabel={text.label}
          danger={text.danger}
          comment={dialog === 'submit' && request.status === 'Draft' ? 'optional' : 'required'}
          commentLabel={text.commentLabel}
          loading={action.isPending}
          canConfirm={!hodApproves || further === 'no' || (further === 'yes' && finalApprover !== null)}
          onClose={() => {
            setDialog(null);
          }}
          onConfirm={(comment) => {
            setProblems([]);
            action.mutate(callFor(dialog, comment), {
              onSuccess: () => {
                setDialog(null);
              },
              onError: failed,
            });
          }}
        >
          {hodApproves && (
            <>
              <RadioGroupField<'yes' | 'no'>
                name="furtherApprovalRequired"
                label="Further approval required?"
                required
                value={further}
                onChange={setFurther}
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
                helperText={further === 'no' ? 'Approving closes the deviation as approved.' : undefined}
              />
              {further === 'yes' && (
                <PeoplePicker
                  label="Final approver"
                  required
                  value={finalApprover}
                  onChange={setFinalApprover}
                  excludeIds={[request.initiator.id, user.userId]}
                  helperText={finalApprover ? 'They approve last, after you.' : 'Choose the final approver.'}
                />
              )}
            </>
          )}
          {problems.length > 0 && (
            <InlineAlert severity="error" title="This can't be done yet">
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </Box>
            </InlineAlert>
          )}
        </ConfirmDialog>
      )}
    </>
  );
}
