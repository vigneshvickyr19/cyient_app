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
import { issueKeys } from '../issues/keys';
import { useIssue } from '../issues/queries';
import { issueTitle, statusInfo } from '../issues/status';
import { useAdminCloseIssue } from './mutations';
import { useIssueRecord } from './queries';

/** One issue for administrators: close it for Sourcing with a reason, and see its history, emails and audit trail. */
export function ManageIssuePage() {
  const { publicId = '' } = useParams();
  const issue = useIssue(publicId);
  const close = useAdminCloseIssue(publicId);
  const record = useIssueRecord(publicId);
  const [closing, setClosing] = useState(false);
  const failed = useActionFailure(issueKeys.detail(publicId), {
    onConflict: () => {
      setClosing(false);
    },
  });

  if (issue.isPending) return <PageLoader />;
  if (issue.isError) return <ErrorState title="This issue could not be opened" message={errorMessage(issue.error)} onRetry={() => void issue.refetch()} />;

  const details = issue.data;
  const title = issueTitle(details);

  return (
    <>
      <PageHeader
        title={title}
        subtitle={[details.project.name, details.supplierName, details.issueType.name].filter(Boolean).join(' · ')}
        breadcrumbs={[{ label: 'All issues (administration)', to: '/manage/issues' }, { label: title }]}
        backTo="/manage/issues"
        status={<StatusChip {...statusInfo[details.status]} />}
        actions={
          <>
            <LinkButton to={`/issues/${publicId}`}>Open issue</LinkButton>
            {details.status === 'Open' && (
              <Button variant="outlined" onClick={() => { setClosing(true); }}>
                Close for Sourcing
              </Button>
            )}
          </>
        }
      />
      <RecordHistoryTabs {...record} />

      <ConfirmDialog
        open={closing}
        title={`Close ${title} for Sourcing?`}
        message={`It moves to Fixed Issues. The buyer is emailed, with the Sourcing Lead (${details.sourcingLead.name ?? 'unknown'}) in copy. A closed issue can't be reopened.`}
        confirmLabel="Close issue"
        cancelLabel="Keep it open"
        comment="required"
        commentLabel="Reason"
        loading={close.isPending}
        onClose={() => { setClosing(false); }}
        onConfirm={(reason) => {
          close.mutate(
            { reason, version: details.version },
            {
              onSuccess: () => { setClosing(false); },
              onError: failed,
            },
          );
        }}
      />
    </>
  );
}
