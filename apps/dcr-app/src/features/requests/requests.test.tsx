import type { DraftDetails, RequestDetails, WorkflowActionInput } from '@cyient/api-client/dcr';
import { renderWithProviders } from '@cyient/shared-ui/test';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { RequestDetailsPage } from './RequestDetailsPage';
import { NewRequestPage } from './RequestFormPage';

function request(overrides: Partial<RequestDetails> = {}): RequestDetails {
  return {
    publicId: 'p1',
    requestNo: 'DCR/2026/0042',
    status: 'ImsReview',
    releasedStatus: 'NotYetReleased',
    requestFrom: { id: 3, name: 'Riya Requester' },
    designation: 'Sr. Engineer - Quality',
    requestDate: '2026-11-03',
    location: { id: 1, name: 'Hyderabad Unit' },
    department: { id: 2, name: 'QMS' },
    documentReference: 'QMS-PR-07',
    currentRevisionNo: '3',
    currentRevisionDate: '2026-10-01',
    documentDescription: 'Document control procedure',
    reasonCategory: { id: 5, name: 'Process Change' },
    reasonForChanges: 'New review step',
    riskToQms: 'Low',
    riskToDevices: 'None',
    deptManager: { id: 4, name: 'Manoj Manager' },
    deptHead: { id: 6, name: 'Harini Head' },
    needByDate: '2026-12-01',
    submittedAt: '2026-11-03T05:00:00Z',
    releaseDate: null,
    effectiveImplementationDate: null,
    clauses: [],
    version: 'v7',
    allowedActions: { canEdit: false, canSubmit: false, canApprove: true, canRevert: true, canReject: true, canRelease: false },
    documentCount: 1,
    reviewStarted: true,
    ...overrides,
  };
}

const details = (
  <Routes>
    <Route path="requests/:publicId" element={<RequestDetailsPage />} />
  </Routes>
);

describe('request details', () => {
  it('offers only the actions the API allows', async () => {
    renderWithProviders(details, { path: '/requests/p1', routes: { 'GET /api/v1/requests/{publicId}': () => request() } });

    expect(await screen.findByRole('heading', { name: 'DCR/2026/0042' })).toBeInTheDocument();
    expect(screen.getByText('IMS Review')).toBeInTheDocument();
    for (const name of ['Approve', 'Send back', 'Reject']) expect(screen.getByRole('button', { name })).toBeInTheDocument();
    for (const name of ['Submit', 'Release', 'Edit']) expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
  });

  it('rejects only with a comment, sending the version that was shown', async () => {
    const reject = vi.fn((_: WorkflowActionInput) => request({ status: 'ImsRejected', allowedActions: undefined, version: 'v8' }));
    renderWithProviders(details, {
      path: '/requests/p1',
      routes: {
        'GET /api/v1/requests/{publicId}': () => request(),
        'POST /api/v1/requests/{publicId}/reject': ({ body }) => reject(body as WorkflowActionInput),
      },
    });

    await userEvent.click(await screen.findByRole('button', { name: 'Reject' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reject' }));
    expect(within(dialog).getByText('Comment is required.')).toBeInTheDocument();
    expect(reject).not.toHaveBeenCalled();

    await userEvent.type(within(dialog).getByRole('textbox', { name: /Comment/ }), 'Wrong template');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reject' }));

    expect(reject).toHaveBeenCalledWith({ comment: 'Wrong template', version: 'v7' });
    expect(await screen.findByText('Rejected at IMS Review')).toBeInTheDocument();
  });
});

describe('new request', () => {
  it('names every missing field before saving, as the API would', async () => {
    const create = vi.fn((_: DraftDetails) => null);
    renderWithProviders(
      <Routes>
        <Route path="requests/new" element={<NewRequestPage />} />
      </Routes>,
      {
        path: '/requests/new',
        me: { permissions: ['dcr.request.create'] },
        routes: { 'GET /api/v1/masters/{masterType}': () => [], 'POST /api/v1/requests': ({ body }) => create(body as DraftDetails) },
      },
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Save draft' }));

    for (const message of [
      'Location is required.',
      'Department/Function is required.',
      'Document Reference is required.',
      'Need By Date is required.',
      'Review By Department Manager is required.',
      'Review By Department Head is required.',
    ]) {
      expect(await screen.findByText(message)).toBeInTheDocument();
    }
    expect(create).not.toHaveBeenCalled();
  });
});
