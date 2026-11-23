export const STATUS_ACTIONS = {
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PENDING: 'Pending',
  DRAFT: 'Draft',
  OPEN: 'Open',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
  RELEASED: 'Released',
  SENDING: 'Sending',
  SENT: 'Sent',
  FAILED: 'Failed',
} as const;

export type SharedStatusAction = (typeof STATUS_ACTIONS)[keyof typeof STATUS_ACTIONS];
