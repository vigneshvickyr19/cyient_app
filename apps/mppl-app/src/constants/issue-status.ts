import type { IssueList, IssueStatus } from '@cyient/api-client/mppl';
import type { Tone } from '@cyient/shared-ui';
import { STATUS_ACTIONS } from './status-actions';

export { STATUS_ACTIONS };

/** Status names as people know them from today's tool, and their colour. */
export const statusInfo: Record<IssueStatus, { label: string; tone: Tone }> = {
  [STATUS_ACTIONS.DRAFT]: { label: 'Draft', tone: 'neutral' },
  [STATUS_ACTIONS.OPEN]: { label: 'Open', tone: 'warning' },
  [STATUS_ACTIONS.CLOSED]: { label: 'Closed', tone: 'success' },
};

/** The lists of the Issues page, as the API names them. */
export type IssueTab = Exclude<IssueList, 'All' | null>;

export const isIssueTab = (value: string | undefined): value is IssueTab =>
  value === STATUS_ACTIONS.OPEN || value === STATUS_ACTIONS.FIXED || value === STATUS_ACTIONS.DRAFTS;

/** The heading of an issue: issues have no number of their own, so they go by PO and line, as today. */
export const issueTitle = (issue: { poNumber: string; poLineNumber: number }) => `PO ${issue.poNumber} / line ${issue.poLineNumber}`;
