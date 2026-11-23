import {
  ErrorState,
  errorMessage,
  InlineAlert,
  PageHeader,
  PageLoader,
  StatusChip,
  SegmentedTabs,
  Tab,
  useTabState,
} from '@cyient/shared-ui';
import { formatDate } from '@cyient/shared-utils';
import { useParams } from 'react-router';
import { IssueActions } from '@/views/issues/detail/IssueActions';
import { useIssue } from '@/hooks/issues/queries';
import { issueTitle, STATUS_ACTIONS, statusInfo } from '@/constants/issue-status';
import {
  DEFAULT_ISSUE_DETAIL_TAB,
  ISSUE_DETAIL_TAB_SECTIONS,
  ISSUE_DETAIL_TABS,
  renderIssueDetailTab,
  type IssueDetailTab,
} from '@/constants/tab-sections';
import { QUERY_PARAMS } from '@/constants/query-params';

/** One issue: its details, documents and log, and the actions the signed-in user may take. Email links open this page. */
export function IssueDetailsPage() {
  const { publicId = '' } = useParams();
  const { activeTab: tab, setTab } = useTabState<IssueDetailTab>({
    defaultTab: DEFAULT_ISSUE_DETAIL_TAB,
    validTabs: ISSUE_DETAIL_TABS,
  });
  const issue = useIssue(publicId);

  if (issue.isPending) return <PageLoader />;
  if (issue.isError) {
    return <ErrorState title="This issue could not be opened" message={errorMessage(issue.error)} onRetry={() => void issue.refetch()} />;
  }

  const details = issue.data;
  const title = issueTitle(details);
  const tabContext = { issue: details, publicId };
  const listLink = details.status === STATUS_ACTIONS.DRAFT ? `/issues?${QUERY_PARAMS.LIST}=${STATUS_ACTIONS.DRAFTS}` : details.status === STATUS_ACTIONS.CLOSED ? `/issues?${QUERY_PARAMS.LIST}=${STATUS_ACTIONS.FIXED}` : '/issues';

  return (
    <>
      <PageHeader
        title={title}
        subtitle={[details.partNumber, details.supplierName, details.issueType.name].filter(Boolean).join(' · ')}
        breadcrumbs={[{ label: 'Issues', to: listLink }, { label: title }]}
        status={<StatusChip {...statusInfo[details.status]} />}
        actions={<IssueActions issue={details} />}
      />

      {details.status === STATUS_ACTIONS.OPEN && details.pendingWith && (
        <InlineAlert>
          Pending with {details.pendingWith} since {formatDate(details.submittedAt)}.
        </InlineAlert>
      )}
      {details.allowedActions?.canSubmit && (
        <InlineAlert>Add the reference documents if you have them, then submit the issue to its Sourcing Lead.</InlineAlert>
      )}

      <SegmentedTabs
        value={tab}
        onChange={(_, value: IssueDetailTab) => {
          setTab(value);
        }}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ my: 2 }}
      >
        {ISSUE_DETAIL_TAB_SECTIONS.map((section) => (
          <Tab
            key={section.key}
            value={section.key}
            label={typeof section.label === 'function' ? section.label(tabContext) : section.label}
          />
        ))}
      </SegmentedTabs>

      {renderIssueDetailTab(tab, tabContext)}
    </>
  );
}
