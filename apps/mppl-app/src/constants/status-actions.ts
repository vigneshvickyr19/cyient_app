export const STATUS_ACTIONS = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  CLOSED: 'Closed',
  FIXED: 'Fixed',
  DRAFTS: 'Drafts',
} as const;

export type StatusAction = (typeof STATUS_ACTIONS)[keyof typeof STATUS_ACTIONS];
