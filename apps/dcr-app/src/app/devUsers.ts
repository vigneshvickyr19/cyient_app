import type { DevUser } from '@cyient/shared-ui';

/** The DCR API's Docker sample people (docker/dcr-api.json), for development sign-in only. */
export const devUsers: readonly DevUser[] = [
  { login: 'CYIENTDLM\\requester', name: 'Riya Requester', role: 'Requester' },
  { login: 'CYIENTDLM\\requester2', name: 'Rahul Requester', role: 'Requester' },
  { login: 'CYIENTDLM\\manager', name: 'Manoj Manager', role: 'DeptManager' },
  { login: 'CYIENTDLM\\head', name: 'Harini Head', role: 'DeptHead' },
  { login: 'CYIENTDLM\\ims', name: 'Indira IMS', role: 'ImsReviewer' },
  { login: 'CYIENTDLM\\mr', name: 'Mohan MR', role: 'Mr' },
  { login: 'CYIENTDLM\\viewer', name: 'Vani Viewer', role: 'QmsViewAll' },
  { login: 'CYIENTDLM\\admin', name: 'Arjun Admin', role: 'Administrator' },
];
