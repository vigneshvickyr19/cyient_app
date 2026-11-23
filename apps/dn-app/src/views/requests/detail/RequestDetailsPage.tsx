import type { RequestDetails } from '@cyient/api-client/dn';
import {
  Button,
  ErrorState,
  errorMessage,
  InlineAlert,
  PageHeader,
  PageLoader,
  StatusChip,
  SegmentedTabs,
  Tab,
  useAuth,
  useFileDownload,
  useTabState,
} from '@cyient/shared-ui';
import { formatDate, formatDateTime } from '@cyient/shared-utils';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { useParams } from 'react-router';
import { downloadRequestPdf } from '@/api-callers/requests/request.api';
import { useDnApi } from '@/hooks/useDnApi';
import { useRequest } from '@/hooks/requests/queries';
import { STATUS_ACTIONS, statusInfo } from '@/constants/request-status';
import {
  DEFAULT_REQUEST_DETAIL_TAB,
  REQUEST_DETAIL_TAB_SECTIONS,
  REQUEST_DETAIL_TABS,
  renderRequestDetailTab,
  type RequestDetailTab,
} from '@/constants/tab-sections';
import { WorkflowActions } from '@/views/requests/detail/WorkflowActions';

/** What the page says about where the deviation stands, above the tabs. */
function StateNotice({ request }: { request: RequestDetails }) {
  const { user } = useAuth();
  switch (request.status) {
    case STATUS_ACTIONS.MORE_DETAILS_REQUIRED:
      return request.initiator.id === user.userId ? (
        <InlineAlert severity="warning" title="More details are needed from you">
          {request.moreInfo ?? 'A reviewer asked for more details.'} Add any documents, then resubmit with your answer.
        </InlineAlert>
      ) : (
        <InlineAlert severity="info" title="Waiting for the initiator">
          More details were asked for: {request.moreInfo ?? '—'}
        </InlineAlert>
      );
    case STATUS_ACTIONS.CLOSED_BY_ADMIN:
      return (
        <InlineAlert severity="info" title={`Closed by admin ${formatDateTime(request.closedAt)}`}>
          {request.closeComment ?? 'No comment was given.'}
        </InlineAlert>
      );
    case STATUS_ACTIONS.APPROVED:
      return (
        <InlineAlert severity="success" title="Approved">
          Final approval {formatDate(request.finalApprovalDate)}; valid until {formatDate(request.validUntil)}.
        </InlineAlert>
      );
    case STATUS_ACTIONS.DRAFT:
    case STATUS_ACTIONS.PENDING_APPROVAL:
    case STATUS_ACTIONS.REJECTED:
      return null;
  }
}

/** One deviation: its tabs, and the actions the signed-in user may take. Email links open this page. */
export function RequestDetailsPage() {
  const { publicId = '' } = useParams();
  const api = useDnApi();
  const { activeTab: tab, setTab } = useTabState<RequestDetailTab>({
    defaultTab: DEFAULT_REQUEST_DETAIL_TAB,
    validTabs: REQUEST_DETAIL_TABS,
  });
  const request = useRequest(publicId);
  const pdf = useFileDownload(() => downloadRequestPdf(api, publicId), 'Deviation note.pdf');

  if (request.isPending) return <PageLoader />;
  if (request.isError) {
    return <ErrorState title="This deviation could not be opened" message={errorMessage(request.error)} onRetry={() => void request.refetch()} />;
  }

  const details = request.data;
  const title = details.requestNo ?? 'Draft deviation';
  const tabContext = { request: details, publicId };

  return (
    <>
      <PageHeader
        title={title}
        subtitle={`${details.changeCategory.name} · W.O ${details.workOrderNo} · ${details.productFgNumber}`}
        breadcrumbs={[{ label: 'Requests', to: '/requests' }, { label: title }]}
        status={<StatusChip {...statusInfo[details.status]} />}
        actions={
          <>
            <WorkflowActions request={details} />
            {details.allowedActions?.canDownloadPdf && (
              <Button startIcon={<PictureAsPdfOutlinedIcon />} loading={pdf.isPending} onClick={() => { pdf.mutate(); }}>
                PDF
              </Button>
            )}
          </>
        }
      />

      <StateNotice request={details} />

      <SegmentedTabs
        value={tab}
        onChange={(_, value: RequestDetailTab) => {
          setTab(value);
        }}
        variant="scrollable"
        allowScrollButtonsMobile
        aria-label="Deviation sections"
        sx={{ my: 2 }}
      >
        {REQUEST_DETAIL_TAB_SECTIONS.map((section) => (
          <Tab
            key={section.key}
            value={section.key}
            label={typeof section.label === 'function' ? section.label(tabContext) : section.label}
          />
        ))}
      </SegmentedTabs>

      {renderRequestDetailTab(tab, tabContext)}
    </>
  );
}
