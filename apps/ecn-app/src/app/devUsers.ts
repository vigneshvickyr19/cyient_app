import type { DevUser } from '@cyient/shared-ui';

/** The ECN API's Docker sample people (docker/ecn-api.json), for development sign-in only. */
export const devUsers: readonly DevUser[] = [
  { login: 'CYIENTDLM\\npi', name: 'Naveen NPI', role: 'Initiator (NPI Engineer)' },
  { login: 'CYIENTDLM\\npi2', name: 'Nisha NPI', role: 'Initiator (NPI Engineer)' },
  { login: 'CYIENTDLM\\quality', name: 'Kiran Quality', role: 'CFT member (Quality)' },
  { login: 'CYIENTDLM\\production', name: 'Prakash Production', role: 'CFT member (Production)' },
  { login: 'CYIENTDLM\\purchase', name: 'Pooja Purchase', role: 'CFT member (Supply Chain)' },
  { login: 'CYIENTDLM\\reviewer', name: 'Ramesh Reviewer', role: 'Reviewer' },
  { login: 'CYIENTDLM\\approver', name: 'Anita Approver', role: 'Approver' },
  { login: 'CYIENTDLM\\ecnadmin', name: 'Eshwar ECN Admin', role: 'ECN Admin' },
  { login: 'CYIENTDLM\\head', name: 'Harini Head', role: 'Requester' },
  { login: 'CYIENTDLM\\admin', name: 'Arjun Admin', role: 'Administrator' },
];
