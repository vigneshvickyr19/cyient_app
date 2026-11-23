import { STATUS_ACTIONS } from './status-actions';

/** Administration record history tabs for sourcing issues. */
export const RECORD_HISTORY_TABS = ['history', 'emails', 'audit'] as const;
export type RecordHistoryTab = (typeof RECORD_HISTORY_TABS)[number];
export const DEFAULT_RECORD_HISTORY_TAB: RecordHistoryTab = 'history';

/** Issue detail sections. */
export const ISSUE_DETAIL_TABS = ['details', 'documents', 'log'] as const;
export type IssueDetailTab = (typeof ISSUE_DETAIL_TABS)[number];
export const DEFAULT_ISSUE_DETAIL_TAB: IssueDetailTab = 'details';

/** Issue list tabs. */
export const ISSUE_LIST_TABS = [STATUS_ACTIONS.OPEN, STATUS_ACTIONS.FIXED, STATUS_ACTIONS.DRAFTS] as const;
export type IssueListTab = (typeof ISSUE_LIST_TABS)[number];
export const DEFAULT_ISSUE_LIST_TAB: IssueListTab = STATUS_ACTIONS.OPEN;
