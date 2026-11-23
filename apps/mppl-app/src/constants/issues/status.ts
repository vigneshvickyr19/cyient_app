import type { IssueList, IssueStatus } from '@cyient/api-client/mppl';
import type { Tone } from '@cyient/shared-ui';

/** Status names as people know them from today's tool, and their colour. */
export const statusInfo: Record<IssueStatus, { label: string; tone: Tone }> = {
  Draft: { label: 'Draft', tone: 'neutral' },
  Open: { label: 'Open', tone: 'warning' },
  Closed: { label: 'Closed', tone: 'success' },
};

/** The lists of the Issues page, as the API names them. */
export type IssueTab = Exclude<IssueList, 'All' | null>;

export const isIssueTab = (value: string | undefined): value is IssueTab => value === 'Open' || value === 'Fixed' || value === 'Drafts';

/** The heading of an issue: issues have no number of their own, so they go by PO and line, as today. */
export const issueTitle = (issue: { poNumber: string; poLineNumber: number }) => `PO ${issue.poNumber} / line ${issue.poLineNumber}`;
