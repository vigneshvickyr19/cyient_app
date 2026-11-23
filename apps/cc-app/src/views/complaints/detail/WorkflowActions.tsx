import type { ComplaintDetails } from '@cyient/api-client/cc';
import { Button, ConfirmDialog, LinkButton, useActionFailure, useFileDownload } from '@cyient/shared-ui';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { useState } from 'react';
import { ccTags } from '@/api-callers/api-tags';
import { downloadEightDReport } from '@/api-callers/complaints/complaint.api';
import { useCcApi } from '@/hooks/useCcApi';
import { useWorkflowAction } from '@/hooks/complaints/mutations';
import { STATUS_ACTIONS } from '@/constants/status-actions';

type Dialog = 'publish' | 'close' | null;

const dialogs = {
  publish: {
    label: 'Publish',
    title: 'Publish this complaint?',
    message: 'It gets its complaint number, D4 opens and every team member is emailed. The team can then see and work on it.',
  },
  close: {
    label: 'Close complaint',
    title: 'Close this complaint?',
    message: 'You have reviewed the completed 8D. Once closed, the complaint can no longer be changed.',
  },
} as const;

/** The page's buttons: what the signed-in user may do now (allowedActions), and the 8D report once published. */
export function WorkflowActions({ complaint, canPublish }: { complaint: ComplaintDetails; canPublish: boolean }) {
  const api = useCcApi();
  const [dialog, setDialog] = useState<Dialog>(null);
  const action = useWorkflowAction(complaint.publicId);
  const failed = useActionFailure(ccTags.complaint.detail(complaint.publicId));
  const report = useFileDownload(() => downloadEightDReport(api, complaint.publicId), '8D report.pdf');
  const allowed = complaint.allowedActions;
  const showPublish = complaint.status === STATUS_ACTIONS.DRAFT && allowed?.canEdit === true;
  const open = dialog ? dialogs[dialog] : null;

  return (
    <>
      {allowed?.canEdit && (
        <LinkButton to={`/complaints/${complaint.publicId}/edit`} startIcon={<EditOutlinedIcon />}>
          Edit first page
        </LinkButton>
      )}
      {showPublish && (
        <Button variant="contained" disabled={!canPublish} onClick={() => { setDialog('publish'); }}>
          Publish
        </Button>
      )}
      {allowed?.canClose && (
        <Button variant="contained" onClick={() => { setDialog('close'); }}>
          Close complaint
        </Button>
      )}
      {complaint.status !== STATUS_ACTIONS.DRAFT && (
        <Button startIcon={<PictureAsPdfOutlinedIcon />} loading={report.isPending} onClick={() => { report.mutate(); }}>
          8D report
        </Button>
      )}

      {open && dialog && (
        <ConfirmDialog
          open
          title={open.title}
          message={open.message}
          confirmLabel={open.label}
          comment="optional"
          loading={action.isPending}
          onClose={() => {
            setDialog(null);
          }}
          onConfirm={(comment) => {
            action.mutate(
              { step: dialog, input: { comment: comment || null, version: complaint.version } },
              {
                onSuccess: () => {
                  setDialog(null);
                },
                onError: (error) => {
                  failed(error);
                  setDialog(null);
                },
              },
            );
          }}
        />
      )}
    </>
  );
}
