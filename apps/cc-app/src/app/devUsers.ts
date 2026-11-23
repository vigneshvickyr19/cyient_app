import type { DevUser } from '@cyient/shared-ui';

/** The Customer Complaint API's Docker sample people (docker/cc-api.json), for development sign-in only. */
export const devUsers: readonly DevUser[] = [
  { login: 'CYIENTDLM\\initiator', name: 'Sanjay Initiator', role: 'Complaint User' },
  { login: 'CYIENTDLM\\member', name: 'Meera Member', role: 'Complaint User' },
  { login: 'CYIENTDLM\\member2', name: 'Mohan Member', role: 'Complaint User' },
  { login: 'CYIENTDLM\\owner', name: 'Omkar Owner', role: 'Complaint User' },
  { login: 'CYIENTDLM\\head', name: 'Harini Head', role: 'Complaint User' },
  { login: 'CYIENTDLM\\viewer', name: 'Vani Viewer', role: 'Complaint View-all' },
  { login: 'CYIENTDLM\\admin', name: 'Arjun Admin', role: 'Administrator' },
];
