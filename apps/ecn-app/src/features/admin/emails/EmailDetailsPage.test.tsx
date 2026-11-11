import type { EmailDetails } from '@cyient/api-client/platform';
import { configure, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, type MockRoutes } from '@cyient/shared-ui/test';
import { AdminArea } from '../AdminArea';
// The pages load lazily; importing them here first means the routes render without waiting for them to compile
import './EmailDetailsPage';

const failed: EmailDetails = {
  id: 42,
  subject: 'DCR-2026-0012 is waiting for your review',
  toAddresses: 'manager@cyient.test',
  ccAddresses: null,
  bodyHtml: '<p>Please <a href="https://dcr.cyient.test/requests/12">review</a>.</p>',
  status: 'Failed',
  attemptCount: 3,
  lastError: 'Mailbox unavailable',
  eventType: 'ReviewAssigned',
  referenceId: 12,
  createdAt: '2026-11-03T05:00:00Z',
  sentAt: null,
  nextAttemptAt: null,
  linkUrl: 'https://dcr.cyient.test/requests/12',
  messageId: 'msg-42',
  traceId: 'trace-42',
  triggeredBy: { id: 5, name: 'Riya Requester' },
  workflowAction: 'Submit',
  workflowStage: 'DeptManagerReview',
};

const renderEmail = (email: EmailDetails, routes: MockRoutes = {}) => {
  renderWithProviders(
    <Routes>
      <Route path="admin/*" element={<AdminArea />} />
    </Routes>,
    {
      path: `/admin/emails/${email.id}`,
      routes: { 'GET /api/v1/admin/emails/{emailId}': () => email, ...routes },
      me: { permissions: ['platform.email.manage'] },
    },
  );
};

// Pages render the whole provider tree and MUI; give slow machines time
configure({ asyncUtilTimeout: 5000 });

describe('Email details', () => {
  it('shows the body in a sandboxed frame and offers Retry, not Resend, for a failed email', async () => {
    const retried = vi.fn();
    renderEmail(failed, {
      'POST /api/v1/admin/emails/{emailId}/retry': ({ params }) => {
        retried(params.emailId);
        return { ...failed, status: 'Pending', lastError: null };
      },
    });

    const frame = await screen.findByTitle(`Body of the email "${failed.subject}"`);
    expect(frame.tagName).toBe('IFRAME');
    expect(frame).toHaveAttribute('sandbox', '');
    expect(frame).toHaveAttribute('srcdoc', failed.bodyHtml);
    expect(screen.getByText('Mailbox unavailable')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Resend' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('The email is queued to be tried again.')).toBeInTheDocument();
    expect(retried).toHaveBeenCalledWith('42');
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    });
  });

  it('offers Resend, not Retry, for a sent email', async () => {
    renderEmail({ ...failed, status: 'Sent', lastError: null, sentAt: '2026-11-03T05:01:00Z' });

    expect(await screen.findByRole('button', { name: 'Resend' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });
});
