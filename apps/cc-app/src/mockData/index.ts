import { createMockHttp, createStaticAdminRoutes, defaultStaticUser, type HttpClient, type MockRoutes } from '@cyient/shared-ui';

export function createCcMockData(): { complaints: any[]; routes: MockRoutes } {
  const complaints: any[] = [
    {
      publicId: 'c1',
      complaintNo: 'CC/2026/0010',
      status: 'Open',
      statusName: 'D4 Team Formed',
      initiator: { id: 1, name: 'Sanjay Initiator' },
      customer: { id: 1, name: 'Boeing Defense' },
      complaintDate: '2026-11-03',
      reportedDate: '2026-11-02',
      customerReference: 'CR-8891',
      modeOfCommunication: 'Email',
      source: 'External',
      internalPartNo: 'PCB-100-A',
      partDescription: 'Avionics Power Control Board',
      rejectedQuantity: 3,
      complaintDescription: 'Boards fail at power-on test during assembly',
      processCategory: 'Assembly',
      detectionStage: 'Customer Incoming',
      acknowledgementDate: '2026-11-04',
      isRepeat: false,
      repeatOf: null,
      customerPartNo: 'BOE-99120',
      revision: 'C',
      batch: 'B26-04',
      quantityShipped: 100,
      serialNumbers: 'SN001 - SN003',
      isCritical: true,
      customerContact: 'John Quality (jquality@boeing.com)',
      problemDescription: 'Intermittent open circuit on 12V bus line',
      location: { id: 1, name: 'Hyderabad Unit' },
      required: null,
      requiredJustification: null,
      teamMembers: [
        { id: 1, user: { id: 1, name: 'Sanjay Initiator' }, role: 'Champion' },
        { id: 2, user: { id: 2, name: 'Riya Requester' }, role: 'Quality Representative' },
      ],
      actions: [
        {
          id: 1,
          actionType: 'Corrective',
          discipline: 'D5',
          description: 'Solder profile calibration',
          owner: { id: 2, name: 'Riya Requester' },
          targetDate: '2026-11-20',
          closedDate: null,
          status: 'Open',
          remarks: null,
          evidenceFiles: [],
          canClose: true,
        },
      ],
      interimContainmentActions: '100% X-ray inspection of remaining inventory',
      containmentImplementationDate: '2026-11-05',
      rootCauseAnalysis: 'Reflow profile temperature ramp rate was slightly too high',
      rootCauseCategory: 'Process',
      verificationPlan: 'Batch test of 50 consecutive boards',
      horizontalDeploymentNotes: 'Check CC-2026 line B profiling',
      closureSummary: null,
      d3DueDate: '2026-11-06',
      d5DueDate: '2026-11-20',
      d8DueDate: '2026-12-05',
      publishedAt: '2026-11-04T10:00:00Z',
      closedAt: null,
      version: 'v2',
      allowedActions: {
        canEdit: true,
        canPublish: false,
        canSaveRootCause: true,
        canManageActions: true,
        canCompleteActionPlan: true,
        canSaveVerification: true,
        canSaveHorizontalDeployment: true,
        canSaveClosureSummary: true,
        canClose: false,
      },
    },
    {
      publicId: 'c2',
      complaintNo: 'CC/2026/0011',
      status: 'Draft',
      statusName: 'Draft',
      initiator: { id: 1, name: 'Sanjay Initiator' },
      customer: { id: 2, name: 'Airbus Operations' },
      complaintDate: '2026-11-08',
      reportedDate: '2026-11-07',
      customerReference: 'AIR-442',
      modeOfCommunication: 'Portal',
      source: 'External',
      internalPartNo: 'HAR-200',
      partDescription: 'Cockpit Wiring Harness',
      rejectedQuantity: 1,
      complaintDescription: 'Pin misalignment on connector J3',
      processCategory: 'Crimping',
      detectionStage: 'Integration Test',
      acknowledgementDate: null,
      isRepeat: false,
      repeatOf: null,
      customerPartNo: 'AIR-992-01',
      revision: 'B',
      batch: 'B26-08',
      quantityShipped: 25,
      serialNumbers: 'H-0021',
      isCritical: false,
      customerContact: 'Marie Laurent',
      problemDescription: 'Connector housing key slot damaged during mating',
      location: { id: 2, name: 'Bangalore Unit' },
      required: null,
      requiredJustification: null,
      teamMembers: [{ id: 3, user: { id: 1, name: 'Sanjay Initiator' }, role: 'Champion' }],
      actions: [],
      interimContainmentActions: null,
      containmentImplementationDate: null,
      rootCauseAnalysis: null,
      rootCauseCategory: null,
      verificationPlan: null,
      horizontalDeploymentNotes: null,
      closureSummary: null,
      d3DueDate: null,
      d5DueDate: null,
      d8DueDate: null,
      publishedAt: null,
      closedAt: null,
      version: 'v1',
      allowedActions: {
        canEdit: true,
        canPublish: true,
        canSaveRootCause: false,
        canManageActions: false,
        canCompleteActionPlan: false,
        canSaveVerification: false,
        canSaveHorizontalDeployment: false,
        canSaveClosureSummary: false,
        canClose: false,
      },
    },
  ];

  const toListItem = (c: any) => ({
    publicId: c.publicId,
    complaintNo: c.complaintNo,
    customer: c.customer,
    complaintDate: c.complaintDate,
    status: c.status,
    statusName: c.statusName,
    internalPartNo: c.internalPartNo,
    partDescription: c.partDescription,
    isCritical: c.isCritical,
    d3DueDate: c.d3DueDate,
    d5DueDate: c.d5DueDate,
    d8DueDate: c.d8DueDate,
  });

  const routes: MockRoutes = {
    ...createStaticAdminRoutes(),
    'GET /api/v1/complaints': () => ({
      data: complaints.map(toListItem),
      meta: { page: 1, pageSize: 20, totalCount: complaints.length, totalPages: 1 },
    }),
    'GET /api/v1/complaints/pending': () => ({
      data: complaints.filter((c) => c.status !== 'Draft' && c.status !== 'Closed').map(toListItem),
      meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1 },
    }),
    'GET /api/v1/complaints/{publicId}': ({ params }) => {
      return complaints.find((c) => c.publicId === params.publicId) ?? complaints[0];
    },
    'POST /api/v1/complaints': ({ body }) => {
      const b = body as Record<string, unknown>;
      const newC: any = {
        publicId: `c${String(complaints.length + 1)}`,
        complaintNo: `CC/2026/00${String(12 + complaints.length)}`,
        status: 'Draft',
        statusName: 'Draft',
        initiator: { id: 1, name: 'Sanjay Initiator' },
        customer: { id: Number(b.customerId) || 1, name: 'Boeing Defense' },
        complaintDate: (b.complaintDate as string) ?? new Date().toISOString().slice(0, 10),
        reportedDate: (b.reportedDate as string) ?? null,
        customerReference: (b.customerReference as string) ?? null,
        modeOfCommunication: null,
        source: 'External',
        internalPartNo: (b.internalPartNo as string) ?? '',
        partDescription: (b.partDescription as string) ?? '',
        rejectedQuantity: Number(b.rejectedQuantity) || 1,
        complaintDescription: (b.complaintDescription as string) ?? '',
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
        isCritical: Boolean(b.isCritical),
        customerContact: null,
        problemDescription: null,
        location: { id: 1, name: 'Hyderabad Unit' },
        required: null,
        requiredJustification: null,
        teamMembers: [],
        actions: [],
        interimContainmentActions: null,
        containmentImplementationDate: null,
        rootCauseAnalysis: null,
        rootCauseCategory: null,
        verificationPlan: null,
        horizontalDeploymentNotes: null,
        closureSummary: null,
        d3DueDate: null,
        d5DueDate: null,
        d8DueDate: null,
        publishedAt: null,
        closedAt: null,
        version: 'v1',
        allowedActions: {
          canEdit: true,
          canPublish: true,
          canSaveRootCause: false,
          canManageActions: false,
          canCompleteActionPlan: false,
          canSaveVerification: false,
          canSaveHorizontalDeployment: false,
          canSaveClosureSummary: false,
          canClose: false,
        },
      };
      complaints.unshift(newC);
      return newC;
    },
    'PUT /api/v1/complaints/{publicId}': ({ params, body }) => {
      const c = complaints.find((item) => item.publicId === params.publicId) ?? complaints[0];
      if (c && body && typeof body === 'object') {
        Object.assign(c, body);
      }
      return c;
    },
    'POST /api/v1/complaints/{publicId}/publish': ({ params }) => {
      const c = complaints.find((item) => item.publicId === params.publicId) ?? complaints[0];
      if (c) {
        c.status = 'Open';
        c.statusName = 'D4 Team Formed';
        c.publishedAt = new Date().toISOString();
      }
      return c;
    },
    'POST /api/v1/complaints/{publicId}/actions/{id}/close': ({ params, body }) => {
      const c = complaints.find((item) => item.publicId === params.publicId) ?? complaints[0];
      const action = c?.actions?.find((a: any) => a.id === Number(params.id));
      if (action) {
        action.status = 'Closed';
        action.closedDate = new Date().toISOString().slice(0, 10);
        if (body && typeof body === 'object') Object.assign(action, body);
      }
      return c;
    },
    'GET /api/v1/complaints/earlier': () => [],
    'GET /api/v1/complaints/{publicId}/log': () => [
      { id: 1, action: 'Draft Created', performedBy: 'Sanjay Initiator', performedAt: '2026-11-03T09:00:00Z', comment: 'Initial logging' },
    ],
    'GET /api/v1/complaints/{publicId}/documents': () => [],
    'POST /api/v1/complaints/{publicId}/documents': () => ({
      id: 1, fileName: 'ComplaintProof.pdf', fileSize: 1048576, uploadedAt: new Date().toISOString(), uploadedBy: 'Sanjay', version: 1,
    }),
    'DELETE /api/v1/complaints/{publicId}/documents/{id}': () => ({ success: true }),
    'GET /api/v1/internal-complaints': () => ({
      data: [],
      meta: { page: 1, pageSize: 20, totalCount: 0, totalPages: 1 },
    }),
    'GET /api/v1/internal-complaints/{publicId}': () => complaints[0],
    'GET /api/v1/admin/complaints': () => ({
      data: complaints.map(toListItem),
      meta: { page: 1, pageSize: 20, totalCount: complaints.length, totalPages: 1 },
    }),
    'GET /api/v1/admin/complaints/{publicId}/history': () => [],
    'GET /api/v1/admin/complaints/{publicId}/emails': () => ({
      data: [],
      meta: { page: 1, pageSize: 20, totalCount: 0, totalPages: 1 },
    }),
    'GET /api/v1/admin/complaints/{publicId}/audit': () => ({
      data: [],
      meta: { page: 1, pageSize: 20, totalCount: 0, totalPages: 1 },
    }),
    'GET /api/v1/admin/holidays': () => [],
  };

  return { complaints, routes };
}

export function createStaticMockHttp(): HttpClient {
  const { routes } = createCcMockData();
  return createMockHttp(routes, defaultStaticUser);
}
