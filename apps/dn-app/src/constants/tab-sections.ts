/** Administration record history tabs for deviation requests. */
export const RECORD_HISTORY_TABS = ['history', 'emails', 'audit'] as const;
export type RecordHistoryTab = (typeof RECORD_HISTORY_TABS)[number];
export const DEFAULT_RECORD_HISTORY_TAB: RecordHistoryTab = 'history';

/** Deviation request detail sections. */
export const REQUEST_DETAIL_TABS = ['details', 'reviewers', 'documents', 'history'] as const;
export type RequestDetailTab = (typeof REQUEST_DETAIL_TABS)[number];
export const DEFAULT_REQUEST_DETAIL_TAB: RequestDetailTab = 'details';

/** Request list scope filter tabs. */
export const REQUEST_LIST_TABS = ['All', 'Mine'] as const;
export type RequestListTab = (typeof REQUEST_LIST_TABS)[number];
export const DEFAULT_REQUEST_LIST_TAB: RequestListTab = 'All';
