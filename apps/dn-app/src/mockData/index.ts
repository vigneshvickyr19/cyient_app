import { createMockHttp, createStaticAdminRoutes, defaultStaticUser, type HttpClient, type MockRoutes } from '@cyient/shared-ui';

export function createDnMockData(): { requests: any[]; routes: MockRoutes } {
  const reviewerBoxes: any[] = [
    { id: 100, changeCategoryId: 1, sequence: 1, name: 'Quality', isMandatory: true, isHeadOfDepartment: false },
    { id: 101, changeCategoryId: 1, sequence: 2, name: 'Head of department', isMandatory: true, isHeadOfDepartment: true },
    { id: 102, changeCategoryId: 2, sequence: 1, name: 'Quality', isMandatory: true, isHeadOfDepartment: false },
    { id: 103, changeCategoryId: 2, sequence: 2, name: 'Head of department', isMandatory: true, isHeadOfDepartment: true },
    { id: 104, changeCategoryId: 41, sequence: 1, name: 'Quality', isMandatory: true, isHeadOfDepartment: false },
    { id: 105, changeCategoryId: 41, sequence: 2, name: 'Head of department', isMandatory: true, isHeadOfDepartment: true },
  ];

  const requests: any[] = [
    {
      publicId: 'abc',
      requestNo: 'DN/2026/0042',
      status: 'PendingApproval',
      statusName: 'Pending',
      initiator: { id: 3, name: 'Sanjay Initiator' },
      designation: 'Sr. Engineer - Production',
      requestDate: '2026-11-03',
      initiatorDepartment: { id: 21, name: 'Production' },
      workOrderNo: 'WO-7710',
      lineCellEquipmentNo: 'Line 4',
      customer: { id: 11, name: 'Boeing Defense' },
      productFgNumber: 'FG-1001-A',
      unit: { id: 31, name: 'Hyderabad Unit' },
      deviationQuantity: 12,
      changeCategory: { id: 41, name: 'Material' },
      prescribedProcess: 'Torque 10 Nm using calibrated wrench',
      processChangeRequired: 'Torque 12 Nm due to modified locknut specification',
      reasonForChange: 'Supplier nut hardness variation',
      preventiveAction: 'Update torque specification sheet with supplier',
      reportingManager: { id: 4, name: 'Manoj Manager' },
      submittedAt: '2026-11-03T05:00:00Z',
      financialYear: '2026-27',
      currentReviewerId: 502,
      pendingWith: { id: 1, name: 'Riya Requester' },
      pendingRole: 'Quality',
      moreInfo: null,
      revertComments: null,
      furtherApprovalRequired: null,
      finalApprover: null,
      approvedAt: null,
      rejectedAt: null,
      closedAt: null,
      assignedReviewers: [
        { id: 1, reviewerBoxId: 100, reviewerBoxName: 'Quality', user: { id: 1, name: 'Riya Requester' }, isApproved: null, approvedAt: null, comment: null },
        { id: 2, reviewerBoxId: 101, reviewerBoxName: 'Head of department', user: { id: 4, name: 'Manoj Manager' }, isApproved: null, approvedAt: null, comment: null },
      ],
      informedUsers: [{ id: 5, name: 'Harini Head' }],
      documents: [{ id: 1, fileName: 'DeviationEvidence.pdf', fileSize: 1048576, uploadedAt: '2026-11-03T05:10:00Z', uploadedBy: 'Sanjay', version: 1 }],
      version: 'v2',
      allowedActions: { canEdit: false, canSubmit: false, canApprove: true, canRevert: true, canReject: true, canRequestMoreInfo: true, canResubmit: false, canClose: false },
    },
    {
      publicId: 'def',
      requestNo: 'DN/2026/0043',
      status: 'Approved',
      statusName: 'Approved',
      initiator: { id: 3, name: 'Sanjay Initiator' },
      designation: 'Sr. Engineer - Production',
      requestDate: '2026-10-25',
      initiatorDepartment: { id: 21, name: 'Production' },
      workOrderNo: 'WO-6650',
      lineCellEquipmentNo: 'Line 2',
      customer: { id: 11, name: 'Airbus Operations' },
      productFgNumber: 'FG-2040',
      unit: { id: 31, name: 'Bangalore Unit' },
      deviationQuantity: 5,
      changeCategory: { id: 1, name: 'Manufacturing / Assembly Process' },
      prescribedProcess: 'Hand solder terminal J1',
      processChangeRequired: 'Use hot air reflow soldering pencil',
      reasonForChange: 'Space constraints on dense PCB area',
      preventiveAction: 'Revised assembly routing sheet',
      reportingManager: { id: 4, name: 'Manoj Manager' },
      submittedAt: '2026-10-25T08:00:00Z',
      financialYear: '2026-27',
      currentReviewerId: null,
      pendingWith: null,
      pendingRole: null,
      moreInfo: null,
      revertComments: null,
      furtherApprovalRequired: false,
      finalApprover: null,
      approvedAt: '2026-10-26T14:00:00Z',
      rejectedAt: null,
      closedAt: '2026-10-26T14:00:00Z',
      assignedReviewers: [],
      informedUsers: [],
      documents: [],
      version: 'v3',
      allowedActions: { canEdit: false, canSubmit: false, canApprove: false, canRevert: false, canReject: false, canRequestMoreInfo: false, canResubmit: false, canClose: false },
    },
  ];

  const toListItem = (r: any) => ({
    publicId: r.publicId,
    requestNo: r.requestNo,
    customer: r.customer,
    status: r.status,
    statusName: r.statusName,
    requestDate: r.requestDate,
    productFgNumber: r.productFgNumber,
    workOrderNo: r.workOrderNo,
    deviationQuantity: r.deviationQuantity,
    initiator: r.initiator,
    unit: r.unit,
    pendingWith: r.pendingWith,
  });

  const routes: MockRoutes = {
    ...createStaticAdminRoutes(),
    'GET /api/v1/requests': ({ url }) => {
      const page = Number(url.searchParams.get('Page') ?? 1);
      const pageSize = Number(url.searchParams.get('PageSize') ?? 20);
      return {
        data: requests.map(toListItem),
        meta: { page, pageSize, totalCount: requests.length, totalPages: 1 },
      };
    },
    'GET /api/v1/requests/pending': ({ url }) => {
      const page = Number(url.searchParams.get('page') ?? 1);
      const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
      const pending = requests.filter((r) => r.status === 'PendingApproval');
      return {
        data: pending.map(toListItem),
        meta: { page, pageSize, totalCount: pending.length, totalPages: 1 },
      };
    },
    'GET /api/v1/requests/{publicId}': ({ params }) => {
      return requests.find((r) => r.publicId === params.publicId) ?? requests[0];
    },
    'POST /api/v1/requests': ({ body }) => {
      const b = body as Record<string, unknown>;
      const newR: any = {
        publicId: `req${String(requests.length + 1)}`,
        requestNo: `DN/2026/00${String(45 + requests.length)}`,
        status: 'Draft',
        statusName: 'Draft',
        initiator: { id: 3, name: 'Sanjay Initiator' },
        designation: (b.designation as string) ?? '',
        requestDate: (b.requestDate as string) ?? new Date().toISOString().slice(0, 10),
        initiatorDepartment: { id: Number(b.initiatorDepartmentId) || 21, name: 'Production' },
        workOrderNo: (b.workOrderNo as string) ?? '',
        lineCellEquipmentNo: (b.lineCellEquipmentNo as string) ?? '',
        customer: { id: Number(b.customerId) || 11, name: 'Boeing Defense' },
        productFgNumber: (b.productFgNumber as string) ?? '',
        unit: { id: Number(b.unitId) || 31, name: 'Hyderabad Unit' },
        deviationQuantity: Number(b.deviationQuantity) || 1,
        changeCategory: { id: Number(b.changeCategoryId) || 41, name: 'Material' },
        prescribedProcess: (b.prescribedProcess as string) ?? '',
        processChangeRequired: (b.processChangeRequired as string) ?? '',
        reasonForChange: (b.reasonForChange as string) ?? '',
        preventiveAction: (b.preventiveAction as string) ?? '',
        reportingManager: { id: 4, name: 'Manoj Manager' },
        submittedAt: null,
        financialYear: '2026-27',
        currentReviewerId: null,
        pendingWith: null,
        pendingRole: null,
        moreInfo: null,
        revertComments: null,
        furtherApprovalRequired: null,
        finalApprover: null,
        approvedAt: null,
        rejectedAt: null,
        closedAt: null,
        assignedReviewers: [],
        informedUsers: [],
        documents: [],
        version: 'v1',
        allowedActions: { canEdit: true, canSubmit: true, canApprove: false, canRevert: false, canReject: false, canRequestMoreInfo: false, canResubmit: false, canClose: false },
      };
      requests.unshift(newR);
      return newR;
    },
    'PUT /api/v1/requests/{publicId}': ({ params, body }) => {
      const r = requests.find((item) => item.publicId === params.publicId) ?? requests[0];
      if (r && body && typeof body === 'object') {
        Object.assign(r, body);
      }
      return r;
    },
    'POST /api/v1/requests/{publicId}/submit': ({ params }) => {
      const r = requests.find((item) => item.publicId === params.publicId) ?? requests[0];
      if (r) {
        r.status = 'PendingApproval';
        r.statusName = 'Pending';
        r.submittedAt = new Date().toISOString();
      }
      return r;
    },
    'POST /api/v1/requests/{publicId}/approve': ({ params, body }) => {
      const r = requests.find((item) => item.publicId === params.publicId) ?? requests[0];
      if (r) {
        r.status = 'Approved';
        r.statusName = 'Approved';
        if (body && typeof body === 'object') Object.assign(r, body);
      }
      return r;
    },
    'POST /api/v1/requests/{publicId}/revert': ({ params }) => {
      const r = requests.find((item) => item.publicId === params.publicId) ?? requests[0];
      if (r) {
        r.status = 'Draft';
        r.statusName = 'Draft';
      }
      return r;
    },
    'POST /api/v1/requests/{publicId}/reject': ({ params }) => {
      const r = requests.find((item) => item.publicId === params.publicId) ?? requests[0];
      if (r) {
        r.status = 'Rejected';
        r.statusName = 'Rejected';
      }
      return r;
    },
    'POST /api/v1/requests/{publicId}/resubmit': ({ params }) => {
      const r = requests.find((item) => item.publicId === params.publicId) ?? requests[0];
      if (r) {
        r.status = 'PendingApproval';
        r.statusName = 'Pending';
      }
      return r;
    },
    'GET /api/v1/reviewer-boxes': () => reviewerBoxes,
    'GET /api/v1/admin/reviewer-boxes': () => reviewerBoxes,
    'GET /api/v1/requests/{publicId}/log': () => [],
    'GET /api/v1/requests/{publicId}/documents': () => [],
    'POST /api/v1/requests/{publicId}/documents': () => ({
      id: 1, fileName: 'DeviationProof.pdf', fileSize: 524288, uploadedAt: new Date().toISOString(), uploadedBy: 'Sanjay', version: 1,
    }),
    'DELETE /api/v1/requests/{publicId}/documents/{id}': () => ({ success: true }),
    'GET /api/v1/reports/summary': () => ({
      totalRequests: requests.length,
      pendingRequests: requests.filter((r) => r.status === 'PendingApproval').length,
      approvedRequests: requests.filter((r) => r.status === 'Approved').length,
      rejectedRequests: requests.filter((r) => r.status === 'Rejected').length,
    }),
    'GET /api/v1/admin/tasks': () => ({
      data: requests.map((r, i) => ({
        taskId: i + 1,
        requestPublicId: r.publicId,
        requestNo: r.requestNo,
        stage: r.status,
        assignedTo: { id: 4, name: 'Manoj Manager' },
        createdAt: r.requestDate,
      })),
      meta: { page: 1, pageSize: 20, totalCount: requests.length, totalPages: 1 },
    }),
    'GET /api/v1/admin/requests': () => ({
      data: requests.map(toListItem),
      meta: { page: 1, pageSize: 20, totalCount: requests.length, totalPages: 1 },
    }),
    'GET /api/v1/admin/requests/{publicId}/history': () => [],
    'GET /api/v1/admin/requests/{publicId}/emails': () => ({
      data: [],
      meta: { page: 1, pageSize: 20, totalCount: 0, totalPages: 1 },
    }),
    'GET /api/v1/admin/requests/{publicId}/audit': () => ({
      data: [],
      meta: { page: 1, pageSize: 20, totalCount: 0, totalPages: 1 },
    }),
  };

  return { requests, routes };
}

export function createStaticMockHttp(): HttpClient {
  const { routes } = createDnMockData();
  return createMockHttp(routes, defaultStaticUser);
}
