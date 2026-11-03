import type { IssueDetails, IssueInput, PoLineDetails, WorkflowActionInput } from '@cyient/api-client/mppl';
import { errorResponse, renderWithProviders, type MockRoutes } from '@cyient/shared-ui/test';
import { formatCurrency } from '@cyient/shared-utils';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { IssueDetailsPage } from './IssueDetailsPage';
import { NewIssuePage } from './IssueFormPage';

const poLine: PoLineDetails = {
  poNumber: '4500001234',
  lineNumber: 10,
  poDate: '2026-10-20',
  partNumber: 'PN-7781',
  quantity: 1400,
  supplierName: 'Acme Components',
  mpn: 'ACM-778',
  make: 'Acme',
  price: 750,
  currency: 'USD',
  moq: 500,
};

const notFound = (po: string, line: string) =>
  errorResponse(404, 'MPPL_PO_LINE_NOT_FOUND', `PO ${po} line ${line} is not in the PO data loaded from SAP.`);

const formRoutes: MockRoutes = {
  'GET /api/v1/masters/{masterType}': () => [],
  'GET /api/v1/po-lines/{poNumber}/{lineNumber}': ({ params }) =>
    params.poNumber === poLine.poNumber && params.lineNumber === String(poLine.lineNumber) ? poLine : notFound(params.poNumber ?? '', params.lineNumber ?? ''),
};

function renderNewIssue(routes: MockRoutes = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="issues/new" element={<NewIssuePage />} />
    </Routes>,
    { path: '/issues/new', me: { permissions: ['mppl.issue.create', 'mppl.issue.view'] }, routes: { ...formRoutes, ...routes } },
  );
}

/** Puts text in a field in one go (as pasting does), which keeps these form tests quick. */
async function enter(field: HTMLElement, text: string) {
  await userEvent.clear(field);
  await userEvent.click(field);
  await userEvent.paste(text);
}

async function enterPoLine(po: string, line: string) {
  await enter(await screen.findByRole('textbox', { name: /PO number/ }), po);
  const lineField = screen.getByRole('spinbutton', { name: /PO line/ });
  await enter(lineField, line);
  return lineField;
}

/** The PO line lookup waits for typing to pause before it asks the API. */
const lookup = { timeout: 5_000 };

describe('new issue', () => {
  it('fills in the PO details from the PO line lookup, and shows a line that is not in the PO data on the field', async () => {
    renderNewIssue();

    const lineField = await enterPoLine('4500001234', '10');
    expect(await screen.findByText('Acme Components', {}, lookup)).toBeInTheDocument();
    expect(screen.getByText('PN-7781')).toBeInTheDocument();
    expect(screen.getByText('ACM-778')).toBeInTheDocument();
    expect(lineField).not.toHaveAttribute('aria-invalid', 'true');

    await enter(lineField, '20');

    const message = 'PO 4500001234 line 20 is not in the PO data loaded from SAP.';
    expect(await screen.findByText(message, {}, lookup)).toBeInTheDocument();
    expect(lineField).toHaveAttribute('aria-invalid', 'true');
    expect(lineField).toHaveAccessibleDescription(message);
    expect(screen.queryByText('Acme Components')).not.toBeInTheDocument();
  });

  it('previews the value impact as (new price or system price) × (new quantity or PO quantity) − system price × PO quantity', async () => {
    renderNewIssue();
    await enterPoLine('4500001234', '10');
    await screen.findByText('Acme Components', {}, lookup);
    const impact = screen.getByRole('status', { name: 'Value impact' });
    expect(impact).toHaveTextContent('—');

    // $750 to $770 on 1,400 pieces
    await enter(screen.getByRole('spinbutton', { name: /New price/ }), '770');
    expect(impact).toHaveTextContent(formatCurrency(28_000, 'USD'));

    // and on 1,000 pieces: 770 × 1,000 − 750 × 1,400
    await enter(screen.getByRole('spinbutton', { name: /New quantity/ }), '1000');
    expect(impact).toHaveTextContent(formatCurrency(-280_000, 'USD'));

    await userEvent.clear(screen.getByRole('spinbutton', { name: /New price/ }));
    expect(impact).toHaveTextContent(formatCurrency(-300_000, 'USD'));
  });

  it('names every missing field before saving, as the API would', async () => {
    const create = vi.fn<(input: IssueInput) => null>();
    renderNewIssue({ 'POST /api/v1/issues': ({ body }) => create(body as IssueInput) });

    await userEvent.click(await screen.findByRole('button', { name: 'Save draft' }));

    for (const message of ['Project is required.', 'Commodity is required.', 'Issue is required.', 'PO is required.', 'PO Line Number is required.']) {
      expect(await screen.findByText(message)).toBeInTheDocument();
    }
    expect(create).not.toHaveBeenCalled();
  });
});

function issue(overrides: Partial<IssueDetails> = {}): IssueDetails {
  return {
    publicId: '7f1c2a3b-0000-4000-8000-000000000001',
    status: 'Open',
    project: { id: 1, name: 'Aero Avionics Board' },
    commodity: { id: 3, name: 'Electronics' },
    issueType: { id: 8, name: 'Price issue' },
    raisedBy: { id: 7, name: 'Bhavna Buyer' },
    sourcingLead: { id: 5, name: 'Sharath Sourcing' },
    escalation1: { id: 4, name: 'Gopal Escalation 1' },
    escalation2: null,
    escalation3: null,
    escalationLevel: 0,
    escalations: [],
    pendingWith: 'Sharath Sourcing',
    createdAt: '2026-11-02T05:00:00Z',
    submittedAt: '2026-11-02T06:00:00Z',
    closedAt: null,
    closedBy: null,
    sourcingComment: null,
    customerName: 'ABB India',
    customerGroup: 'ABB',
    segment: 'Commercial',
    poNumber: poLine.poNumber,
    poLineNumber: poLine.lineNumber,
    poDate: poLine.poDate,
    partNumber: poLine.partNumber,
    quantity: poLine.quantity,
    supplierName: poLine.supplierName,
    mpn: poLine.mpn,
    make: poLine.make,
    systemPrice: poLine.price,
    currency: poLine.currency,
    moqQuantity: poLine.moq,
    newPrice: 770,
    newQuantity: null,
    valueImpact: 28_000,
    remarks: 'Supplier asks for a higher price',
    documentCount: 1,
    version: 'v3',
    allowedActions: { canEdit: false, canSubmit: false, canClose: false },
    ...overrides,
  };
}

const details = (
  <Routes>
    <Route path="issues/:publicId" element={<IssueDetailsPage />} />
  </Routes>
);

describe('issue details', () => {
  it('offers Close only to the Sourcing Lead the API allows', async () => {
    renderWithProviders(details, { path: `/issues/${issue().publicId}`, routes: { 'GET /api/v1/issues/{publicId}': () => issue() } });

    expect(await screen.findByRole('heading', { name: 'PO 4500001234 / line 10' })).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(28_000, 'USD'))).toBeInTheDocument();
    for (const name of ['Close issue', 'Submit', 'Edit']) expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
  });

  it('closes with the comment and the version that was shown', async () => {
    const close = vi.fn((input: WorkflowActionInput) =>
      issue({ status: 'Closed', closedAt: '2026-11-03T06:00:00Z', closedBy: { id: 5, name: 'Sharath Sourcing' }, sourcingComment: input.comment ?? null, version: 'v4' }),
    );
    renderWithProviders(details, {
      path: `/issues/${issue().publicId}`,
      routes: {
        'GET /api/v1/issues/{publicId}': () => issue({ allowedActions: { canEdit: false, canSubmit: false, canClose: true } }),
        'POST /api/v1/issues/{publicId}/close': ({ body }) => close(body as WorkflowActionInput),
      },
    });

    await userEvent.click(await screen.findByRole('button', { name: 'Close issue' }));
    const dialog = await screen.findByRole('dialog');
    await enter(within(dialog).getByRole('textbox', { name: /Comment/ }), 'Price changed to 755');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close issue' }));

    expect(close).toHaveBeenCalledWith({ comment: 'Price changed to 755', version: 'v3' });
    expect(await screen.findByText('Closed')).toBeInTheDocument();
    expect(screen.getByText('Price changed to 755')).toBeInTheDocument();
  });
});
