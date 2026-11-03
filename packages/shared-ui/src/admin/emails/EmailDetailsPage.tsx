import type { EmailDetails } from '@cyient/api-client/platform';
import { formatDateTime, humanize } from '@cyient/shared-utils';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { Box, Link, Stack } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { DetailList, InlineAlert, SectionCard, StatusChip } from '../../components/display';
import { ErrorState } from '../../components/ErrorState';
import { PageLoader } from '../../components/Loader';
import { PageHeader } from '../../components/PageHeader';
import { errorMessage } from '../../errors/errorMessage';
import { useNotify } from '../../notifications/NotificationProvider';
import { useAdminPath } from '../shared/AdminBase';
import { toInt } from '../shared/filters';
import { emailStatusTone, useEmail, useResendEmail, useRetryEmail } from './queries';

/** One email: recipients, state, attempts, the last error and its body; failed ones can be retried, sent ones resent. */
export default function EmailDetailsPage() {
  const emailId = toInt(useParams().emailId);
  if (emailId === undefined) {
    return <ErrorState title="Email not found" message="The address doesn't name an email." />;
  }
  return <EmailLoader emailId={emailId} />;
}

function EmailLoader({ emailId }: { emailId: number }) {
  const email = useEmail(emailId);
  if (email.isError) {
    return <ErrorState title="We couldn't load the email" message={errorMessage(email.error)} onRetry={() => void email.refetch()} />;
  }
  if (!email.data) {
    return <PageLoader label="Loading the email…" />;
  }
  return <EmailView email={email.data} />;
}

type Confirming = 'retry' | 'resend' | null;

function EmailView({ email }: { email: EmailDetails }) {
  const adminPath = useAdminPath();
  const navigate = useNavigate();
  const notify = useNotify();
  const retry = useRetryEmail(email.id);
  const resend = useResendEmail(email.id);
  const [confirming, setConfirming] = useState<Confirming>(null);
  const close = () => {
    setConfirming(null);
  };

  return (
    <>
      <PageHeader
        title={email.subject}
        subtitle={`To ${email.toAddresses}`}
        backTo={adminPath('emails')}
        breadcrumbs={[{ label: 'Email log', to: adminPath('emails') }, { label: `Email ${email.id}` }]}
        status={<StatusChip label={email.status} tone={emailStatusTone(email.status)} />}
        actions={
          <>
            {email.status === 'Failed' && (
              <Button
                variant="contained"
                startIcon={<ReplayOutlinedIcon />}
                onClick={() => {
                  setConfirming('retry');
                }}
              >
                Retry
              </Button>
            )}
            {email.status === 'Sent' && (
              <Button
                variant="outlined"
                startIcon={<SendOutlinedIcon />}
                onClick={() => {
                  setConfirming('resend');
                }}
              >
                Resend
              </Button>
            )}
          </>
        }
      />
      <Stack spacing={3}>
        {email.lastError && (
          <InlineAlert severity={email.status === 'Failed' ? 'error' : 'warning'} title="Last error">
            {email.lastError}
          </InlineAlert>
        )}
        <SectionCard title="Details">
          <DetailList
            items={[
              { label: 'To', value: email.toAddresses, wide: true },
              { label: 'Cc', value: email.ccAddresses, wide: true },
              { label: 'Subject', value: email.subject, wide: true },
              { label: 'Status', value: email.status },
              { label: 'Attempts', value: email.attemptCount },
              { label: 'Next attempt', value: formatDateTime(email.nextAttemptAt) },
              { label: 'Queued', value: formatDateTime(email.createdAt) },
              { label: 'Sent', value: formatDateTime(email.sentAt) },
              { label: 'Event', value: email.eventType },
              { label: 'Reference ID', value: email.referenceId },
              { label: 'Caused by', value: email.triggeredBy?.name ?? 'The system' },
              { label: 'Workflow step', value: [email.workflowStage, email.workflowAction && humanize(email.workflowAction)].filter(Boolean).join(' · ') },
              {
                label: 'Link in the email',
                value:
                  email.linkUrl && /^https?:\/\//i.test(email.linkUrl) ? (
                    <Link href={email.linkUrl} target="_blank" rel="noopener noreferrer">
                      {email.linkUrl}
                    </Link>
                  ) : (
                    email.linkUrl
                  ),
                wide: true,
              },
              { label: 'Trace ID', value: email.traceId },
              { label: 'Message ID', value: email.messageId },
            ]}
          />
        </SectionCard>
        <SectionCard title="Body" subheader="Shown as the recipient sees it; links and scripts in it are switched off here.">
          <Box
            component="iframe"
            title={`Body of the email "${email.subject}"`}
            sandbox=""
            srcDoc={email.bodyHtml}
            sx={{ display: 'block', width: '100%', height: '60vh', border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'common.white' }}
          />
        </SectionCard>
      </Stack>
      <ConfirmDialog
        open={confirming === 'retry'}
        title="Retry this email?"
        message="It goes back in the queue and is tried again shortly."
        confirmLabel="Retry"
        loading={retry.isPending}
        onClose={close}
        onConfirm={() => {
          retry.mutate(undefined, {
            onSuccess: (result) => {
              notify.success(result.message ?? 'The email is queued to be tried again.');
              close();
            },
            onError: (error) => {
              notify.error(error, 'The email could not be retried.');
            },
          });
        }}
      />
      <ConfirmDialog
        open={confirming === 'resend'}
        title="Send this email again?"
        message="A new copy goes to the same recipients. It appears in the log as a new email."
        confirmLabel="Resend"
        loading={resend.isPending}
        onClose={close}
        onConfirm={() => {
          resend.mutate(undefined, {
            onSuccess: (result) => {
              notify.success(result.message ?? 'A new copy of the email is queued.');
              close();
              void navigate(adminPath('emails', result.data.id));
            },
            onError: (error) => {
              notify.error(error, 'The email could not be resent.');
            },
          });
        }}
      />
    </>
  );
}
