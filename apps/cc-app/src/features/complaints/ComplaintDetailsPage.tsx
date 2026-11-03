import type { ComplaintDetails } from '@cyient/api-client/cc';
import {
  ActivityLog,
  CheckboxField,
  DocumentList,
  documentUpload,
  ErrorState,
  errorMessage,
  InlineAlert,
  LinkButton,
  PageHeader,
  PageLoader,
  SectionCard,
  SectionSkeleton,
  StatusChip,
  useAuth,
  useDownloadDocument,
} from '@cyient/shared-ui';
import { Box, Stack, Step, StepLabel, Stepper, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { ActionsSection } from './ActionsSection';
import { FirstPageSection } from './FirstPageSection';
import { useUploadDocument } from './mutations';
import { useComplaint, useComplaintDocuments, useComplaintLog } from './queries';
import { RootCauseSection } from './RootCauseSection';
import { defaultTab, partOf, progressOf, statusInfo, stepReached, steps, waitingFor, type StepTab } from './status';
import { StepTextSection } from './StepTextSection';
import { WorkflowActions } from './WorkflowActions';

type TabName = StepTab | 'documents' | 'log';

const tabNames: readonly TabName[] = [...steps.map((step) => step.tab), 'documents', 'log'];

function DocumentsSection({ complaint, canUpload }: { complaint: ComplaintDetails; canUpload: boolean }) {
  const [allVersions, setAllVersions] = useState(false);
  const documents = useComplaintDocuments(complaint.publicId, allVersions);
  const upload = useUploadDocument(complaint.publicId);
  const download = useDownloadDocument();

  return (
    <SectionCard
      title="Documents"
      subheader="Evidence images and documents of the first page, and the evidence of the D5 actions"
      actions={<CheckboxField label="Earlier versions" checked={allVersions} onChange={setAllVersions} />}
    >
      {documents.isPending ? (
        <SectionSkeleton />
      ) : documents.isError ? (
        <ErrorState message={errorMessage(documents.error)} onRetry={() => void documents.refetch()} />
      ) : (
        <DocumentList
          files={documents.data}
          onDownload={(file) => { download.mutate(file.id); }}
          downloading={(file) => download.isPending && download.variables === file.id}
          upload={canUpload ? { onUpload: (file) => upload.mutateAsync(file), uploading: upload.isPending, ...documentUpload } : undefined}
        />
      )}
    </SectionCard>
  );
}

function LogSection({ publicId }: { publicId: string }) {
  const log = useComplaintLog(publicId);
  if (log.isPending) return <SectionSkeleton />;
  if (log.isError) return <ErrorState message={errorMessage(log.error)} onRetry={() => void log.refetch()} />;
  return (
    <SectionCard title="Log">
      <ActivityLog
        entries={log.data.map((entry) => ({ at: entry.actionAt, user: entry.user.name, action: entry.action, stage: entry.stageName, comment: entry.comment }))}
      />
    </SectionCard>
  );
}

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
    <InlineAlert title={complaint.status === 'Draft' ? 'Draft: only you can see it until it is published' : undefined}>
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
  const [params, setParams] = useSearchParams();
  const complaint = useComplaint(publicId);

  if (complaint.isPending) return <PageLoader />;
  if (complaint.isError) {
    return <ErrorState title="This complaint could not be opened" message={errorMessage(complaint.error)} onRetry={() => void complaint.refetch()} />;
  }

  const details = complaint.data;
  const title = details.complaintNo ?? 'Draft complaint';
  const status = details.status;
  const part = partOf(details, user.userId);
  const reachedTab = (name: TabName) => {
    const index = steps.findIndex((step) => step.tab === name);
    return index < 0 || stepReached(status, index);
  };
  const asked = tabNames.find((name) => name === params.get('tab'));
  const tab: TabName = asked && reachedTab(asked) ? asked : defaultTab(status);
  const showTab = (name: TabName) => {
    setParams(name === defaultTab(status) ? {} : { tab: name }, { replace: true });
  };
  // After a step moves the complaint on, the page shows the step that is now open
  const moved = () => {
    setParams({}, { replace: true });
  };
  const isDraftOfInitiator = status === 'Draft' && part.isInitiator;
  const repeatMissing = details.isRepeat && !details.repeatOf;

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
        {status === 'Cancelled' ? (
          <InlineAlert severity="error" title="Cancelled">
            This complaint was cancelled by an administrator; the reason is on the Log tab.
          </InlineAlert>
        ) : (
          <YourPart complaint={details} userId={user.userId} />
        )}
        {isDraftOfInitiator && <PublishBlockers complaint={details} />}
      </Stack>

      {status !== 'Cancelled' && (
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

      <Tabs
        value={tab}
        onChange={(_, value: TabName) => {
          showTab(value);
        }}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ my: 2 }}
      >
        {steps.map((step, index) => (
          <Tab
            key={step.tab}
            value={step.tab}
            label={step.tab === 'd5' && details.actions.length > 0 ? `${step.label} (${details.actions.length})` : step.label}
            disabled={!stepReached(status, index)}
          />
        ))}
        <Tab value="documents" label={`Documents${details.documentCount ? ` (${details.documentCount})` : ''}`} />
        <Tab value="log" label="Log" />
      </Tabs>

      {tab === 'registration' && <FirstPageSection complaint={details} />}
      {tab === 'd4' && <RootCauseSection complaint={details} onMoved={moved} />}
      {tab === 'd5' && <ActionsSection complaint={details} onMoved={moved} />}
      {tab === 'd6' && <StepTextSection complaint={details} step="verification" onMoved={moved} />}
      {tab === 'd7' && <StepTextSection complaint={details} step="horizontalDeployment" onMoved={moved} />}
      {tab === 'd8' && <StepTextSection complaint={details} step="closure" onMoved={moved} />}
      {tab === 'documents' && <DocumentsSection complaint={details} canUpload={part.canUpload} />}
      {tab === 'log' && <LogSection publicId={publicId} />}
    </>
  );
}
