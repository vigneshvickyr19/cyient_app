import type { ComplaintDetails } from '@cyient/api-client/cc';
import {
  errorMessage,
  ErrorState,
  InlineAlert,
  LinkButton,
  PageHeader,
  PageLoader,
  StatusChip,
  Tab,
  SegmentedTabs,
  useAuth,
  useTabState,
} from '@cyient/shared-ui';
import { Box, Stack, Step, StepLabel, Stepper } from '@mui/material';
import { useParams } from 'react-router';
import { useComplaint } from '@/hooks/complaints/queries';
import { defaultTab, partOf, progressOf, STATUS_ACTIONS, statusInfo, stepReached, steps, waitingFor } from '@/constants/complaint-status';
import {
  COMPLAINT_DETAIL_TAB_SECTIONS,
  COMPLAINT_DETAIL_TABS,
  DEFAULT_COMPLAINT_DETAIL_TAB,
  renderComplaintDetailTab,
  type ComplaintDetailTab,
} from '@/constants/tab-sections';
import { WorkflowActions } from '@/views/complaints/detail/WorkflowActions';

/** What the signed-in user may do on this complaint, and who it waits for. */
function YourPart({ complaint, userId }: { complaint: ComplaintDetails; userId: number }) {
  const part = partOf(complaint, userId);
  const roles = [
    part.isInitiator && 'You are the initiator: you publish the complaint, correct its first page and close it after the team saves D8.',
    part.isMember && 'You are on the team: you work on the 8D steps D4 to D8.',
    part.ownedActions > 0 && `You own ${part.ownedActions} open D5 ${part.ownedActions === 1 ? 'action' : 'actions'}: add the evidence and close ${part.ownedActions === 1 ? 'it' : 'them'} on the D5 tab.`,
  ].filter((text): text is string => typeof text === 'string');
  const waiting = waitingFor[complaint.status];

  return (
    <InlineAlert title={complaint.status === STATUS_ACTIONS.DRAFT ? 'Draft: only you can see it until it is published' : undefined}>
      {[...(roles.length > 0 ? roles : ['You can view this complaint. The initiator and the team members work on it.']), ...(waiting ? [`Next: ${waiting}`] : [])].join(' ')}
    </InlineAlert>
  );
}

/** Why a draft can't be published yet: the API needs a team member, and the earlier complaint of a repeat. */
function PublishBlockers({ complaint }: { complaint: ComplaintDetails }) {
  const missing = [
    complaint.teamMembers.length === 0 && 'Add at least one team member before publishing.',
    complaint.isRepeat && !complaint.repeatOf && 'Choose the earlier complaint this one repeats.',
  ].filter((text): text is string => typeof text === 'string');
  if (missing.length === 0) return null;
  return (
    <InlineAlert
      severity="warning"
      title="Not ready to publish"
      action={
        <LinkButton to={`/complaints/${complaint.publicId}/edit`} color="inherit" size="small">
          Edit first page
        </LinkButton>
      }
    >
      {missing.join(' ')}
    </InlineAlert>
  );
}

/** One external complaint as an 8D: the steps D1 to D8 following its status, its documents and log. Email links open this page. */
export function ComplaintDetailsPage() {
  const { publicId = '' } = useParams();
  const { user } = useAuth();
  const complaint = useComplaint(publicId);
  const pendingStatus = complaint.data?.status;
  const currentDefaultTab = pendingStatus ? (defaultTab(pendingStatus) as ComplaintDetailTab) : DEFAULT_COMPLAINT_DETAIL_TAB;
  const { activeTab, setTab: showTab } = useTabState<ComplaintDetailTab>({
    defaultTab: currentDefaultTab,
    validTabs: COMPLAINT_DETAIL_TABS,
  });

  if (complaint.isPending) return <PageLoader />;
  if (complaint.isError) {
    return <ErrorState title="This complaint could not be opened" message={errorMessage(complaint.error)} onRetry={() => void complaint.refetch()} />;
  }

  const details = complaint.data;
  const title = details.complaintNo ?? 'Draft complaint';
  const status = details.status;
  const part = partOf(details, user.userId);
  const reachedTab = (name: ComplaintDetailTab) => {
    const index = steps.findIndex((step) => step.tab === name);
    return index < 0 || stepReached(status, index);
  };
  const tab: ComplaintDetailTab = reachedTab(activeTab) ? activeTab : currentDefaultTab;
  // After a step moves the complaint on, the page shows the step that is now open
  const moved = () => {
    showTab(currentDefaultTab);
  };
  const isDraftOfInitiator = status === STATUS_ACTIONS.DRAFT && part.isInitiator;
  const repeatMissing = details.isRepeat && !details.repeatOf;
  const tabContext = {
    complaint: details,
    publicId,
    onMoved: moved,
    canUpload: part.canUpload,
    status,
  };

  return (
    <>
      <PageHeader
        title={title}
        subtitle={[details.customer.name, details.customerPartNo ?? details.internalPartNo].filter(Boolean).join(' · ')}
        breadcrumbs={[{ label: 'External complaints', to: '/complaints' }, { label: title }]}
        status={
          <>
            <StatusChip {...statusInfo[status]} />
            {details.isCritical && <StatusChip label="Critical" tone="error" />}
            {details.isRepeat && <StatusChip label="Repeat" tone="warning" />}
          </>
        }
        actions={<WorkflowActions complaint={details} canPublish={details.allowedActions?.canPublish === true && !repeatMissing} />}
      />

      <Stack spacing={2} sx={{ mb: 2 }}>
        {status === STATUS_ACTIONS.CANCELLED ? (
          <InlineAlert severity="error" title="Cancelled">
            This complaint was cancelled by an administrator; the reason is on the Log tab.
          </InlineAlert>
        ) : (
          <YourPart complaint={details} userId={user.userId} />
        )}
        {isDraftOfInitiator && <PublishBlockers complaint={details} />}
      </Stack>

      {status !== STATUS_ACTIONS.CANCELLED && (
        <Box sx={{ overflowX: 'auto', py: 1 }}>
          <Stepper activeStep={progressOf(status)} alternativeLabel sx={{ minWidth: 760 }} aria-label="8D progress">
            {[...steps.map((step) => step.label), 'Initiator review'].map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}

      <SegmentedTabs
        value={tab}
        onChange={(_, value: ComplaintDetailTab) => {
          showTab(value);
        }}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ my: 2 }}
      >
        {COMPLAINT_DETAIL_TAB_SECTIONS.map((section) => (
          <Tab
            key={section.key}
            value={section.key}
            label={typeof section.label === 'function' ? section.label(tabContext) : section.label}
            disabled={section.disabled?.(tabContext)}
          />
        ))}
      </SegmentedTabs>

      {renderComplaintDetailTab(tab, tabContext)}
    </>
  );
}
