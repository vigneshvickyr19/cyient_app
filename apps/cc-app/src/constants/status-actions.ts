export const STATUS_ACTIONS = {
  DRAFT: 'Draft',
  ROOT_CAUSE: 'RootCause',
  ACTION_PLAN: 'ActionPlan',
  VERIFICATION: 'Verification',
  HORIZONTAL_DEPLOYMENT: 'HorizontalDeployment',
  CLOSURE: 'Closure',
  INITIATOR_REVIEW: 'InitiatorReview',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
  OPEN: 'Open',
} as const;

export type StatusAction = (typeof STATUS_ACTIONS)[keyof typeof STATUS_ACTIONS];
