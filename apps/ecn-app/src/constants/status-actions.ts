export const STATUS_ACTIONS = {
  DRAFT: 'Draft',
  CFT_MEETING: 'CftMeeting',
  CFT_REVIEW: 'CftReview',
  CFT_CLOSED: 'CftClosed',
  REVIEWER_REVIEW: 'ReviewerReview',
  APPROVER_REVIEW: 'ApproverReview',
  APPROVED: 'Approved',
  RELEASED: 'Released',
  CANCELLED: 'Cancelled',
  SELECT: 'Select',
  OPEN: 'Open',
  CLOSED: 'Closed',
  NOT_APPLICABLE: 'NotApplicable',
  FUTURE_DATE: 'FutureDate',
} as const;

export type StatusAction = (typeof STATUS_ACTIONS)[keyof typeof STATUS_ACTIONS];
