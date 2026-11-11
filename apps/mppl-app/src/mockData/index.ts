import { createMockHttp, createStaticAdminRoutes, defaultStaticUser, type HttpClient, type MockRoutes } from '@cyient/shared-ui';

export function createMpplMockData(): { issues: any[]; routes: MockRoutes } {
  const poLines: Record<string, any> = {
    '4500001234-10': {
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
    },
    '4500009999-10': {
      poNumber: '4500009999',
      lineNumber: 10,
      poDate: '2026-11-01',
      partNumber: 'RES-0402-10K',
      quantity: 5000,
      supplierName: 'Vishay Intertechnology',
      mpn: 'CRCW040210K0FKED',
      make: 'Vishay',
      price: 0.05,
      currency: 'USD',
      moq: 1000,
    },
  };

  const sourcingAssignments: any[] = [
    {
      id: 1,
      project: { id: 1, name: 'Project Alpha' },
      commodity: { id: 1, name: 'Passives' },
      lead: { id: 4, name: 'Manoj Manager' },
      buyer: { id: 3, name: 'Rahul Requester' },
    },
  ];

  const issues: any[] = [
    {
      publicId: 'm1',
      issueNumber: 'MPPL/2026/0088',
      status: 'PendingCft',
      plant: { id: 1, name: 'Hyderabad Unit' },
      project: { id: 1, name: 'Project Alpha' },
      poNumber: '4500001234',
      poLineNumber: 10,
      poDate: '2026-10-20',
      partNumber: 'PN-7781',
      quantity: 1400,
      supplierName: 'Acme Components',
      mpn: 'ACM-778',
      make: 'Acme',
      poPrice: 750,
      poCurrency: 'USD',
      issueType: 'LeadTimeIncrease',
      commodity: { id: 1, name: 'Passives' },
      remarks: 'Supplier lead time extended from 8 weeks to 26 weeks',
      quotedPrice: 850,
      priceIncreaseReason: null,
      suggestedMoq: 1000,
      inventoryValuation: 375000,
      valueImpact: 140000,
      currency: 'USD',
      leadTimeWeeks: 26,
      cftMembers: [
        { id: 1, user: { id: 3, name: 'Rahul Requester' }, role: 'Sourcing Buyer', isApproved: true, approvedAt: '2026-11-02T10:00:00Z', comment: 'Approved' },
        { id: 2, user: { id: 4, name: 'Manoj Manager' }, role: 'Sourcing Lead', isApproved: null, approvedAt: null, comment: null },
      ],
      currentApprover: { id: 4, name: 'Manoj Manager' },
      initiator: { id: 2, name: 'Riya Requester' },
      createdAt: '2026-11-01T09:00:00Z',
      closedAt: null,
      documents: [{ id: 1, fileName: 'SupplierLetter.pdf', fileSize: 524288, uploadedAt: '2026-11-01T09:30:00Z', uploadedBy: 'Riya Requester', version: 1 }],
      version: 'v2',
      allowedActions: { canEdit: false, canSubmit: false, canApprove: true, canRevert: true, canReject: true, canClose: false },
    },
    {
      publicId: 'm2',
      issueNumber: 'MPPL/2026/0089',
      status: 'Draft',
      plant: { id: 2, name: 'Bangalore Unit' },
      project: { id: 1, name: 'Project Alpha' },
      poNumber: '4500009999',
      poLineNumber: 10,
      poDate: '2026-11-01',
      partNumber: 'RES-0402-10K',
      quantity: 5000,
      supplierName: 'Vishay Intertechnology',
      mpn: 'CRCW040210K0FKED',
      make: 'Vishay',
      poPrice: 0.05,
      poCurrency: 'USD',
      issueType: 'MinimumOrderQuantity',
      commodity: { id: 1, name: 'Passives' },
      remarks: 'MOQ increased from 1,000 to 5,000 pcs',
      quotedPrice: null,
      priceIncreaseReason: null,
      suggestedMoq: 5000,
      inventoryValuation: 250,
      valueImpact: 200,
      currency: 'USD',
      leadTimeWeeks: 12,
      cftMembers: [],
      currentApprover: null,
      initiator: { id: 2, name: 'Riya Requester' },
      createdAt: '2026-11-05T14:00:00Z',
      closedAt: null,
      documents: [],
      version: 'v1',
      allowedActions: { canEdit: true, canSubmit: true, canApprove: false, canRevert: false, canReject: false, canClose: false },
    },
  ];

  const toListItem = (i: any) => ({
    publicId: i.publicId,
    issueNumber: i.issueNumber,
    status: i.status,
    plant: i.plant,
    project: i.project,
    poNumber: i.poNumber,
    poLineNumber: i.poLineNumber,
    partNumber: i.partNumber,
    supplierName: i.supplierName,
    issueType: i.issueType,
    valueImpact: i.valueImpact,
    currency: i.currency,
    createdAt: i.createdAt,
    initiator: i.initiator,
    currentApprover: i.currentApprover,
  });

  const routes: MockRoutes = {
    ...createStaticAdminRoutes(),
    'GET /api/v1/issues': () => ({
      data: issues.map(toListItem),
      meta: { page: 1, pageSize: 20, totalCount: issues.length, totalPages: 1 },
    }),
    'GET /api/v1/issues/pending': () => ({
      data: issues.filter((i) => i.status === 'PendingCft').map(toListItem),
      meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1 },
    }),
    'GET /api/v1/issues/{publicId}': ({ params }) => {
      return issues.find((i) => i.publicId === params.publicId) ?? issues[0];
    },
    'POST /api/v1/issues': ({ body }) => {
      const b = body as Record<string, unknown>;
      const newI: any = {
        publicId: `m${String(issues.length + 1)}`,
        issueNumber: `MPPL/2026/00${String(90 + issues.length)}`,
        status: 'Draft',
        plant: { id: Number(b.plantId) || 1, name: 'Hyderabad Unit' },
        project: { id: Number(b.projectId) || 1, name: 'Project Alpha' },
        poNumber: (b.poNumber as string) ?? '',
        poLineNumber: Number(b.poLineNumber) || 10,
        poDate: (b.poDate as string) ?? new Date().toISOString().slice(0, 10),
        partNumber: (b.partNumber as string) ?? '',
        quantity: Number(b.quantity) || 100,
        supplierName: (b.supplierName as string) ?? '',
        mpn: (b.mpn as string) ?? '',
        make: (b.make as string) ?? '',
        poPrice: Number(b.poPrice) || 10,
        poCurrency: (b.poCurrency as string) ?? 'USD',
        issueType: (b.issueType as string) ?? 'LeadTimeIncrease',
        commodity: { id: Number(b.commodityId) || 1, name: 'Passives' },
        remarks: (b.remarks as string) ?? '',
        quotedPrice: Number(b.quotedPrice) || null,
        priceIncreaseReason: null,
        suggestedMoq: Number(b.suggestedMoq) || null,
        inventoryValuation: 0,
        valueImpact: Number(b.valueImpact) || 0,
        currency: 'USD',
        leadTimeWeeks: Number(b.leadTimeWeeks) || 12,
        cftMembers: [],
        currentApprover: null,
        initiator: { id: 2, name: 'Riya Requester' },
        createdAt: new Date().toISOString(),
        closedAt: null,
        documents: [],
        version: 'v1',
        allowedActions: { canEdit: true, canSubmit: true, canApprove: false, canRevert: false, canReject: false, canClose: false },
      };
      issues.unshift(newI);
      return newI;
    },
    'PUT /api/v1/issues/{publicId}': ({ params, body }) => {
      const i = issues.find((item) => item.publicId === params.publicId) ?? issues[0];
      if (i && body && typeof body === 'object') {
        Object.assign(i, body);
      }
      return i;
    },
    'POST /api/v1/issues/{publicId}/submit': ({ params }) => {
      const i = issues.find((item) => item.publicId === params.publicId) ?? issues[0];
      if (i) i.status = 'PendingCft';
      return i;
    },
    'POST /api/v1/issues/{publicId}/approve': ({ params }) => {
      const i = issues.find((item) => item.publicId === params.publicId) ?? issues[0];
      if (i) i.status = 'Approved';
      return i;
    },
    'POST /api/v1/issues/{publicId}/revert': ({ params }) => {
      const i = issues.find((item) => item.publicId === params.publicId) ?? issues[0];
      if (i) i.status = 'Draft';
      return i;
    },
    'POST /api/v1/issues/{publicId}/reject': ({ params }) => {
      const i = issues.find((item) => item.publicId === params.publicId) ?? issues[0];
      if (i) i.status = 'Rejected';
      return i;
    },
    'POST /api/v1/issues/{publicId}/close': ({ params }) => {
      const i = issues.find((item) => item.publicId === params.publicId) ?? issues[0];
      if (i) {
        i.status = 'Closed';
        i.closedAt = new Date().toISOString();
      }
      return i;
    },
    'GET /api/v1/po-lines/{poNumber}/{lineNumber}': ({ params }) => {
      const key = `${params.poNumber ?? ''}-${params.lineNumber ?? ''}`;
      const found = poLines[key];
      if (found) return found;
      return {
        poNumber: params.poNumber ?? '4500001234',
        lineNumber: Number(params.lineNumber) || 10,
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
    },
    'GET /api/v1/sourcing/lookup': () => ({
      lead: { id: 4, name: 'Manoj Manager' },
      buyer: { id: 3, name: 'Rahul Requester' },
    }),
    'GET /api/v1/admin/sourcing': () => sourcingAssignments,
    'GET /api/v1/admin/sourcing/{id}': ({ params }) =>
      sourcingAssignments.find((s: any) => s.id === Number(params.id)) ?? sourcingAssignments[0],
    'POST /api/v1/admin/sourcing': ({ body }) => {
      const newS = { id: sourcingAssignments.length + 1, ...(body as Record<string, unknown>) };
      sourcingAssignments.push(newS);
      return newS;
    },
    'PUT /api/v1/admin/sourcing/{id}': ({ params, body }) => {
      const s = sourcingAssignments.find((item: any) => item.id === Number(params.id)) ?? sourcingAssignments[0];
      if (s && body && typeof body === 'object') Object.assign(s, body);
      return s;
    },
    'DELETE /api/v1/admin/sourcing/{id}': ({ params }) => {
      const index = sourcingAssignments.findIndex((item: any) => item.id === Number(params.id));
      if (index >= 0) sourcingAssignments.splice(index, 1);
      return { success: true };
    },
    'GET /api/v1/issues/{publicId}/log': () => [],
    'GET /api/v1/issues/{publicId}/documents': () => [],
    'POST /api/v1/issues/{publicId}/documents': () => ({
      id: 1, fileName: 'MpplProof.pdf', fileSize: 524288, uploadedAt: new Date().toISOString(), uploadedBy: 'Riya', version: 1,
    }),
    'DELETE /api/v1/issues/{publicId}/documents/{id}': () => ({ success: true }),
    'GET /api/v1/admin/tasks': () => ({
      data: issues.map((item, i) => ({
        taskId: i + 1,
        issuePublicId: item.publicId,
        issueNumber: item.issueNumber,
        stage: item.status,
        assignedTo: { id: 4, name: 'Manoj Manager' },
        createdAt: '2026-11-01',
      })),
      meta: { page: 1, pageSize: 20, totalCount: issues.length, totalPages: 1 },
    }),
    'GET /api/v1/admin/issues': () => ({
      data: issues.map(toListItem),
      meta: { page: 1, pageSize: 20, totalCount: issues.length, totalPages: 1 },
    }),
    'GET /api/v1/admin/issues/{publicId}/history': () => [],
    'GET /api/v1/admin/issues/{publicId}/emails': () => ({
      data: [],
      meta: { page: 1, pageSize: 20, totalCount: 0, totalPages: 1 },
    }),
    'GET /api/v1/admin/issues/{publicId}/audit': () => ({
      data: [],
      meta: { page: 1, pageSize: 20, totalCount: 0, totalPages: 1 },
    }),
  };

  return { issues, routes };
}

export function createStaticMockHttp(): HttpClient {
  const { routes } = createMpplMockData();
  return createMockHttp(routes, defaultStaticUser);
}
