import type { DevUser } from '@cyient/shared-ui';

/** The MPPL API's Docker sample people (docker/mppl-api.json), for development sign-in only. */
export const devUsers: readonly DevUser[] = [
  { login: 'CYIENTDLM\\buyer', name: 'Bhavna Buyer', role: 'Supply Chain' },
  { login: 'CYIENTDLM\\sourcing', name: 'Sharath Sourcing', role: 'Sourcing Lead' },
  { login: 'CYIENTDLM\\sourcing2', name: 'Sneha Sourcing', role: 'Sourcing Lead' },
  { login: 'CYIENTDLM\\escalation1', name: 'Gopal Escalation 1', role: 'Escalation level 1' },
  { login: 'CYIENTDLM\\escalation2', name: 'Ganesh Escalation 2', role: 'Escalation level 2' },
  { login: 'CYIENTDLM\\escalation3', name: 'Gita Escalation 3', role: 'Escalation level 3' },
  { login: 'CYIENTDLM\\engineer', name: 'Pranav Engineer', role: 'Product Engineer' },
  { login: 'CYIENTDLM\\viewer', name: 'Vani Viewer', role: 'All Users' },
  { login: 'CYIENTDLM\\admin', name: 'Arjun Admin', role: 'Administrator' },
];
