import type { DevUser } from '@cyient/shared-ui';

/**
 * The Deviation Note API's Docker sample people (docker/dn-api.json), for development sign-in only. Everyone holds the
 * Requester role; the others hold the role named.
 */
export const devUsers: readonly DevUser[] = [
  { login: 'CYIENTDLM\\initiator', name: 'Sanjay Initiator', role: 'Requester' },
  { login: 'CYIENTDLM\\manager', name: 'Manoj Manager', role: 'Reporting manager' },
  { login: 'CYIENTDLM\\quality', name: 'Kiran Quality', role: 'Reviewer' },
  { login: 'CYIENTDLM\\engineering', name: 'Esha Engineering', role: 'Reviewer' },
  { login: 'CYIENTDLM\\hod', name: 'Harini HOD', role: 'Head of department' },
  { login: 'CYIENTDLM\\approver', name: 'Farhan Approver', role: 'Final approver' },
  { login: 'CYIENTDLM\\supervisor', name: 'Suresh Supervisor', role: 'Production Supervisor' },
  { login: 'CYIENTDLM\\viewer', name: 'Vani Viewer', role: 'DN View-all' },
  { login: 'CYIENTDLM\\admin', name: 'Arjun Admin', role: 'Administrator' },
];
