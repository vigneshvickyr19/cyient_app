import type { IssueList, IssueStatus } from '@cyient/api-client/mppl';
import type { Option } from '@cyient/shared-ui';
import { STATUS_ACTIONS, statusInfo, type IssueTab } from './issue-status';

export type AdminList = Exclude<IssueList, null>;

/** Admin issue list tab and dropdown options. */
export const MANAGE_ISSUE_LIST_OPTIONS: readonly Option<AdminList>[] = [
  { value: STATUS_ACTIONS.OPEN, label: 'Open' },
  { value: STATUS_ACTIONS.FIXED, label: 'Fixed' },
  { value: STATUS_ACTIONS.DRAFTS, label: 'Drafts' },
  { value: 'All', label: 'Open and fixed' },
];
export const manageIssueListOptions = MANAGE_ISSUE_LIST_OPTIONS;
export const adminListOptions = MANAGE_ISSUE_LIST_OPTIONS;

/** Issue status options for filters and displays. */
export const STATUS_OPTIONS: readonly Option<IssueStatus>[] = (
  Object.keys(statusInfo) as IssueStatus[]
).map((value) => ({
  value,
  label: statusInfo[value].label,
}));
export const statusOptions = STATUS_OPTIONS;

/** Standard issue tabs (Open, Fixed, Drafts). */
export const ISSUE_TAB_OPTIONS: readonly Option<IssueTab>[] = [
  { value: STATUS_ACTIONS.OPEN, label: 'Open' },
  { value: STATUS_ACTIONS.FIXED, label: 'Fixed' },
  { value: STATUS_ACTIONS.DRAFTS, label: 'Drafts' },
];
export const issueTabOptions = ISSUE_TAB_OPTIONS;
