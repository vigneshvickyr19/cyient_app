import type { ActionStatus, ComplaintDetails, ComplaintStatus } from '@cyient/api-client/cc';
import type { Tone } from '@cyient/shared-ui';
import { STATUS_ACTIONS } from './status-actions';

export { STATUS_ACTIONS };

/** Status names as people know them from the 8D form (CcStatusNames in the API), and their colour. */
export const statusInfo: Record<ComplaintStatus, { label: string; tone: Tone }> = {
  [STATUS_ACTIONS.DRAFT]: { label: 'Draft', tone: 'neutral' },
  [STATUS_ACTIONS.ROOT_CAUSE]: { label: 'D4 Root Cause', tone: 'info' },
  [STATUS_ACTIONS.ACTION_PLAN]: { label: 'D5 Action Plan', tone: 'info' },
  [STATUS_ACTIONS.VERIFICATION]: { label: 'D6 Verification', tone: 'info' },
  [STATUS_ACTIONS.HORIZONTAL_DEPLOYMENT]: { label: 'D7 Horizontal Deployment', tone: 'info' },
  [STATUS_ACTIONS.CLOSURE]: { label: 'D8 Closure', tone: 'info' },
  [STATUS_ACTIONS.INITIATOR_REVIEW]: { label: 'Initiator Review', tone: 'warning' },
  [STATUS_ACTIONS.CLOSED]: { label: 'Closed', tone: 'success' },
  [STATUS_ACTIONS.CANCELLED]: { label: 'Cancelled', tone: 'error' },
};

export const actionStatusInfo: Record<ActionStatus, { label: string; tone: Tone }> = {
  [STATUS_ACTIONS.OPEN]: { label: 'Open', tone: 'warning' },
  [STATUS_ACTIONS.CLOSED]: { label: 'Closed', tone: 'success' },
};

export const isComplaintStatus = (value: string | undefined): value is ComplaintStatus => value !== undefined && value in statusInfo;

/** The 8D steps in order, each with the status at which it is the open step. */
export const steps = [
  { tab: 'registration', label: 'D1–D3 Registration', status: STATUS_ACTIONS.DRAFT },
  { tab: 'd4', label: 'D4 Root cause', status: STATUS_ACTIONS.ROOT_CAUSE },
  { tab: 'd5', label: 'D5 Action plan', status: STATUS_ACTIONS.ACTION_PLAN },
  { tab: 'd6', label: 'D6 Verification', status: STATUS_ACTIONS.VERIFICATION },
  { tab: 'd7', label: 'D7 Horizontal deployment', status: STATUS_ACTIONS.HORIZONTAL_DEPLOYMENT },
  { tab: 'd8', label: 'D8 Closure', status: STATUS_ACTIONS.CLOSURE },
] as const satisfies readonly { tab: string; label: string; status: ComplaintStatus }[];

export type StepTab = (typeof steps)[number]['tab'];

/** How far the complaint has come: the index of its open step (6 at Initiator Review, 7 once closed). */
const progress: Record<ComplaintStatus, number> = {
  [STATUS_ACTIONS.DRAFT]: 0,
  [STATUS_ACTIONS.ROOT_CAUSE]: 1,
  [STATUS_ACTIONS.ACTION_PLAN]: 2,
  [STATUS_ACTIONS.VERIFICATION]: 3,
  [STATUS_ACTIONS.HORIZONTAL_DEPLOYMENT]: 4,
  [STATUS_ACTIONS.CLOSURE]: 5,
  [STATUS_ACTIONS.INITIATOR_REVIEW]: 6,
  [STATUS_ACTIONS.CLOSED]: 7,
  [STATUS_ACTIONS.CANCELLED]: 7,
};

export const progressOf = (status: ComplaintStatus): number => progress[status];

/** Whether a step has opened, so its tab can be shown; a cancelled complaint shows whatever was entered. */
export const stepReached = (status: ComplaintStatus, index: number): boolean => progress[status] >= index;

/** The tab a complaint opens on: the step waiting for work, or the first page once it has finished. */
export function defaultTab(status: ComplaintStatus): StepTab {
  if (status === STATUS_ACTIONS.INITIATOR_REVIEW) return 'd8';
  return steps.find((step) => step.status === status)?.tab ?? 'registration';
}

/** Who the complaint waits for at each status. */
export const waitingFor: Record<ComplaintStatus, string | null> = {
  [STATUS_ACTIONS.DRAFT]: 'The initiator completes the first page and publishes it to the team.',
  [STATUS_ACTIONS.ROOT_CAUSE]: 'The team saves the D4 root cause; that opens D5.',
  [STATUS_ACTIONS.ACTION_PLAN]: 'The team plans the D5 actions, each owner closes theirs with evidence, then the team completes the action plan.',
  [STATUS_ACTIONS.VERIFICATION]: 'The team saves the D6 verification.',
  [STATUS_ACTIONS.HORIZONTAL_DEPLOYMENT]: 'The team saves the D7 horizontal deployment.',
  [STATUS_ACTIONS.CLOSURE]: 'The team saves the D8 closure; the complaint then goes back to the initiator.',
  [STATUS_ACTIONS.INITIATOR_REVIEW]: 'The initiator reviews the completed 8D and closes the complaint.',
  [STATUS_ACTIONS.CLOSED]: null,
  [STATUS_ACTIONS.CANCELLED]: null,
};

/** The signed-in user's part in a complaint, as the API decides who may act (ComplaintRules). */
export function partOf(complaint: ComplaintDetails, userId: number) {
  const isInitiator = complaint.initiator.id === userId;
  const isMember = complaint.teamMembers.some((member) => member.userId === userId);
  const ownedActions = complaint.actions.filter((action) => action.owner.id === userId && action.status === STATUS_ACTIONS.OPEN).length;
  const isOpen = complaint.status !== STATUS_ACTIONS.CLOSED && complaint.status !== STATUS_ACTIONS.CANCELLED;
  return {
    isInitiator,
    isMember,
    ownedActions,
    /** The initiator adds first-page documents to a draft; once published, the team does too, while it is open. */
    canUpload: complaint.status === STATUS_ACTIONS.DRAFT ? isInitiator : isOpen && (isInitiator || isMember),
  };
}
