import type { ApproveInput, DraftDetails, MasterItemDetails, PersonResult, RequestDetails, ReviewerBox, WorkflowActionInput } from '@cyient/api-client/dn';
import { renderWithProviders } from '@cyient/shared-ui/test';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { RequestDetailsPage } from './RequestDetailsPage';
import { NewRequestPage } from './RequestFormPage';

const masters: Record<string, [number, string][]> = {
  Department: [[21, 'Production']],
  Customer: [[11, 'Aero Systems Ltd']],
  Unit: [[31, 'Hyderabad Unit']],
  ChangeCategory: [[41, 'Material']],
};

const masterItems = (type: string): MasterItemDetails[] =>
  (masters[type] ?? []).map(([id, name], index) => ({ id, name, code: name.slice(0, 3), masterType: type, isActive: true, sortOrder: index, version: 'm1' }));

const boxes: ReviewerBox[] = [
  { id: 100, changeCategoryId: 41, sequence: 1, name: 'Quality', isMandatory: true, isHeadOfDepartment: false },
  { id: 101, changeCategoryId: 41, sequence: 2, name: 'Head of department', isMandatory: true, isHeadOfDepartment: true },
];

const people: PersonResult[] = [
  { id: 7, displayName: 'Kiran Quality', designation: 'Engineer - Quality', department: 'Quality', email: 'quality@cyientdlm.local' },
  { id: 8, displayName: 'Harini HOD', designation: 'Head - Production', department: 'Production', email: 'hod@cyientdlm.local' },
  { id: 9, displayName: 'Farhan Approver', designation: 'Plant Head', department: 'Operations', email: 'approver@cyientdlm.local' },
];

function request(overrides: Partial<RequestDetails> = {}): RequestDetails {
  return {
    publicId: 'abc',
    requestNo: '2026-0042',
    status: 'PendingApproval',
    statusName: 'Pending',
    initiator: { id: 3, name: 'Sanjay Initiator' },
    designation: 'Sr. Engineer - Production',
    requestDate: '2026-11-03',
    initiatorDepartment: { id: 21, name: 'Production' },
    workOrderNo: 'WO-77',
    lineCellEquipmentNo: 'Line 4',
    customer: { id: 11, name: 'Aero Systems Ltd' },
    productFgNumber: 'FG-1001',
    unit: { id: 31, name: 'Hyderabad Unit' },
    deviationQuantity: 12,
    changeCategory: { id: 41, name: 'Material' },
    prescribedProcess: 'Torque 10 Nm',
    processChangeRequired: 'Torque 12 Nm',
    reasonForChange: 'Supplier change',
    preventiveAction: 'Update the work instruction',
    reportingManager: { id: 4, name: 'Manoj Manager' },
    submittedAt: '2026-11-03T05:00:00Z',
    financialYear: '2026-27',
    currentReviewerId: 502,
    pendingWith: { id: 1, name: 'Riya Requester' },
    pendingRole: 'Quality',
    moreInfo: null,
    revertComments: null,
    furtherApprovalRequired: null,
    finalApprovalDate: null,
    validUntil: null,
    startingSerialNo: null,
    endingSerialNo: null,
    closeComment: null,
    closedAt: null,
    reviewers: [
      { id: 501, boxId: null, sequence: 0, kind: 'ReportingManager', name: 'Reporting Manager', user: { id: 4, name: 'Manoj Manager' }, status: 'Approved', reviewedAt: '2026-11-03T06:00:00Z', remarks: 'Fine', triggerCount: 0 },
      { id: 502, boxId: 100, sequence: 1, kind: 'Reviewer', name: 'Quality', user: { id: 1, name: 'Riya Requester' }, status: 'Pending', reviewedAt: null, remarks: null, triggerCount: 1 },
    ],
    informedPeople: [],
    version: 'v3',
    documentCount: 0,
    allowedActions: {
      canEdit: false,
      canSubmit: false,
      canUpload: true,
      canReview: true,
      answersFurtherApproval: false,
      canUpdateSerials: false,
      canClose: false,
      canChangePeople: false,
      canDownloadPdf: false,
    },
    ...overrides,
  };
}

const details = (
  <Routes>
    <Route path="requests/:publicId" element={<RequestDetailsPage />} />
  </Routes>
);

describe('new deviation', () => {
  const page = (
    <Routes>
      <Route path="requests/new" element={<NewRequestPage />} />
      <Route path="requests/:publicId" element={<p>Draft opened</p>} />
    </Routes>
  );

  const routes = (create: (draft: DraftDetails) => RequestDetails) => ({
    'GET /api/v1/masters/{masterType}': ({ params }: { params: Record<string, string> }) => masterItems(params.masterType ?? ''),
    'GET /api/v1/reviewer-boxes': () => boxes,
    'GET /api/v1/directory/users': () => people,
    'POST /api/v1/requests': ({ body }: { body: unknown }) => create(body as DraftDetails),
  });

  async function choose(label: RegExp, option: string) {
    await userEvent.click(screen.getByRole('combobox', { name: label }));
    await userEvent.click(await screen.findByRole('option', { name: option }));
  }

  async function pickPerson(label: RegExp, name: string) {
    await userEvent.type(await screen.findByRole('combobox', { name: label }), name.slice(0, 3));
    await userEvent.click(await screen.findByRole('option', { name: new RegExp(name) }));
  }

  /** Puts the text in a field in one go (typing every letter of long text is slow). */
  async function fill(label: RegExp, text: string) {
    await userEvent.click(screen.getByRole('textbox', { name: label }));
    await userEvent.paste(text);
  }

  it('names every missing field before saving, as the API would', async () => {
    const create = vi.fn(() => request());
    renderWithProviders(page, { path: '/requests/new', me: { permissions: ['dn.request.create'] }, routes: routes(create) });

    await userEvent.click(await screen.findByRole('button', { name: 'Save draft' }));

    for (const message of [
      'Initiator Department is required.',
      'W.O No is required.',
      'Line No. / Cell No / Equip No is required.',
      'Customer is required.',
      'Product FG Number is required.',
      'Unit Number is required.',
      'Deviation Quantity is required.',
      'Change Category is required.',
      'Prescribed / defined Process is required.',
      'Process Change required is required.',
      'Reason for Change is required.',
      'Action taken to prevent Re-occurrence is required.',
    ]) {
      expect(await screen.findByText(message)).toBeInTheDocument();
    }
    expect(create).not.toHaveBeenCalled();
  });

  it('sends the fields, a person for each box of the category and the people to be informed', async () => {
    const create = vi.fn((_: DraftDetails) => request({ publicId: 'new1', status: 'Draft', requestNo: null }));
    renderWithProviders(page, { path: '/requests/new', me: { permissions: ['dn.request.create'] }, routes: routes(create) });

    await screen.findByRole('button', { name: 'Save draft' });
    await choose(/^Initiator department/, 'Production');
    await fill(/^W\.O no/, 'WO-77');
    await fill(/^Line no/, 'Line 4');
    await choose(/^Customer/, 'Aero Systems Ltd');
    await fill(/^Product FG number/, 'FG-1001');
    await choose(/^Unit number/, 'Hyderabad Unit');
    await userEvent.type(screen.getByRole('spinbutton', { name: /^Deviation quantity/ }), '0');
    await choose(/^Change category/, 'Material');
    await fill(/^Prescribed/, 'Torque 10 Nm');
    await fill(/^Process change required/, 'Torque 12 Nm');
    await fill(/^Reason for change/, 'Supplier change');
    await fill(/^Action taken/, 'Update the work instruction');

    await pickPerson(/^Quality/, 'Kiran Quality');
    await pickPerson(/^Head of department/, 'Harini HOD');
    await pickPerson(/^Add a person/, 'Farhan Approver');
    expect(screen.getByText('Farhan Approver')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(await screen.findByText('Deviation Quantity must be at least 1.')).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();

    await userEvent.clear(screen.getByRole('spinbutton', { name: /^Deviation quantity/ }));
    await userEvent.type(screen.getByRole('spinbutton', { name: /^Deviation quantity/ }), '12');
    await userEvent.click(screen.getByRole('button', { name: 'Save draft' }));

    expect(await screen.findByText('Draft opened')).toBeInTheDocument();
    expect(create).toHaveBeenCalledWith({
      initiatorDepartmentId: 21,
      workOrderNo: 'WO-77',
      lineCellEquipmentNo: 'Line 4',
      customerId: 11,
      productFgNumber: 'FG-1001',
      unitId: 31,
      deviationQuantity: 12,
      changeCategoryId: 41,
      prescribedProcess: 'Torque 10 Nm',
      processChangeRequired: 'Torque 12 Nm',
      reasonForChange: 'Supplier change',
      preventiveAction: 'Update the work instruction',
      reviewers: [
        { boxId: 100, userId: 7 },
        { boxId: 101, userId: 8 },
      ],
      informedUserIds: [9],
      version: null,
    });
  });
});

describe('deviation details', () => {
  it('offers only the actions the API allows', async () => {
    renderWithProviders(details, { path: '/requests/abc', routes: { 'GET /api/v1/requests/{publicId}': () => request() } });

    expect(await screen.findByRole('heading', { name: '2026-0042' })).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    for (const name of ['Approve', 'Update', 'Require more details', 'Reject']) expect(screen.getByRole('button', { name })).toBeInTheDocument();
    for (const name of ['Submit', 'Resubmit', 'Edit', 'PDF']) expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
  });

  it('offers only resubmission to the initiator asked for more details, with an answer required', async () => {
    const submit = vi.fn((_: WorkflowActionInput) => request());
    renderWithProviders(details, {
      path: '/requests/abc',
      me: { userId: 3 },
      routes: {
        'GET /api/v1/requests/{publicId}': () =>
          request({
            status: 'MoreDetailsRequired',
            moreInfo: 'Attach the supplier certificate.',
            allowedActions: { ...request().allowedActions!, canReview: false, canSubmit: true },
          }),
        'POST /api/v1/requests/{publicId}/submit': ({ body }) => submit(body as WorkflowActionInput),
      },
    });

    expect(await screen.findByText('More details are needed from you')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Resubmit' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/goes back to Quality \(Riya Requester\) only/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Resubmit' }));
    expect(within(dialog).getByText('Your answer is required.')).toBeInTheDocument();

    await userEvent.type(within(dialog).getByRole('textbox', { name: /Your answer/ }), 'Certificate attached');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Resubmit' }));
    expect(submit).toHaveBeenCalledWith({ comment: 'Certificate attached', version: 'v3' });
  });

  it.each([
    ['Approve', 'approve', { status: 'Approved' as const }],
    ['Reject', 'reject', { status: 'Rejected' as const }],
  ])('%s needs a comment and sends it with the version that was shown', async (button, path, after) => {
    const act = vi.fn((_: WorkflowActionInput) => request({ ...after, allowedActions: undefined, version: 'v4' }));
    renderWithProviders(details, {
      path: '/requests/abc',
      routes: {
        'GET /api/v1/requests/{publicId}': () => request(),
        [`POST /api/v1/requests/{publicId}/${path}`]: ({ body }) => act(body as WorkflowActionInput),
      },
    });

    await userEvent.click(await screen.findByRole('button', { name: button }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: button }));
    expect(within(dialog).getByText('Comment is required.')).toBeInTheDocument();
    expect(act).not.toHaveBeenCalled();

    await userEvent.type(within(dialog).getByRole('textbox', { name: /Comment/ }), 'Checked the samples');
    await userEvent.click(within(dialog).getByRole('button', { name: button }));

    expect(act).toHaveBeenCalledWith({ comment: 'Checked the samples', version: 'v3' });
    expect((await screen.findAllByText(after.status)).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: button })).not.toBeInTheDocument();
  });

  it("asks the head of department about further approval and needs a final approver when it's required", async () => {
    const approve = vi.fn((_: ApproveInput) => request({ allowedActions: undefined, version: 'v4' }));
    renderWithProviders(details, {
      path: '/requests/abc',
      routes: {
        'GET /api/v1/requests/{publicId}': () => request({ allowedActions: { ...request().allowedActions!, answersFurtherApproval: true } }),
        'GET /api/v1/directory/users': () => people,
        'POST /api/v1/requests/{publicId}/approve': ({ body }) => approve(body as ApproveInput),
      },
    });

    await userEvent.click(await screen.findByRole('button', { name: 'Approve' }));
    const dialog = await screen.findByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Approve' });
    await userEvent.type(within(dialog).getByRole('textbox', { name: /Comment/ }), 'Needs plant head approval');
    expect(confirm).toBeDisabled();

    await userEvent.click(within(dialog).getByRole('radio', { name: 'Yes' }));
    expect(within(dialog).getByText('Choose the final approver.')).toBeInTheDocument();
    expect(confirm).toBeDisabled();

    await userEvent.type(within(dialog).getByRole('combobox', { name: /Final approver/ }), 'Far');
    await userEvent.click(await screen.findByRole('option', { name: /Farhan Approver/ }));
    expect(confirm).toBeEnabled();
    await userEvent.click(confirm);

    expect(approve).toHaveBeenCalledWith({ comment: 'Needs plant head approval', version: 'v3', furtherApprovalRequired: true, finalApproverUserId: 9 });
  });

  it('lets the head of department close it as approved without a final approver', async () => {
    const approve = vi.fn((_: ApproveInput) => request({ status: 'Approved', allowedActions: undefined, version: 'v4' }));
    renderWithProviders(details, {
      path: '/requests/abc',
      routes: {
        'GET /api/v1/requests/{publicId}': () => request({ allowedActions: { ...request().allowedActions!, answersFurtherApproval: true } }),
        'POST /api/v1/requests/{publicId}/approve': ({ body }) => approve(body as ApproveInput),
      },
    });

    await userEvent.click(await screen.findByRole('button', { name: 'Approve' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByRole('textbox', { name: /Comment/ }), 'Fine');
    await userEvent.click(within(dialog).getByRole('radio', { name: 'No' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Approve' }));

    expect(approve).toHaveBeenCalledWith({ comment: 'Fine', version: 'v3', furtherApprovalRequired: false, finalApproverUserId: null });
  });
});
