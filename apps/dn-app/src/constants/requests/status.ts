import type { DnStatus, ReviewerDetails, ReviewerKind, ReviewerStatus } from '@cyient/api-client/dn';
import type { Option, Tone } from '@cyient/shared-ui';

/** The most people a deviation informs (the API's limit). */
export const MAX_INFORMED = 100;

/** Status names as people know them from today's tool (DnStatusNames in the backend), and their colour. */
export const statusInfo: Record<DnStatus, { label: string; tone: Tone }> = {
  Draft: { label: 'Draft', tone: 'neutral' },
  PendingApproval: { label: 'Pending', tone: 'info' },
  MoreDetailsRequired: { label: 'More details required', tone: 'warning' },
  Approved: { label: 'Approved', tone: 'success' },
  Rejected: { label: 'Rejected', tone: 'error' },
  ClosedByAdmin: { label: 'Closed by admin', tone: 'neutral' },
};

/** The state of one step of the reviewer sequence. */
export const reviewerStatusInfo: Record<ReviewerStatus, { label: string; tone: Tone }> = {
  Waiting: { label: 'Not reached yet', tone: 'neutral' },
  Pending: { label: 'Pending', tone: 'info' },
  Approved: { label: 'Approved', tone: 'success' },
  Rejected: { label: 'Rejected', tone: 'error' },
};

export const reviewerKindLabel: Record<ReviewerKind, string> = {
  ReportingManager: 'Reporting manager',
  Reviewer: 'Reviewer',
  HeadOfDepartment: 'Head of department',
  FinalApprover: 'Final approver',
};

export const statusOptions: Option<DnStatus>[] = (Object.keys(statusInfo) as DnStatus[]).map((value) => ({
  value,
  label: statusInfo[value].label,
}));

export const isDnStatus = (value: string | undefined): value is DnStatus => value !== undefined && value in statusInfo;

/** Steps that have not acted yet, so an administrator can still change them. */
export const isOpenStep = (status: ReviewerStatus) => status === 'Waiting' || status === 'Pending';

/** The steps in the order the deviation goes through them. */
export const inOrder = (reviewers: readonly ReviewerDetails[]) => [...reviewers].sort((a, b) => a.sequence - b.sequence);
