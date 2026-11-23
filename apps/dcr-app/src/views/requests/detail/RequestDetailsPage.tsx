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
  useFileDownload,
  useTabState,
} from '@cyient/shared-ui';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { useParams } from 'react-router';
import { downloadRequestPdf } from '@/api-callers/requests/request.api';
import { useDcrApi } from '@/hooks/useDcrApi';
import { useRequest } from '@/hooks/requests/queries';
import { releasedInfo, STATUS_ACTIONS, statusInfo } from '@/constants/request-status';
import {
  DEFAULT_REQUEST_DETAIL_TAB,
  REQUEST_DETAIL_TAB_SECTIONS,
  REQUEST_DETAIL_TABS,
  renderRequestDetailTab,
  type RequestDetailTab,
} from '@/constants/tab-sections';
import { WorkflowActions } from '@/views/requests/detail/WorkflowActions';

/** One DCR: its tabs, and the actions the signed-in user may take. Email links open this page. */
export function RequestDetailsPage() {
  const { publicId = '' } = useParams();
  const api = useDcrApi();
  const { activeTab: tab, setTab } = useTabState<RequestDetailTab>({
    defaultTab: DEFAULT_REQUEST_DETAIL_TAB,
    validTabs: REQUEST_DETAIL_TABS,
  });
  const request = useRequest(publicId);
  const pdf = useFileDownload(() => downloadRequestPdf(api, publicId), 'DCR.pdf');

  if (request.isPending) return <PageLoader />;
  if (request.isError) {
    return <ErrorState title="This request could not be opened" message={errorMessage(request.error)} onRetry={() => void request.refetch()} />;
  }

  const details = request.data;
  const title = details.requestNo ?? 'Draft request';
  const tabContext = { request: details, publicId };

  return (
    <>
      <PageHeader
        title={title}
        subtitle={details.documentReference}
        breadcrumbs={[{ label: 'Requests', to: '/requests' }, { label: title }]}
        status={
          <>
            <StatusChip {...statusInfo[details.status]} />
            {details.status === STATUS_ACTIONS.APPROVED && <StatusChip {...releasedInfo[details.releasedStatus]} />}
          </>
        }
        actions={
          <>
            <WorkflowActions request={details} />
            {details.status !== STATUS_ACTIONS.DRAFT && (
              <Button startIcon={<PictureAsPdfOutlinedIcon />} loading={pdf.isPending} onClick={() => { pdf.mutate(); }}>
                PDF
              </Button>
            )}
          </>
        }
      />

      {details.status === STATUS_ACTIONS.DRAFT && details.reviewStarted && (
        <InlineAlert severity="warning" title="Sent back to you">
          Make the changes asked for in the log, then submit it again. It starts again at IMS Review.
        </InlineAlert>
      )}

      <SegmentedTabs
        value={tab}
        onChange={(_, value: RequestDetailTab) => {
          setTab(value);
        }}
        variant="scrollable"
        allowScrollButtonsMobile
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
