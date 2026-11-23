/** Administration record history tabs for complaints. */
export const RECORD_HISTORY_TABS = ['history', 'emails', 'audit'] as const;
export type RecordHistoryTab = (typeof RECORD_HISTORY_TABS)[number];
export const DEFAULT_RECORD_HISTORY_TAB: RecordHistoryTab = 'history';

/** 8D complaint detail sections. */
export const COMPLAINT_DETAIL_TABS = [
  'registration',
  'd4',
  'd5',
  'd6',
  'd7',
  'd8',
  'documents',
  'log',
] as const;
export type ComplaintDetailTab = (typeof COMPLAINT_DETAIL_TABS)[number];
export const DEFAULT_COMPLAINT_DETAIL_TAB: ComplaintDetailTab = 'registration';

/** Complaint list scope filter tabs. */
export const COMPLAINT_LIST_TABS = ['All', 'Mine'] as const;
export type ComplaintListTab = (typeof COMPLAINT_LIST_TABS)[number];
export const DEFAULT_COMPLAINT_LIST_TAB: ComplaintListTab = 'All';
