import { createMockHttp, createStaticAdminRoutes, defaultStaticUser, type HttpClient, type MockRoutes } from '@cyient/shared-ui';

export function createEcnMockData(): { notes: any[]; routes: MockRoutes } {
  const cftFunctions: any[] = [
    { id: 1, name: 'NPI Engineer', code: 'NPI', sortOrder: 1, isActive: true },
    { id: 2, name: 'Quality Assurance', code: 'QA', sortOrder: 2, isActive: true },
    { id: 3, name: 'Production', code: 'PROD', sortOrder: 3, isActive: true },
    { id: 4, name: 'Sourcing / SCM', code: 'SCM', sortOrder: 4, isActive: true },
    { id: 5, name: 'Testing', code: 'TEST', sortOrder: 5, isActive: true },
  ];

  const notes: any[] = [
    {
      publicId: 'n1',
      ecnNumber: 'ECN/2026/0101',
      noteType: 'EcnNonSap',
      source: 'Internal',
      status: 'CftMeeting',
      initiator: { id: 2, name: 'Riya Requester' },
      project: { id: 1, name: 'Project Alpha' },
      customer: { id: 1, name: 'Boeing Defense' },
      plant: { id: 1, name: 'Hyderabad Unit' },
      description: 'Capacitor substitution on Power Supply Module',
      reasonForChange: 'Component obsolescence announced by manufacturer',
      classification: 'Major',
      implementationTargetDate: '2026-12-01',
      customerApprovalRequired: false,
      sapEcnNumber: null,
      sapEcnDate: null,
      sapPdfName: null,
      tcnScope: null,
      tcnApplicability: null,
      tcnValidityType: null,
      tcnValidUntil: null,
      cftMeetingDate: '2026-11-04',
      cftMeetingTargetDate: '2026-11-10',
      teamRows: [
        {
          functionId: 1,
          functionName: 'NPI Engineer',
          isInitiatorRow: false,
          member: { id: 3, name: 'Rahul Requester' },
          notApplicable: false,
          remarks: 'Reviewed and acceptable',
          attended: true,
          actions: [
            {
              id: 11,
              sortOrder: 1,
              actionText: 'Update BOM and schematics',
              status: 'Open',
              targetDate: '2026-11-15',
              closedDate: null,
              comments: null,
              fromRevision: 'A',
              toRevision: 'B',
              dispositionStatus: null,
              itemAffected: 'C104',
              rawMaterial: null,
              version: 'a1',
            },
          ],
          tabEnabled: true,
        },
      ],
      affectedLines: [],
      attachments: [{ id: 1, fileName: 'Datasheet_C104.pdf', fileSize: 524288, uploadedAt: '2026-11-04T08:00:00Z', uploadedBy: 'Riya Requester', version: 1 }],
      version: 'v2',
      allowedActions: {
        canApprove: true,
        canEdit: true,
        canEditLines: true,
        canPublishToCft: true,
        canPublishToReviewer: false,
        canRecordAttendance: true,
        canRelease: false,
        canReview: true,
        canSendMeetingNotification: true,
        editableFunctionIds: [1, 2],
      },
    },
    {
      publicId: 'n2',
      ecnNumber: 'TCN/2026/0015',
      noteType: 'Tcn',
      source: 'Internal',
      status: 'Draft',
      initiator: { id: 2, name: 'Riya Requester' },
      project: { id: 2, name: 'Project Beta' },
      customer: { id: 2, name: 'Airbus Operations' },
      plant: { id: 2, name: 'Bangalore Unit' },
      description: 'Temporary bypass of conformal coating batch 12',
      reasonForChange: 'Oven thermocouple failure awaiting spare part',
      classification: 'Minor',
      implementationTargetDate: '2026-11-20',
      customerApprovalRequired: true,
      sapEcnNumber: null,
      sapEcnDate: null,
      sapPdfName: null,
      tcnScope: 'Batch 12 only',
      tcnApplicability: 'Line 2 production',
      tcnValidityType: 'DateBound',
      tcnValidUntil: '2026-11-25',
      cftMeetingDate: null,
      cftMeetingTargetDate: null,
      teamRows: [],
      affectedLines: [],
      attachments: [],
      version: 'v1',
      allowedActions: {
        canApprove: false,
        canEdit: true,
        canEditLines: true,
        canPublishToCft: true,
        canPublishToReviewer: false,
        canRecordAttendance: false,
        canRelease: false,
        canReview: false,
        canSendMeetingNotification: false,
        editableFunctionIds: [],
      },
    },
  ];

  const toListItem = (n: any) => ({
    publicId: n.publicId,
    ecnNumber: n.ecnNumber,
    noteType: n.noteType,
    status: n.status,
    customer: n.customer,
    description: n.description,
    classification: n.classification,
    implementationTargetDate: n.implementationTargetDate,
    initiator: n.initiator,
    cftMeetingDate: n.cftMeetingDate,
  });

  const routes: MockRoutes = {
    ...createStaticAdminRoutes(),
    'GET /api/v1/notes': () => ({
      data: notes.map(toListItem),
      meta: { page: 1, pageSize: 20, totalCount: notes.length, totalPages: 1 },
    }),
    'GET /api/v1/notes/pending': () => ({
      data: notes.filter((n) => n.status !== 'Draft' && n.status !== 'Released').map(toListItem),
      meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1 },
    }),
    'GET /api/v1/notes/{publicId}': ({ params }) => {
      return notes.find((n) => n.publicId === params.publicId) ?? notes[0];
    },
    'POST /api/v1/notes': ({ body }) => {
      const b = body as Record<string, unknown>;
      const newN: any = {
        publicId: `n${String(notes.length + 1)}`,
        ecnNumber: `ECN/2026/010${String(3 + notes.length)}`,
        noteType: (b.noteType as string) ?? 'EcnNonSap',
        source: 'Internal',
        status: 'Draft',
        initiator: { id: 2, name: 'Riya Requester' },
        project: { id: 1, name: 'Project Alpha' },
        customer: { id: Number(b.customerId) || 1, name: 'Boeing Defense' },
        plant: { id: Number(b.plantId) || 1, name: 'Hyderabad Unit' },
        description: (b.description as string) ?? '',
        reasonForChange: (b.reasonForChange as string) ?? '',
        classification: (b.classification as string) ?? 'Minor',
        implementationTargetDate: (b.implementationTargetDate as string) ?? null,
        customerApprovalRequired: Boolean(b.customerApprovalRequired),
        sapEcnNumber: (b.sapEcnNumber as string) ?? null,
        sapEcnDate: (b.sapEcnDate as string) ?? null,
        sapPdfName: (b.sapPdfName as string) ?? null,
        tcnScope: (b.tcnScope as string) ?? null,
        tcnApplicability: (b.tcnApplicability as string) ?? null,
        tcnValidityType: (b.tcnValidityType as string) ?? null,
        tcnValidUntil: (b.tcnValidUntil as string) ?? null,
        cftMeetingDate: null,
        cftMeetingTargetDate: null,
        teamRows: [],
        affectedLines: [],
        attachments: [],
        version: 'v1',
        allowedActions: {
          canApprove: false,
          canEdit: true,
          canEditLines: true,
          canPublishToCft: true,
          canPublishToReviewer: false,
          canRecordAttendance: false,
          canRelease: false,
          canReview: false,
          canSendMeetingNotification: false,
          editableFunctionIds: [],
        },
      };
      notes.unshift(newN);
      return newN;
    },
    'PUT /api/v1/notes/{publicId}': ({ params, body }) => {
      const n = notes.find((item) => item.publicId === params.publicId) ?? notes[0];
      if (n && body && typeof body === 'object') {
        Object.assign(n, body);
      }
      return n;
    },
    'POST /api/v1/notes/{publicId}/publish-cft': ({ params, body }) => {
      const n = notes.find((item) => item.publicId === params.publicId) ?? notes[0];
      if (n) {
        n.status = 'CftMeeting';
        if (body && typeof body === 'object') Object.assign(n, body);
      }
      return n;
    },
    'POST /api/v1/notes/{publicId}/cft-actions/{id}/close': ({ params, body }) => {
      const n = notes.find((item) => item.publicId === params.publicId) ?? notes[0];
      for (const r of n?.teamRows ?? []) {
        const a = r.actions?.find((act: any) => act.id === Number(params.id));
        if (a) {
          a.status = 'Closed';
          if (body && typeof body === 'object') Object.assign(a, body);
        }
      }
      return n;
    },
    'GET /api/v1/cft-functions': () => cftFunctions,
    'GET /api/v1/admin/cft-functions': () => cftFunctions,
    'GET /api/v1/customers': () => [
      { id: 1, name: 'Boeing Defense', code: 'BOE' },
      { id: 2, name: 'Airbus Operations', code: 'AIR' },
    ],
    'GET /api/v1/notes/{publicId}/log': () => [],
    'GET /api/v1/notes/{publicId}/attachments': () => [],
    'POST /api/v1/notes/{publicId}/attachments': () => ({
      id: 1, fileName: 'Spec.pdf', fileSize: 524288, uploadedAt: new Date().toISOString(), uploadedBy: 'Riya', version: 1,
    }),
    'DELETE /api/v1/notes/{publicId}/attachments/{id}': () => ({ success: true }),
    'GET /api/v1/report': () => ({
      notes: notes.map(toListItem),
      summary: { total: notes.length, open: notes.filter((n) => n.status !== 'Released').length },
    }),
    'GET /api/v1/admin/tasks': () => ({
      data: notes.map((n, i) => ({
        taskId: i + 1,
        notePublicId: n.publicId,
        ecnNumber: n.ecnNumber,
        stage: n.status,
        assignedTo: { id: 4, name: 'Manoj Manager' },
        createdAt: '2026-11-04',
      })),
      meta: { page: 1, pageSize: 20, totalCount: notes.length, totalPages: 1 },
    }),
    'GET /api/v1/admin/notes': () => ({
      data: notes.map(toListItem),
      meta: { page: 1, pageSize: 20, totalCount: notes.length, totalPages: 1 },
    }),
    'GET /api/v1/admin/notes/{publicId}/history': () => [],
    'GET /api/v1/admin/notes/{publicId}/emails': () => ({
      data: [],
      meta: { page: 1, pageSize: 20, totalCount: 0, totalPages: 1 },
    }),
    'GET /api/v1/admin/notes/{publicId}/audit': () => ({
      data: [],
      meta: { page: 1, pageSize: 20, totalCount: 0, totalPages: 1 },
    }),
  };

  return { notes, routes };
}

export function createStaticMockHttp(): HttpClient {
  const { routes } = createEcnMockData();
  return createMockHttp(routes, defaultStaticUser);
}
