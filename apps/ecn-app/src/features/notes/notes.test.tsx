import type { CftActionDetails, CftActionInput, CftTeamRow, DraftDetails, NoteDetails, PublishToCftInput } from '@cyient/api-client/ecn';
import { renderWithProviders } from '@cyient/shared-ui/test';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { NoteDetailsPage } from './NoteDetailsPage';
import { NewNotePage } from './NoteFormPage';

const noActions: NonNullable<NoteDetails['allowedActions']> = {
  canApprove: false,
  canEdit: false,
  canEditLines: false,
  canPublishToCft: false,
  canPublishToReviewer: false,
  canRecordAttendance: false,
  canRelease: false,
  canReview: false,
  canSendMeetingNotification: false,
  editableFunctionIds: [],
};

function teamRow(overrides: Partial<CftTeamRow>): CftTeamRow {
  return {
    functionId: 1,
    functionName: 'NPI Engineer',
    isInitiatorRow: false,
    member: null,
    notApplicable: false,
    remarks: null,
    attended: null,
    actions: [],
    tabEnabled: false,
    ...overrides,
  };
}

function action(overrides: Partial<CftActionDetails> = {}): CftActionDetails {
  return {
    id: 11,
    sortOrder: 1,
    actionText: 'Update the control plan',
    status: 'Open',
    targetDate: null,
    closedDate: null,
    comments: null,
    fromRevision: null,
    toRevision: null,
    dispositionStatus: null,
    itemAffected: null,
    rawMaterial: null,
    version: 'a1',
    ...overrides,
  };
}

/** A non-SAP ECN raised by someone else (the test user is user 1), in CFT Meeting. */
function note(overrides: Partial<NoteDetails> = {}): NoteDetails {
  return {
    publicId: 'n1',
    noteNo: '600000000042',
    noteType: 'Ecn',
    ecnKind: 'NonSap',
    status: 'CftMeeting',
    statusName: 'CFT Meeting',
    productNumber: 'PCB-100',
    productDescription: 'Controller card',
    productRevisionNumber: 'B',
    customer: { id: 7, name: 'ACME AVIONICS' },
    customerProductNumber: 'AC-55',
    customerEcnNumber: 'NA',
    customerEcnDate: null,
    customerTcnNumber: null,
    effectiveSerialNumber: null,
    reasonForChange: null,
    ecrApprovalFromCustomer: false,
    category1: { id: 1, name: 'Cutin' },
    category2: { id: 2, name: 'BOM Change' },
    summary: 'Replace capacitor C12',
    fai: 'NotRequired',
    comments: null,
    implementationDate: '2026-12-01',
    initiator: { id: 5, name: 'Naveen NPI' },
    reviewer: { id: 8, name: 'Ramesh Reviewer' },
    approver: { id: 9, name: 'Anita Approver' },
    sapEcnDate: null,
    sapEcnNumber: null,
    createdAt: '2026-11-01T05:00:00Z',
    meetingNotifiedAt: '2026-11-02T05:00:00Z',
    publishedToCftAt: null,
    cftClosedAt: null,
    approvedAt: null,
    releasedAt: null,
    targetDate: null,
    cftTeam: [
      teamRow({ functionId: 1, functionName: 'NPI Engineer', isInitiatorRow: true, member: { id: 5, name: 'Naveen NPI' } }),
      teamRow({ functionId: 2, functionName: 'Quality', member: { id: 1, name: 'Kiran Quality' } }),
    ],
    parts: [],
    immediateActions: [],
    attachments: [],
    missingForMeetingNotification: [],
    allowedActions: noActions,
    version: 'v1',
    ...overrides,
  };
}

const details = (
  <Routes>
    <Route path="notes/:publicId" element={<NoteDetailsPage />} />
  </Routes>
);

describe('note details', () => {
  it('offers only the steps the API allows, and never the release of your own note', async () => {
    renderWithProviders(details, {
      path: '/notes/n1',
      routes: {
        'GET /api/v1/notes/{publicId}': () =>
          note({ initiator: { id: 1, name: 'Riya Requester' }, allowedActions: { ...noActions, canPublishToCft: true, canRelease: true } }),
      },
    });

    expect(await screen.findByRole('heading', { name: 'ECN 600000000042' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish to CFT' })).toBeInTheDocument();
    for (const name of ['Send meeting notification', 'Publish to Reviewer', 'Review', 'Approve', 'Release', 'Edit']) {
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
    }
  });

  it('publishes to the CFT with the target date and the version that was shown', async () => {
    const publish = vi.fn((_: PublishToCftInput) => note({ status: 'CftReview', statusName: 'CFT Review', targetDate: '2099-12-31', version: 'v2' }));
    renderWithProviders(details, {
      path: '/notes/n1',
      routes: {
        'GET /api/v1/notes/{publicId}': () => note({ allowedActions: { ...noActions, canPublishToCft: true } }),
        'POST /api/v1/notes/{publicId}/publish-to-cft': ({ body }) => publish(body as PublishToCftInput),
      },
    });

    await userEvent.click(await screen.findByRole('button', { name: 'Publish to CFT' }));
    const dialog = await screen.findByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Publish to CFT' });
    expect(confirm).toBeDisabled();

    await userEvent.click(within(dialog).getByRole('spinbutton', { name: 'Day' }));
    await userEvent.keyboard('31122099');
    await userEvent.click(confirm);

    expect(publish).toHaveBeenCalledWith({ targetDate: '2099-12-31', comment: null, version: 'v1' });
    expect(await screen.findByText('CFT Review')).toBeInTheDocument();
  });
});

describe('CFT actions', () => {
  it('closes an action only with its target and closed dates', async () => {
    const update = vi.fn((_: CftActionInput) => note({ status: 'CftReview' }));
    renderWithProviders(details, {
      path: '/notes/n1?tab=function-2',
      routes: {
        'GET /api/v1/notes/{publicId}': () =>
          note({
            status: 'CftReview',
            publishedToCftAt: '2026-11-03T05:00:00Z',
            cftTeam: [teamRow({ functionId: 2, functionName: 'Quality', member: { id: 1, name: 'Kiran Quality' }, tabEnabled: true, actions: [action()] })],
            allowedActions: { ...noActions, editableFunctionIds: [2] },
          }),
        'PUT /api/v1/notes/{publicId}/cft-actions/{actionId}': ({ body }) => update(body as CftActionInput),
      },
    });

    await userEvent.click(await screen.findByRole('button', { name: 'Update action 1' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('combobox', { name: /Status/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Closed' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(await within(dialog).findByText('Target date is required to close an action.')).toBeInTheDocument();
    expect(within(dialog).getByText('Closed date is required to close an action.')).toBeInTheDocument();
    expect(update).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole('combobox', { name: /Status/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Not Applicable' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ status: 'NotApplicable', targetDate: null, closedDate: null, version: 'a1' }));
  });
});

describe('new ECN or TCN', () => {
  const routes = (create: (draft: DraftDetails) => unknown) => ({
    'GET /api/v1/customers': () => [{ id: 7, name: 'ACME AVIONICS', isActive: true, version: 'c1' }],
    'GET /api/v1/masters/{masterType}': () => [],
    'POST /api/v1/notes': ({ body }: { body: unknown }) => create(body as DraftDetails),
  });
  const page = (
    <Routes>
      <Route path="notes/new" element={<NewNotePage />} />
    </Routes>
  );

  it('asks a SAP ECN for its 5-series SAP number, date and PDF', async () => {
    const create = vi.fn();
    renderWithProviders(page, { path: '/notes/new', me: { permissions: ['ecn.note.create'] }, routes: routes(create) });

    await userEvent.click(await screen.findByRole('radio', { name: 'ECN' }));
    await userEvent.click(await screen.findByRole('radio', { name: 'SAP' }));
    const sapNumber = screen.getByRole('textbox', { name: /SAP ECN number/ });
    await userEvent.type(sapNumber, '612345678901');
    await userEvent.click(screen.getByRole('button', { name: 'Save draft' }));

    expect(await screen.findByText('SAP ECN Number is the 12-digit 5-series number from SAP.')).toBeInTheDocument();
    expect(screen.getByText('SAP ECN Date is required for a SAP ECN.')).toBeInTheDocument();
    expect(screen.getByText('Attach the SAP ECN PDF.')).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();

    await userEvent.clear(sapNumber);
    await userEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(await screen.findByText('SAP ECN Number is required for a SAP ECN.')).toBeInTheDocument();

    await userEvent.type(sapNumber, '512345678901');
    expect(screen.queryByText('SAP ECN Number is the 12-digit 5-series number from SAP.')).not.toBeInTheDocument();
    expect(screen.queryByText('SAP ECN Number is required for a SAP ECN.')).not.toBeInTheDocument();
  });

  it('asks a TCN for its four TCN fields', async () => {
    const create = vi.fn();
    renderWithProviders(page, { path: '/notes/new?type=Tcn', me: { permissions: ['ecn.note.create'] }, routes: routes(create) });

    expect(await screen.findByRole('radio', { name: 'TCN' })).toBeChecked();
    expect(screen.queryByRole('textbox', { name: /Customer ECN number/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save draft' }));

    for (const message of [
      'Effective Product Serial Number is required.',
      'Customer TCN Number is required; enter NA when there is none.',
      'Reason for Change is required.',
      'Comments are required on a TCN; enter NA when there are none.',
    ]) {
      expect(await screen.findByText(message)).toBeInTheDocument();
    }
    expect(create).not.toHaveBeenCalled();
  });
});
