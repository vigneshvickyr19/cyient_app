import { isApiError } from '@cyient/api-client';
import type { IssueDetails } from '@cyient/api-client/mppl';
import { Button, ConfirmDialog, InlineAlert, LinkButton, useActionFailure } from '@cyient/shared-ui';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useState } from 'react';
import { issueKeys } from './keys';
import { useIssueAction, type IssueStep } from './mutations';

/**
 * Refusals about the issue's own data, found when the PO line and Sourcing Lead are checked again on submit. They are
 * shown in the dialog, as the buyer has to change the draft (or wait for the open issue on the line to be fixed).
 */
const dataProblems = ['MPPL_PO_LINE_HAS_OPEN_ISSUE', 'MPPL_PO_LINE_NOT_FOUND', 'MPPL_NO_SOURCING_LEAD', 'MPPL_INVALID_MASTER'];

const steps: Record<IssueStep, { label: string; title: string; message: (issue: IssueDetails) => string }> = {
  submit: {
    label: 'Submit',
    title: 'Submit this issue?',
    message: (issue) =>
      `It goes to Open Issues, pending with the Sourcing Lead, ${issue.sourcingLead.name ?? 'from the sourcing master'}, who is emailed. A submitted issue can't be changed.`,
  },
  close: {
    label: 'Close issue',
    title: 'Close this issue?',
    message: () => "It moves to Fixed Issues and the buyer is emailed. Closing is final: a closed issue can't be reopened.",
  },
};

/** The buttons for what the signed-in user may do now, as the API says (allowedActions). */
export function IssueActions({ issue }: { issue: IssueDetails }) {
  const [dialog, setDialog] = useState<IssueStep | null>(null);
  const [problems, setProblems] = useState<readonly string[]>([]);
  const action = useIssueAction(issue.publicId);
  const allowed = issue.allowedActions;

  const close = () => {
    setDialog(null);
    setProblems([]);
  };

  // Someone acted in between, or the issue was closed: show it as it is now
  const showFailure = useActionFailure(issueKeys.detail(issue.publicId), { onConflict: close });
  const failed = (error: unknown) => {
    if (isApiError(error) && error.errors.some((item) => dataProblems.includes(item.code))) {
      setProblems(error.errors.map((item) => item.message));
      return;
    }
    showFailure(error);
  };

  const step = dialog ? steps[dialog] : null;

  return (
    <>
      {allowed?.canEdit && (
        <LinkButton to={`/issues/${issue.publicId}/edit`} startIcon={<EditOutlinedIcon />}>
          Edit
        </LinkButton>
      )}
      {allowed?.canSubmit && (
        <Button variant="contained" onClick={() => { setDialog('submit'); }}>
          Submit
        </Button>
      )}
      {allowed?.canClose && (
        <Button variant="contained" onClick={() => { setDialog('close'); }}>
          Close issue
        </Button>
      )}

      {dialog && step && (
        <ConfirmDialog
          open
          title={step.title}
          message={step.message(issue)}
          confirmLabel={step.label}
          comment="optional"
          commentLabel={dialog === 'close' ? 'Comment for the buyer' : 'Comment'}
          loading={action.isPending}
          onClose={close}
          onConfirm={(comment) => {
            setProblems([]);
            action.mutate({ step: dialog, input: { comment: comment || null, version: issue.version } }, { onSuccess: close, onError: failed });
          }}
        >
          {problems.length > 0 && (
            <InlineAlert severity="error" title="The issue can't be submitted">
              {problems.join(' ')}
            </InlineAlert>
          )}
        </ConfirmDialog>
      )}
    </>
  );
}
