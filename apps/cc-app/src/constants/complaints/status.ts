import type { ActionStatus, ComplaintDetails, ComplaintStatus } from '@cyient/api-client/cc';
import type { Option, Tone } from '@cyient/shared-ui';

/** Status names as people know them from the 8D form (CcStatusNames in the API), and their colour. */
export const statusInfo: Record<ComplaintStatus, { label: string; tone: Tone }> = {
  Draft: { label: 'Draft', tone: 'neutral' },
  RootCause: { label: 'D4 Root Cause', tone: 'info' },
  ActionPlan: { label: 'D5 Action Plan', tone: 'info' },
  Verification: { label: 'D6 Verification', tone: 'info' },
  HorizontalDeployment: { label: 'D7 Horizontal Deployment', tone: 'info' },
  Closure: { label: 'D8 Closure', tone: 'info' },
  InitiatorReview: { label: 'Initiator Review', tone: 'warning' },
  Closed: { label: 'Closed', tone: 'success' },
  Cancelled: { label: 'Cancelled', tone: 'error' },
};

export const actionStatusInfo: Record<ActionStatus, { label: string; tone: Tone }> = {
  Open: { label: 'Open', tone: 'warning' },
  Closed: { label: 'Closed', tone: 'success' },
};

export const statusOptions: Option<ComplaintStatus>[] = (Object.keys(statusInfo) as ComplaintStatus[]).map((value) => ({
  value,
  label: statusInfo[value].label,
}));

export const isComplaintStatus = (value: string | undefined): value is ComplaintStatus => value !== undefined && value in statusInfo;

/** The 8D steps in order, each with the status at which it is the open step. */
export const steps = [
  { tab: 'registration', label: 'D1–D3 Registration', status: 'Draft' },
  { tab: 'd4', label: 'D4 Root cause', status: 'RootCause' },
  { tab: 'd5', label: 'D5 Action plan', status: 'ActionPlan' },
  { tab: 'd6', label: 'D6 Verification', status: 'Verification' },
  { tab: 'd7', label: 'D7 Horizontal deployment', status: 'HorizontalDeployment' },
  { tab: 'd8', label: 'D8 Closure', status: 'Closure' },
] as const satisfies readonly { tab: string; label: string; status: ComplaintStatus }[];

export type StepTab = (typeof steps)[number]['tab'];

/** How far the complaint has come: the index of its open step (6 at Initiator Review, 7 once closed). */
const progress: Record<ComplaintStatus, number> = {
  Draft: 0,
  RootCause: 1,
  ActionPlan: 2,
  Verification: 3,
  HorizontalDeployment: 4,
  Closure: 5,
  InitiatorReview: 6,
  Closed: 7,
  Cancelled: 7,
};

export const progressOf = (status: ComplaintStatus): number => progress[status];

/** Whether a step has opened, so its tab can be shown; a cancelled complaint shows whatever was entered. */
export const stepReached = (status: ComplaintStatus, index: number): boolean => progress[status] >= index;

/** The tab a complaint opens on: the step waiting for work, or the first page once it has finished. */
export function defaultTab(status: ComplaintStatus): StepTab {
  if (status === 'InitiatorReview') return 'd8';
  return steps.find((step) => step.status === status)?.tab ?? 'registration';
}

/** Who the complaint waits for at each status. */
export const waitingFor: Record<ComplaintStatus, string | null> = {
  Draft: 'The initiator completes the first page and publishes it to the team.',
  RootCause: 'The team saves the D4 root cause; that opens D5.',
  ActionPlan: 'The team plans the D5 actions, each owner closes theirs with evidence, then the team completes the action plan.',
  Verification: 'The team saves the D6 verification.',
  HorizontalDeployment: 'The team saves the D7 horizontal deployment.',
  Closure: 'The team saves the D8 closure; the complaint then goes back to the initiator.',
  InitiatorReview: 'The initiator reviews the completed 8D and closes the complaint.',
  Closed: null,
  Cancelled: null,
};

/** The signed-in user's part in a complaint, as the API decides who may act (ComplaintRules). */
export function partOf(complaint: ComplaintDetails, userId: number) {
  const isInitiator = complaint.initiator.id === userId;
  const isMember = complaint.teamMembers.some((member) => member.userId === userId);
  const ownedActions = complaint.actions.filter((action) => action.owner.id === userId && action.status === 'Open').length;
  const isOpen = complaint.status !== 'Closed' && complaint.status !== 'Cancelled';
  return {
    isInitiator,
    isMember,
    ownedActions,
    /** The initiator adds first-page documents to a draft; once published, the team does too, while it is open. */
    canUpload: complaint.status === 'Draft' ? isInitiator : isOpen && (isInitiator || isMember),
  };
}
