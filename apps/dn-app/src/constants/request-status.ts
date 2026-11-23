import type { DnStatus, ReviewerDetails, ReviewerKind, ReviewerStatus } from '@cyient/api-client/dn';
import type { Tone } from '@cyient/shared-ui';
import { STATUS_ACTIONS } from './status-actions';

export { STATUS_ACTIONS };

/** The most people a deviation informs (the API's limit). */
export const MAX_INFORMED = 100;

/** Status names as people know them from today's tool (DnStatusNames in the backend), and their colour. */
export const statusInfo: Record<DnStatus, { label: string; tone: Tone }> = {
  [STATUS_ACTIONS.DRAFT]: { label: 'Draft', tone: 'neutral' },
  [STATUS_ACTIONS.PENDING_APPROVAL]: { label: 'Pending', tone: 'info' },
  [STATUS_ACTIONS.MORE_DETAILS_REQUIRED]: { label: 'More details required', tone: 'warning' },
  [STATUS_ACTIONS.APPROVED]: { label: 'Approved', tone: 'success' },
  [STATUS_ACTIONS.REJECTED]: { label: 'Rejected', tone: 'error' },
  [STATUS_ACTIONS.CLOSED_BY_ADMIN]: { label: 'Closed by admin', tone: 'neutral' },
};

/** The state of one step of the reviewer sequence. */
export const reviewerStatusInfo: Record<ReviewerStatus, { label: string; tone: Tone }> = {
  [STATUS_ACTIONS.WAITING]: { label: 'Not reached yet', tone: 'neutral' },
  [STATUS_ACTIONS.PENDING]: { label: 'Pending', tone: 'info' },
  [STATUS_ACTIONS.APPROVED]: { label: 'Approved', tone: 'success' },
  [STATUS_ACTIONS.REJECTED]: { label: 'Rejected', tone: 'error' },
};

export const reviewerKindLabel: Record<ReviewerKind, string> = {
  ReportingManager: 'Reporting manager',
  Reviewer: 'Reviewer',
  HeadOfDepartment: 'Head of department',
  FinalApprover: 'Final approver',
};

export const isDnStatus = (value: string | undefined): value is DnStatus => value !== undefined && value in statusInfo;

/** Steps that have not acted yet, so an administrator can still change them. */
export const isOpenStep = (status: ReviewerStatus) => status === STATUS_ACTIONS.WAITING || status === STATUS_ACTIONS.PENDING;

/** The steps in the order the deviation goes through them. */
export const inOrder = (reviewers: readonly ReviewerDetails[]) => [...reviewers].sort((a, b) => a.sequence - b.sequence);
