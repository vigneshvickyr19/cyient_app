import { isApiError } from '@cyient/api-client';
import type { NoteDetails } from '@cyient/api-client/ecn';
import { Button, ConfirmDialog, DateField, InlineAlert, LinkButton, useActionFailure, useAuth } from '@cyient/shared-ui';
import { businessToday } from '@cyient/shared-utils';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { noteKeys } from './keys';
import { usePublishToCft, useWorkflowAction, type WorkflowStep } from './mutations';

type Dialog = WorkflowStep | 'publishToCft' | null;

/** How each step asks: its button, its question and what happens next. A comment is optional on every step. */
const steps: Record<WorkflowStep, { label: string; title: string; message: string }> = {
  sendMeetingNotification: {
    label: 'Send meeting notification',
    title: 'Send the meeting notification?',
    message:
      'You, the named CFT members, the Reviewer and the Approver are emailed, and the status becomes CFT Meeting. The front page and the CFT team can no longer be changed.',
  },
  publishToReviewer: {
    label: 'Publish to Reviewer',
    title: 'Publish to the Reviewer?',
    message: 'Every CFT action is closed. The Reviewer is emailed to review the note.',
  },
  review: { label: 'Review', title: 'Mark this note as reviewed?', message: 'It goes to the Approver, who is emailed with the initiator in copy.' },
  approve: { label: 'Approve', title: 'Approve this note?', message: 'The ECN admins are emailed to release it, with the initiator in copy.' },
  release: {
    label: 'Release',
    title: 'Release this note?',
    message: 'It moves to the closed list. The initiator is emailed, with the Reviewer and the Approver in copy.',
  },
};

const ECN_NOT_READY = 'ECN_NOT_READY';

/** The buttons for what the signed-in user may do now, as the API says (allowedActions). */
export function WorkflowActions({ note }: { note: NoteDetails }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const action = useWorkflowAction(note.publicId);
  const publish = usePublishToCft(note.publicId);
  const allowed = note.allowedActions;

  const close = () => {
    setDialog(null);
    setProblems([]);
  };

  // Someone acted in between: show the note as it is now
  const showFailure = useActionFailure(noteKeys.detail(note.publicId), { exact: true, onConflict: close });
  const failed = (error: unknown) => {
    // Something is still missing (the CFT, an attachment, a function's actions): say what, and show the note as it is now
    if (isApiError(error) && error.hasCode(ECN_NOT_READY)) {
      setProblems(error.errors.map((e) => e.message));
      void queryClient.invalidateQueries({ queryKey: noteKeys.detail(note.publicId), exact: true });
      return;
    }
    showFailure(error);
  };

  // Nobody releases their own note (AUTH_OWN_REQUEST)
  const canRelease = allowed?.canRelease === true && note.initiator.id !== user.userId;
  const available: WorkflowStep[] = [
    ...(allowed?.canSendMeetingNotification ? (['sendMeetingNotification'] as const) : []),
    ...(allowed?.canPublishToReviewer ? (['publishToReviewer'] as const) : []),
    ...(allowed?.canReview ? (['review'] as const) : []),
    ...(allowed?.canApprove ? (['approve'] as const) : []),
    ...(canRelease ? (['release'] as const) : []),
  ];
  const step = dialog && dialog !== 'publishToCft' ? dialog : null;
  const problemList = problems.length > 0 && (
    <InlineAlert severity="error" title="Not ready yet">
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
        {problems.map((problem) => (
          <li key={problem}>{problem}</li>
        ))}
      </Box>
    </InlineAlert>
  );

  return (
    <>
      {allowed?.canEdit && (
        <LinkButton to={`/notes/${note.publicId}/edit`} startIcon={<EditOutlinedIcon />}>
          Edit
        </LinkButton>
      )}
      {allowed?.canPublishToCft && (
        <Button
          variant="contained"
          onClick={() => {
            setTargetDate(null);
            setDialog('publishToCft');
          }}
        >
          Publish to CFT
        </Button>
      )}
      {available.map((name) => (
        <Button key={name} variant="contained" onClick={() => { setDialog(name); }}>
          {steps[name].label}
        </Button>
      ))}

      {step && (
        <ConfirmDialog
          open
          title={steps[step].title}
          message={steps[step].message}
          confirmLabel={steps[step].label}
          comment="optional"
          loading={action.isPending}
          onClose={close}
          onConfirm={(comment) => {
            action.mutate({ step, input: { comment: comment || null, version: note.version } }, { onSuccess: close, onError: failed });
          }}
        >
          {problemList}
        </ConfirmDialog>
      )}

      <ConfirmDialog
        open={dialog === 'publishToCft'}
        title="Publish to the CFT?"
        message="Each named function's tab gets its predefined actions, every named member is emailed, and the status becomes CFT Review. ECN Parts and Immediate Actions can no longer be changed."
        confirmLabel="Publish to CFT"
        comment="optional"
        loading={publish.isPending}
        canConfirm={Boolean(targetDate && targetDate >= businessToday())}
        onClose={close}
        onConfirm={(comment) => {
          publish.mutate({ targetDate, comment: comment || null, version: note.version }, { onSuccess: close, onError: failed });
        }}
      >
        <DateField
          label="ECN target date"
          name="targetDate"
          required
          value={targetDate}
          minDate={businessToday()}
          onChange={setTargetDate}
          helperText="The date by which the CFT must close their actions; today or later."
        />
        {problemList}
      </ConfirmDialog>
    </>
  );
}
