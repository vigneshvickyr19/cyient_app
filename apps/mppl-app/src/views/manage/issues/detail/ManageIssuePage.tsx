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
  useTabState,
} from '@cyient/shared-ui';
import { useState } from 'react';
import { useParams } from 'react-router';
import { mpplTags } from '@/api-callers/api-tags';
import { useIssue } from '@/hooks/issues/queries';
import { issueTitle, STATUS_ACTIONS, statusInfo } from '@/constants/issue-status';
import { DEFAULT_RECORD_HISTORY_TAB, RECORD_HISTORY_TABS, type RecordHistoryTab } from '@/constants/tab-sections';
import { useAdminCloseIssue } from '@/hooks/manage/mutations';
import { useIssueRecord } from '@/hooks/manage/queries';

/** One issue for administrators: close it for Sourcing with a reason, and see its history, emails and audit trail. */
export function ManageIssuePage() {
  const { publicId = '' } = useParams();
  const issue = useIssue(publicId);
  const close = useAdminCloseIssue(publicId);
  const record = useIssueRecord(publicId);
  const [closing, setClosing] = useState(false);
  const { activeTab, setTab } = useTabState<RecordHistoryTab>({
    defaultTab: DEFAULT_RECORD_HISTORY_TAB,
    validTabs: RECORD_HISTORY_TABS,
  });
  const failed = useActionFailure(mpplTags.issue.detail(publicId), {
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
            {details.status === STATUS_ACTIONS.OPEN && (
              <Button variant="outlined" onClick={() => { setClosing(true); }}>
                Close for Sourcing
              </Button>
            )}
          </>
        }
      />
      <RecordHistoryTabs {...record} tab={activeTab} onTabChange={setTab} />

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
