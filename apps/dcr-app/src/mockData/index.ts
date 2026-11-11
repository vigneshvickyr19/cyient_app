import { createMockHttp, createStaticAdminRoutes, defaultStaticUser, type HttpClient, type MockRoutes } from '@cyient/shared-ui';

export function createDcrMockData(): { requests: any[]; routes: MockRoutes } {
  const requests: any[] = [
    {
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
      reasonCategory: { id: 1, name: 'Process Change' },
      reasonForChanges: 'New review step for quality management',
      riskToQms: 'Low',
      riskToDevices: 'None',
      deptManager: { id: 4, name: 'Manoj Manager' },
      deptHead: { id: 6, name: 'Harini Head' },
      needByDate: '2026-12-01',
      submittedAt: '2026-11-03T05:00:00Z',
      releaseDate: null,
      effectiveImplementationDate: null,
      clauses: [{ id: 1, clauseNo: '4.2', sortOrder: 1, amendedContent: 'New clause text', currentContent: 'Old text', changeType: 'Amendment', version: 'v1' }],
      version: 'v7',
      allowedActions: { canEdit: false, canSubmit: false, canApprove: true, canRevert: true, canReject: true, canRelease: false },
      documentCount: 1,
      reviewStarted: true,
    },
    {
      publicId: 'p2',
      requestNo: 'DCR/2026/0043',
      status: 'DeptManagerReview',
      releasedStatus: 'NotYetReleased',
      requestFrom: { id: 2, name: 'Rahul Requester' },
      designation: 'Process Engineer',
      requestDate: '2026-11-05',
      location: { id: 2, name: 'Bangalore Unit' },
      department: { id: 2, name: 'Engineering' },
      documentReference: 'ENG-WI-104',
      currentRevisionNo: '2',
      currentRevisionDate: '2026-09-15',
      documentDescription: 'SMT stencil cleaning work instruction',
      reasonCategory: { id: 2, name: 'Design Improvement' },
      reasonForChanges: 'Updated ultrasonic wash cycle timing',
      riskToQms: 'None',
      riskToDevices: 'None',
      deptManager: { id: 4, name: 'Manoj Manager' },
      deptHead: { id: 6, name: 'Harini Head' },
      needByDate: '2026-11-30',
      submittedAt: '2026-11-05T08:30:00Z',
      releaseDate: null,
      effectiveImplementationDate: null,
      clauses: [],
      version: 'v1',
      allowedActions: { canEdit: false, canSubmit: false, canApprove: true, canRevert: true, canReject: true, canRelease: false },
      documentCount: 2,
      reviewStarted: false,
    },
    {
      publicId: 'p3',
      requestNo: 'DCR/2026/0044',
      status: 'Draft',
      releasedStatus: 'NotYetReleased',
      requestFrom: { id: 3, name: 'Riya Requester' },
      designation: 'Sr. Engineer - Quality',
      requestDate: '2026-11-08',
      location: { id: 1, name: 'Hyderabad Unit' },
      department: { id: 2, name: 'QMS' },
      documentReference: 'QMS-SOP-012',
      currentRevisionNo: '1',
      currentRevisionDate: '2026-05-10',
      documentDescription: 'Calibration schedule management',
      reasonCategory: { id: 4, name: 'Compliance / Regulatory' },
      reasonForChanges: 'Annual calibration interval realignment',
      riskToQms: 'Low',
      riskToDevices: 'None',
      deptManager: { id: 4, name: 'Manoj Manager' },
      deptHead: { id: 6, name: 'Harini Head' },
      needByDate: '2026-12-15',
      submittedAt: null,
      releaseDate: null,
      effectiveImplementationDate: null,
      clauses: [],
      version: 'v1',
      allowedActions: { canEdit: true, canSubmit: true, canApprove: false, canRevert: false, canReject: false, canRelease: false },
      documentCount: 0,
      reviewStarted: false,
    },
    {
      publicId: 'p4',
      requestNo: 'DCR/2026/0040',
      status: 'Approved',
      releasedStatus: 'Released',
      requestFrom: { id: 3, name: 'Riya Requester' },
      designation: 'Sr. Engineer - Quality',
      requestDate: '2026-10-15',
      location: { id: 1, name: 'Hyderabad Unit' },
      department: { id: 2, name: 'QMS' },
      documentReference: 'QMS-PR-01',
      currentRevisionNo: '5',
      currentRevisionDate: '2026-10-20',
      documentDescription: 'Quality manual revision 2026',
      reasonCategory: { id: 4, name: 'Compliance / Regulatory' },
      reasonForChanges: 'ISO 13485 update compliance',
      riskToQms: 'Low',
      riskToDevices: 'None',
      deptManager: { id: 4, name: 'Manoj Manager' },
      deptHead: { id: 6, name: 'Harini Head' },
      needByDate: '2026-10-30',
      submittedAt: '2026-10-15T09:00:00Z',
      releaseDate: '2026-10-22',
      effectiveImplementationDate: '2026-11-01',
      clauses: [],
      version: 'v4',
      allowedActions: { canEdit: false, canSubmit: false, canApprove: false, canRevert: false, canReject: false, canRelease: false },
      documentCount: 3,
      reviewStarted: true,
    },
  ];

  const toListItem = (r: any) => ({
    publicId: r.publicId,
    requestNo: r.requestNo,
    status: r.status,
    documentReference: r.documentReference,
    currentRevisionNo: r.currentRevisionNo,
    requestFrom: r.requestFrom,
    requestDate: r.requestDate,
    needByDate: r.needByDate,
    location: r.location,
    department: r.department,
    reasonForChanges: r.reasonForChanges,
    releaseDate: r.releaseDate,
    submittedAt: r.submittedAt,
  });

  const routes: MockRoutes = {
    ...createStaticAdminRoutes(),
    'GET /api/v1/requests': ({ url }) => {
      const page = Number(url.searchParams.get('Page') ?? 1);
      const pageSize = Number(url.searchParams.get('PageSize') ?? 20);
      const search = (url.searchParams.get('Search') ?? '').toLowerCase();
      const status = url.searchParams.get('Status');
      const filtered = requests.filter((r) => {
        if (status && r.status !== status) return false;
        if (search && !(r.requestNo ?? '').toLowerCase().includes(search) && !(r.documentDescription ?? '').toLowerCase().includes(search)) return false;
        return true;
      });
      return {
        data: filtered.slice((page - 1) * pageSize, page * pageSize).map(toListItem),
        meta: { page, pageSize, totalCount: filtered.length, totalPages: Math.ceil(filtered.length / pageSize) || 1 },
      };
    },
    'GET /api/v1/requests/pending': ({ url }) => {
      const page = Number(url.searchParams.get('page') ?? 1);
      const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
      const pending = requests.filter((r) => r.status !== 'Draft');
      return {
        data: pending.slice((page - 1) * pageSize, page * pageSize).map(toListItem),
        meta: { page, pageSize, totalCount: pending.length, totalPages: Math.ceil(pending.length / pageSize) || 1 },
      };
    },
    'GET /api/v1/requests/{publicId}': ({ params }) => {
      return requests.find((r) => r.publicId === params.publicId) ?? requests[0];
    },
    'POST /api/v1/requests': ({ body }) => {
      const b = body as Record<string, unknown>;
      const newReq: any = {
        publicId: `p${String(requests.length + 1)}`,
        requestNo: `DCR/2026/00${String(45 + requests.length)}`,
        status: 'Draft',
        releasedStatus: 'NotYetReleased',
        requestFrom: { id: 3, name: 'Riya Requester' },
        designation: (b.designation as string) ?? '',
        requestDate: new Date().toISOString().slice(0, 10),
        location: { id: Number(b.locationId) || 1, name: 'Hyderabad Unit' },
        department: { id: Number(b.departmentId) || 2, name: 'QMS' },
        documentReference: (b.documentReference as string) ?? 'DCR-DOC',
        currentRevisionNo: (b.currentRevisionNo as string) ?? '1',
        currentRevisionDate: (b.currentRevisionDate as string) ?? '',
        documentDescription: (b.documentDescription as string) ?? '',
        reasonCategory: { id: Number(b.reasonCategoryId) || 1, name: 'Process Change' },
        reasonForChanges: (b.reasonForChanges as string) ?? '',
        riskToQms: (b.riskToQms as string) ?? 'Low',
        riskToDevices: (b.riskToDevices as string) ?? 'None',
        deptManager: { id: 4, name: 'Manoj Manager' },
        deptHead: { id: 6, name: 'Harini Head' },
        needByDate: (b.needByDate as string) ?? null,
        submittedAt: null,
        releaseDate: null,
        effectiveImplementationDate: null,
        clauses: [],
        version: 'v1',
        allowedActions: { canEdit: true, canSubmit: true, canApprove: false, canRevert: false, canReject: false, canRelease: false },
        documentCount: 0,
        reviewStarted: false,
      };
      requests.unshift(newReq);
      return newReq;
    },
    'PUT /api/v1/requests/{publicId}': ({ params, body }) => {
      const req = requests.find((r) => r.publicId === params.publicId) ?? requests[0];
      if (req && body && typeof body === 'object') {
        Object.assign(req, body);
      }
      return req;
    },
    'POST /api/v1/requests/{publicId}/submit': ({ params }) => {
      const req = requests.find((r) => r.publicId === params.publicId) ?? requests[0];
      if (req) {
        req.status = 'DeptManagerReview';
        req.submittedAt = new Date().toISOString();
      }
      return req;
    },
    'POST /api/v1/requests/{publicId}/approve': ({ params }) => {
      const req = requests.find((r) => r.publicId === params.publicId) ?? requests[0];
      if (req) {
        if (req.status === 'DeptManagerReview') req.status = 'DeptHeadReview';
        else if (req.status === 'DeptHeadReview') req.status = 'ImsReview';
        else if (req.status === 'ImsReview') req.status = 'MrReview';
        else req.status = 'Approved';
      }
      return req;
    },
    'POST /api/v1/requests/{publicId}/revert': ({ params }) => {
      const req = requests.find((r) => r.publicId === params.publicId) ?? requests[0];
      if (req) req.status = 'Draft';
      return req;
    },
    'POST /api/v1/requests/{publicId}/reject': ({ params }) => {
      const req = requests.find((r) => r.publicId === params.publicId) ?? requests[0];
      if (req) req.status = 'ImsRejected';
      return req;
    },
    'POST /api/v1/requests/{publicId}/release': ({ params, body }) => {
      const req = requests.find((r) => r.publicId === params.publicId) ?? requests[0];
      if (req) {
        req.status = 'Approved';
        req.releasedStatus = 'Released';
        if (body && typeof body === 'object') Object.assign(req, body);
      }
      return req;
    },
    'PUT /api/v1/requests/{publicId}/clauses': ({ params, body }) => {
      const req = requests.find((r) => r.publicId === params.publicId) ?? requests[0];
      if (req && body && typeof body === 'object') {
        req.clauses = (body as { clauses: unknown[] }).clauses;
      }
      return req;
    },
    'GET /api/v1/requests/{publicId}/log': () => [
      { id: 1, action: 'Draft Created', performedBy: 'Riya Requester', performedAt: '2026-11-03T04:30:00Z', comment: 'Initial document change proposal' },
      { id: 2, action: 'Submitted', performedBy: 'Riya Requester', performedAt: '2026-11-03T05:00:00Z', comment: 'Ready for manager review' },
    ],
    'GET /api/v1/requests/{publicId}/documents': () => [
      { id: 1, fileName: 'QMS-PR-07_Redline.docx', fileSize: 1048576, uploadedAt: '2026-11-03T04:45:00Z', uploadedBy: 'Riya Requester', version: 1 },
    ],
    'POST /api/v1/requests/{publicId}/documents': () => ({
      id: 2, fileName: 'Evidence.pdf', fileSize: 524288, uploadedAt: new Date().toISOString(), uploadedBy: 'Current User', version: 1,
    }),
    'DELETE /api/v1/requests/{publicId}/documents/{id}': () => ({ success: true }),
    'GET /api/v1/requests/export': () => new Response('RequestNo,Status,Title\nDCR/2026/0042,ImsReview,Document control procedure', {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="dcr-requests.csv"' },
    }),
    'GET /api/v1/requests/{publicId}/documents/{id}/download': () => new Response('mock document contents', {
      headers: { 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="document.pdf"' },
    }),
    'GET /api/v1/admin/tasks': () => {
      const tasks = requests.map((r, i) => ({
        taskId: i + 1,
        requestPublicId: r.publicId,
        requestNo: r.requestNo,
        stage: r.status,
        assignedTo: { id: 4, name: 'Manoj Manager' },
        createdAt: r.requestDate,
      }));
      return {
        data: tasks,
        meta: { page: 1, pageSize: 20, totalCount: tasks.length, totalPages: 1 },
      };
    },
    'GET /api/v1/admin/requests': () => {
      return {
        data: requests.map(toListItem),
        meta: { page: 1, pageSize: 20, totalCount: requests.length, totalPages: 1 },
      };
    },
    'GET /api/v1/admin/requests/{publicId}/history': () => [
      { kind: 'Workflow', at: '2026-11-03T05:00:00Z', user: { id: 3, name: 'Riya Requester' }, action: 'Submitted', stage: 'ImsReview', item: null, itemId: null, field: null, oldValue: null, newValue: null, comment: 'Ready for review' },
    ],
    'GET /api/v1/admin/requests/{publicId}/emails': () => ({
      data: [{ id: 1, eventType: 'RequestSubmitted', toAddresses: 'manoj.manager@example.com', ccAddresses: null, subject: 'DCR submitted', status: 'Sent', attemptCount: 1, createdAt: '2026-11-03T05:01:00Z', sentAt: '2026-11-03T05:02:00Z', referenceId: null, triggeredBy: null }],
      meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1 },
    }),
    'GET /api/v1/admin/requests/{publicId}/audit': () => ({
      data: [{ id: 1, tableName: 'Request', recordId: 'p1', action: 'Update', fieldName: 'status', oldValue: 'Draft', newValue: 'ImsReview', changedAt: '2026-11-03T05:00:00Z', user: null, traceId: null }],
      meta: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1 },
    }),
  };

  return { requests, routes };
}

export function createStaticMockHttp(): HttpClient {
  const { routes } = createDcrMockData();
  return createMockHttp(routes, defaultStaticUser);
}
