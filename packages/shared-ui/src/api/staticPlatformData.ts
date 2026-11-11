import type { MasterItemDetails, PersonResult, VersionInfo } from '@cyient/api-client/platform';

export const staticMasterItems: Record<string, MasterItemDetails[]> = {
  Location: [
    { id: 1, name: 'Hyderabad Unit', code: 'HYD', sortOrder: 1, isActive: true, masterType: 'Location', version: 'm1' },
    { id: 2, name: 'Bangalore Unit', code: 'BLR', sortOrder: 2, isActive: true, masterType: 'Location', version: 'm1' },
    { id: 3, name: 'Pune Unit', code: 'PUN', sortOrder: 3, isActive: true, masterType: 'Location', version: 'm1' },
  ],
  Department: [
    { id: 1, name: 'Quality Management (QMS)', code: 'QMS', sortOrder: 1, isActive: true, masterType: 'Department', version: 'm1' },
    { id: 2, name: 'Engineering', code: 'ENG', sortOrder: 2, isActive: true, masterType: 'Department', version: 'm1' },
    { id: 3, name: 'Manufacturing', code: 'MFG', sortOrder: 3, isActive: true, masterType: 'Department', version: 'm1' },
    { id: 4, name: 'Supply Chain', code: 'SCM', sortOrder: 4, isActive: true, masterType: 'Department', version: 'm1' },
  ],
  Customer: [
    { id: 1, name: 'Boeing Defense', code: 'BOE', sortOrder: 1, isActive: true, masterType: 'Customer', version: 'm1' },
    { id: 2, name: 'Airbus Operations', code: 'AIR', sortOrder: 2, isActive: true, masterType: 'Customer', version: 'm1' },
    { id: 3, name: 'Collins Aerospace', code: 'COL', sortOrder: 3, isActive: true, masterType: 'Customer', version: 'm1' },
    { id: 4, name: 'Honeywell Aerospace', code: 'HON', sortOrder: 4, isActive: true, masterType: 'Customer', version: 'm1' },
  ],
  ReasonCategory: [
    { id: 1, name: 'Process Change', code: 'PROC', sortOrder: 1, isActive: true, masterType: 'ReasonCategory', version: 'm1' },
    { id: 2, name: 'Design Improvement', code: 'DSGN', sortOrder: 2, isActive: true, masterType: 'ReasonCategory', version: 'm1' },
    { id: 3, name: 'Customer Requirement', code: 'CUST', sortOrder: 3, isActive: true, masterType: 'ReasonCategory', version: 'm1' },
    { id: 4, name: 'Compliance / Regulatory', code: 'COMP', sortOrder: 4, isActive: true, masterType: 'ReasonCategory', version: 'm1' },
  ],
  ChangeCategory: [
    { id: 1, name: 'Manufacturing / Assembly Process', code: 'MFG_PROC', sortOrder: 1, isActive: true, masterType: 'ChangeCategory', version: 'm1' },
    { id: 2, name: 'Material / Component Substitution', code: 'MAT_SUB', sortOrder: 2, isActive: true, masterType: 'ChangeCategory', version: 'm1' },
    { id: 3, name: 'Tooling / Fixture Revision', code: 'TOOL_REV', sortOrder: 3, isActive: true, masterType: 'ChangeCategory', version: 'm1' },
    { id: 4, name: 'Test / Inspection Procedure', code: 'TEST_INSP', sortOrder: 4, isActive: true, masterType: 'ChangeCategory', version: 'm1' },
  ],
};

export const staticPeople: PersonResult[] = [
  { id: 1, displayName: 'Arjun Admin', email: 'arjun.admin@example.com', designation: 'Systems Administrator', department: 'IT' },
  { id: 2, displayName: 'Riya Requester', email: 'riya.requester@example.com', designation: 'Sr. Quality Engineer', department: 'QMS' },
  { id: 3, displayName: 'Rahul Requester', email: 'rahul.requester@example.com', designation: 'Process Engineer', department: 'Engineering' },
  { id: 4, displayName: 'Manoj Manager', email: 'manoj.manager@example.com', designation: 'Department Manager', department: 'QMS' },
  { id: 5, displayName: 'Harini Head', email: 'harini.head@example.com', designation: 'Head of Quality', department: 'QMS' },
  { id: 6, displayName: 'Indira IMS', email: 'indira.ims@example.com', designation: 'Lead IMS Reviewer', department: 'IMS' },
  { id: 7, displayName: 'Mohan MR', email: 'mohan.mr@example.com', designation: 'Management Representative', department: 'Executive' },
  { id: 8, displayName: 'Vani Viewer', email: 'vani.viewer@example.com', designation: 'Compliance Auditor', department: 'Compliance' },
];

export const staticVersionInfo: VersionInfo = {
  application: 'Cyient DLM Suite',
  product: 'Quality Management Platform',
  version: '1.0.0-offline',
  commit: 'static-demo',
};

export function getStaticMasterItems(masterType: string): MasterItemDetails[] {
  return staticMasterItems[masterType] ?? [
    { id: 1, name: `${masterType} Item 1`, code: '01', sortOrder: 1, isActive: true, masterType, version: 'm1' },
    { id: 2, name: `${masterType} Item 2`, code: '02', sortOrder: 2, isActive: true, masterType, version: 'm1' },
  ];
}

export function searchStaticPeople(term: string, limit = 20): PersonResult[] {
  const lower = term.toLowerCase().trim();
  if (!lower) return staticPeople.slice(0, limit);
  return staticPeople
    .filter(
      (p) =>
        p.displayName.toLowerCase().includes(lower) ||
        (p.email ?? '').toLowerCase().includes(lower) ||
        (p.department ?? '').toLowerCase().includes(lower),
    )
    .slice(0, limit);
}
