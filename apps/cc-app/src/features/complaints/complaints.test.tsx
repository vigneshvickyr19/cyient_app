import type { ActionDetails, CloseActionInput, ComplaintDetails, ComplaintInput, EvidenceFile, WorkflowActionInput } from '@cyient/api-client/cc';
import type { MasterItemDetails, PersonResult } from '@cyient/api-client/platform';
import { renderWithProviders } from '@cyient/shared-ui/test';
import { businessToday } from '@cyient/shared-utils';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ComplaintDetailsPage } from './ComplaintDetailsPage';
import { NewComplaintPage } from './ComplaintFormPage';

/** The signed-in test user (renderWithProviders' testUser) is user 1. */
const me = { id: 1, name: 'Sanjay Initiator' };

const noActions = {
  canEdit: false,
  canPublish: false,
  canSaveRootCause: false,
  canManageActions: false,
  canCompleteActionPlan: false,
  canSaveVerification: false,
  canSaveHorizontalDeployment: false,
  canSaveClosureSummary: false,
  canClose: false,
};

function complaint(overrides: Partial<ComplaintDetails> = {}): ComplaintDetails {
  return {
    publicId: 'c1',
    complaintNo: null,
    status: 'Draft',
    statusName: 'Draft',
    initiator: me,
    customer: { id: 1, name: 'Aero Systems Ltd' },
    complaintDate: '2026-11-03',
    reportedDate: null,
    customerReference: null,
    modeOfCommunication: null,
    source: null,
    internalPartNo: 'PCB-100',
    partDescription: null,
    rejectedQuantity: null,
    complaintDescription: 'Boards fail at power-on',
    processCategory: null,
    detectionStage: null,
    acknowledgementDate: null,
    isRepeat: false,
    repeatOf: null,
    customerPartNo: null,
    revision: null,
    batch: null,
    quantityShipped: null,
    serialNumbers: null,
    isCritical: false,
    customerContact: null,
    problemDescription: null,
    location: null,
    required: null,
    requiredJustification: null,
    teamMembers: [],
    containmentActions: [],
    rootCause: { occurrence: null, nonDetection: null, system: null },
    actions: [],
    verification: null,
    horizontalDeployment: null,
    closureSummary: null,
    publishedAt: null,
    closedAt: null,
    version: 'v1',
    allowedActions: { ...noActions, canEdit: true },
    documentCount: 0,
    ...overrides,
  };
}

const customers: MasterItemDetails[] = [
  { id: 1, masterType: 'Customer', code: 'C001', name: 'Aero Systems Ltd', isActive: true, sortOrder: 1, version: 'm1' },
  { id: 2, masterType: 'Customer', code: 'C002', name: 'MedTech Devices Inc', isActive: true, sortOrder: 2, version: 'm2' },
];

const people: PersonResult[] = [
  { id: 5, displayName: 'Meera Member', email: 'member@cyientdlm.local', designation: 'Engineer - Production', department: 'Production' },
];

const details = (
  <Routes>
    <Route path="complaints/:publicId" element={<ComplaintDetailsPage />} />
  </Routes>
);

describe('new complaint', () => {
  it('needs only the customer, and sends the first page with today as the complaint date and the team', async () => {
    const create = vi.fn((_: ComplaintInput) => complaint({ publicId: 'new1' }));
    renderWithProviders(
      <Routes>
        <Route path="complaints/new" element={<NewComplaintPage />} />
        <Route path="complaints/:publicId" element={<p>Complaint opened</p>} />
      </Routes>,
      {
        path: '/complaints/new',
        me: { permissions: ['cc.complaint.create'] },
        routes: {
          'GET /api/v1/masters/{masterType}': ({ params }) => (params.masterType === 'Customer' ? customers : []),
          'GET /api/v1/directory/users': () => people,
          'POST /api/v1/complaints': ({ body }) => create(body as ComplaintInput),
        },
      },
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Save draft' }));
    expect(await screen.findByText('Customer is required.')).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('combobox', { name: /^Customer/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Aero Systems Ltd' }));
    await userEvent.type(screen.getByRole('combobox', { name: /Add a team member/ }), 'Me');
    await userEvent.click(await screen.findByRole('option', { name: /Meera Member/ }));
    expect(within(screen.getByRole('list', { name: 'Team members' })).getByText('Meera Member')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Save draft' }));

    expect(await screen.findByText('Complaint opened')).toBeInTheDocument();
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      customerId: 1,
      complaintDate: businessToday(),
      reportedDate: null,
      customerReference: null,
      modeOfCommunicationId: null,
      sourceId: null,
      internalPartNo: null,
      partDescription: null,
      rejectedQuantity: null,
      complaintDescription: null,
      processCategoryId: null,
      detectionStageId: null,
      acknowledgementDate: null,
      isRepeat: false,
      repeatOfPublicId: null,
      customerPartNo: null,
      revision: null,
      batch: null,
      quantityShipped: null,
      serialNumbers: null,
      isCritical: false,
      customerContact: null,
      problemDescription: null,
      locationId: null,
      required: null,
      requiredJustification: null,
      teamMemberUserIds: [5],
      version: null,
    });
  });
});

describe('publishing a draft', () => {
  it('is refused while the draft has no team member', async () => {
    const publish = vi.fn();
    renderWithProviders(details, {
      path: '/complaints/c1',
      routes: {
        'GET /api/v1/complaints/{publicId}': () => complaint(),
        'POST /api/v1/complaints/{publicId}/publish': publish,
      },
    });

    expect(await screen.findByRole('heading', { name: 'Draft complaint' })).toBeInTheDocument();
    expect(screen.getByText('Add at least one team member before publishing.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled();
    expect(publish).not.toHaveBeenCalled();
  });

  it('publishes with a team member, sending the version shown, and opens D4', async () => {
    const team = [{ userId: 5, name: 'Meera Member', email: 'member@cyientdlm.local', designation: 'Engineer - Production' }];
    const publish = vi.fn((_: WorkflowActionInput) =>
      complaint({
        complaintNo: 'CC/2026/0001',
        status: 'RootCause',
        statusName: 'D4 Root Cause',
        teamMembers: team,
        publishedAt: '2026-11-03T05:00:00Z',
        version: 'v2',
        allowedActions: { ...noActions, canEdit: true, canSaveRootCause: true },
      }),
    );
    renderWithProviders(details, {
      path: '/complaints/c1',
      routes: {
        'GET /api/v1/complaints/{publicId}': () => complaint({ teamMembers: team, allowedActions: { ...noActions, canEdit: true, canPublish: true } }),
        'POST /api/v1/complaints/{publicId}/publish': ({ body }) => publish(body as WorkflowActionInput),
      },
    });

    expect(await screen.findByRole('heading', { name: 'Draft complaint' })).toBeInTheDocument();
    expect(screen.queryByText('Add at least one team member before publishing.')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Publish' }));

    expect(publish).toHaveBeenCalledWith({ comment: null, version: 'v1' });
    expect(await screen.findByRole('heading', { name: 'CC/2026/0001' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save root cause' })).toBeInTheDocument();
  });
});

describe('closing a D5 action', () => {
  it('needs evidence first, then sends the remarks and the latest version', async () => {
    let evidence: EvidenceFile[] = [];
    const action = (): ActionDetails => ({
      id: 7,
      description: 'Replace the solder paste',
      owner: me,
      targetDate: '2099-01-01',
      status: 'Open',
      closedAt: null,
      closedBy: null,
      closureRemarks: null,
      evidence,
      sortOrder: 1,
      version: evidence.length ? 'a2' : 'a1',
      canClose: true,
    });
    const atActionPlan = () =>
      complaint({
        complaintNo: 'CC/2026/0001',
        status: 'ActionPlan',
        statusName: 'D5 Action Plan',
        initiator: { id: 3, name: 'Riya Initiator' },
        publishedAt: '2026-11-03T05:00:00Z',
        actions: [action()],
        allowedActions: noActions,
      });
    const upload = vi.fn(() => {
      evidence = [{ fileId: 11, fileKey: 'k1', fileName: 'photo.png', versionNo: 1 }];
      return { id: 11, fileKey: 'k1', fileName: 'photo.png', contentType: 'image/png', versionNo: 1, isCurrent: true, sizeBytes: 8, uploadedBy: me, uploadedAt: '2026-11-03T06:00:00Z' };
    });
    const close = vi.fn((_: CloseActionInput) => atActionPlan());
    renderWithProviders(details, {
      path: '/complaints/c1',
      routes: {
        'GET /api/v1/complaints/{publicId}': atActionPlan,
        'POST /api/v1/complaints/{publicId}/actions/{actionId}/evidence': upload,
        'POST /api/v1/complaints/{publicId}/actions/{actionId}/close': ({ body }) => close(body as CloseActionInput),
      },
    });

    await userEvent.click(await screen.findByRole('button', { name: 'Close action 1' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close action' }));
    expect(await within(dialog).findByText('Attach the evidence before closing the action.')).toBeInTheDocument();
    expect(close).not.toHaveBeenCalled();

    const input = dialog.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(input, new File(['evidence'], 'photo.png', { type: 'image/png' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Upload' }));
    expect(await within(dialog).findByRole('button', { name: 'photo.png' })).toBeInTheDocument();
    expect(upload).toHaveBeenCalledTimes(1);
    expect(within(dialog).queryByText('Attach the evidence before closing the action.')).not.toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close action' }));
    expect(close).toHaveBeenCalledWith({ remarks: null, version: 'a2' });
  });
});
