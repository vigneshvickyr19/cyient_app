export const STATUS_ACTIONS = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'PendingApproval',
  MORE_DETAILS_REQUIRED: 'MoreDetailsRequired',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CLOSED_BY_ADMIN: 'ClosedByAdmin',
  WAITING: 'Waiting',
  PENDING: 'Pending',
} as const;

export type StatusAction = (typeof STATUS_ACTIONS)[keyof typeof STATUS_ACTIONS];
