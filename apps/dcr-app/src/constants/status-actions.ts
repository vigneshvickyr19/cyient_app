export const STATUS_ACTIONS = {
  DRAFT: 'Draft',
  IMS_REVIEW: 'ImsReview',
  DEPT_MANAGER_REVIEW: 'DeptManagerReview',
  DEPT_HEAD_REVIEW: 'DeptHeadReview',
  MR_REVIEW: 'MrReview',
  APPROVED: 'Approved',
  IMS_REJECTED: 'ImsRejected',
  DEPT_MANAGER_REJECTED: 'DeptManagerRejected',
  DEPT_HEAD_REJECTED: 'DeptHeadRejected',
  MR_REJECTED: 'MrRejected',
  WITHDRAWN: 'Withdrawn',
  CANCELLED: 'Cancelled',
  NOT_YET_RELEASED: 'NotYetReleased',
  RELEASED: 'Released',
} as const;

export type StatusAction = (typeof STATUS_ACTIONS)[keyof typeof STATUS_ACTIONS];
