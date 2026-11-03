import type { AuditEntry, EmailListItem, HistoryEntry } from '@cyient/api-client/platform';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useHttpClient } from '../api/HttpClientContext';
import { renderWithProviders } from '../test';
import { RecordHistoryTabs, type RecordHistoryLoaders } from './RecordHistoryTabs';

const history: HistoryEntry[] = [
  {
    kind: 'Workflow',
    at: '2026-11-02T05:30:00Z',
    user: { id: 1, name: 'Riya Requester' },
    action: 'Submitted',
    stage: 'ImsReview',
    item: null,
    itemId: null,
    field: null,
    oldValue: null,
    newValue: null,
    comment: 'Ready for review',
  },
];

const email = (id: number): EmailListItem => ({
  id,
  eventType: 'RequestSubmitted',
  toAddresses: `reviewer${String(id)}@example.com`,
  ccAddresses: null,
  subject: `Request ${String(id)} submitted`,
  status: 'Sent',
  attemptCount: 1,
  createdAt: '2026-11-02T05:31:00Z',
  sentAt: '2026-11-02T05:32:00Z',
  referenceId: null,
  triggeredBy: null,
});

const audit: AuditEntry[] = [
  {
    id: 7,
    tableName: 'Request',
    recordId: 'abc',
    action: 'Update',
    fieldName: 'DocumentReference',
    oldValue: 'QMS-1',
    newValue: 'QMS-2',
    changedAt: '2026-11-02T06:00:00Z',
    user: null,
    traceId: null,
  },
];

/** A paged answer: the rows of the page asked for, with the paging the API gives. */
function paged<Row>(rows: Row[], url: URL): Response {
  const page = Number(url.searchParams.get('page'));
  const pageSize = Number(url.searchParams.get('pageSize'));
  return new Response(
    JSON.stringify({
      success: true,
      data: rows.slice((page - 1) * pageSize, page * pageSize),
      message: null,
      errors: [],
      meta: { page, pageSize, totalCount: rows.length, totalPages: Math.ceil(rows.length / pageSize) },
      traceId: 'test',
      timestamp: '',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}

const emails = Array.from({ length: 25 }, (_, i) => email(i + 1));

const routes = {
  'GET /api/v1/admin/records/{publicId}/history': () => history,
  'GET /api/v1/admin/records/{publicId}/emails': ({ url }: { url: URL }) => paged(emails, url),
  'GET /api/v1/admin/records/{publicId}/audit': ({ url }: { url: URL }) => paged(audit, url),
};

/** A page's loaders: its API's …/history, …/emails and …/audit of one record. */
function Record({ onTabChange, tab }: { onTabChange?: (tab: string) => void; tab?: string }) {
  const http = useHttpClient();
  const path = { publicId: 'abc' };
  const loaders: RecordHistoryLoaders = {
    history: async ({ signal }) => (await http.request<HistoryEntry[]>('get', '/api/v1/admin/records/{publicId}/history', { path, signal })).data,
    emails: ({ page, pageSize, signal }) => http.request<EmailListItem[]>('get', '/api/v1/admin/records/{publicId}/emails', { path, query: { page, pageSize }, signal }),
    audit: ({ page, pageSize, signal }) => http.request<AuditEntry[]>('get', '/api/v1/admin/records/{publicId}/audit', { path, query: { page, pageSize }, signal }),
  };
  return (
    <RecordHistoryTabs
      loaders={loaders}
      queryKey={['test', 'record', 'abc']}
      formatStage={(stage) => (stage === 'ImsReview' ? 'IMS Review' : stage)}
      tab={tab}
      onTabChange={onTabChange}
      extraTabs={[{ value: 'tasks', label: 'Open tasks', anyOf: ['platform.task.manage'], content: <p>The open tasks</p> }]}
    />
  );
}

const administrator = { permissions: ['platform.audit.view', 'platform.email.manage', 'platform.task.manage'] };

describe('RecordHistoryTabs', () => {
  it('shows the history, then pages through the emails and the audit trail', async () => {
    renderWithProviders(<Record />, { routes, me: administrator });

    const historyTable = await screen.findByRole('table', { name: 'History' });
    expect(within(historyTable).getByText('Submitted · IMS Review')).toBeInTheDocument();
    expect(within(historyTable).getByText('Ready for review')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Emails' }));
    const emailTable = await screen.findByRole('table', { name: 'Emails' });
    expect(within(emailTable).getByText('Request 1 submitted')).toBeInTheDocument();
    expect(within(emailTable).queryByText('Request 21 submitted')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(await screen.findByText('Request 21 submitted')).toBeInTheDocument();
    expect(screen.queryByText('Request 1 submitted')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Audit trail' }));
    const auditTable = await screen.findByRole('table', { name: 'Audit trail' });
    expect(within(auditTable).getByText('DocumentReference')).toBeInTheDocument();
    expect(within(auditTable).getByText('QMS-1 → QMS-2')).toBeInTheDocument();
    expect(within(auditTable).getByText('System')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Open tasks' }));
    expect(screen.getByText('The open tasks')).toBeInTheDocument();
  });

  it('shows each list only to holders of its permission', async () => {
    renderWithProviders(<Record />, { routes, me: { permissions: ['platform.email.manage'] } });

    expect(await screen.findByText('No access')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Emails' }));
    expect(await screen.findByRole('table', { name: 'Emails' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Open tasks' }));
    expect(screen.getByText('No access')).toBeInTheDocument();
  });

  it('leaves the open tab to the page when it keeps it', async () => {
    const onTabChange = vi.fn();
    renderWithProviders(<Record tab="audit" onTabChange={onTabChange} />, { routes, me: administrator });

    expect(await screen.findByRole('table', { name: 'Audit trail' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Emails' }));

    expect(onTabChange).toHaveBeenCalledWith('emails');
    expect(screen.getByRole('tab', { name: 'Audit trail' })).toHaveAttribute('aria-selected', 'true');
  });
});
