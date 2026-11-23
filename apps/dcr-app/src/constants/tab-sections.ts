/** Administration record history tabs for requests. */
export const RECORD_HISTORY_TABS = ['history', 'emails', 'audit'] as const;
export type RecordHistoryTab = (typeof RECORD_HISTORY_TABS)[number];
export const DEFAULT_RECORD_HISTORY_TAB: RecordHistoryTab = 'history';

/** Document Change Request detail sections. */
export const REQUEST_DETAIL_TABS = ['details', 'clauses', 'documents', 'log'] as const;
export type RequestDetailTab = (typeof REQUEST_DETAIL_TABS)[number];
export const DEFAULT_REQUEST_DETAIL_TAB: RequestDetailTab = 'details';

/** Request list scope filter tabs. */
export const REQUEST_LIST_TABS = ['All', 'Mine'] as const;
export type RequestListTab = (typeof REQUEST_LIST_TABS)[number];
export const DEFAULT_REQUEST_LIST_TAB: RequestListTab = 'All';
