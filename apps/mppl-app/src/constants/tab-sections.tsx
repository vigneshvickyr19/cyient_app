import type { IssueDetails } from '@cyient/api-client/mppl';
import type { ReactNode } from 'react';
import { DocumentsSection } from '@/views/issues/detail/DocumentsSection';
import { IssueSummary } from '@/views/issues/detail/IssueSummary';
import { LogSection } from '@/views/issues/detail/LogSection';

/** Administration record history tabs for issues. */
export const RECORD_HISTORY_SECTIONS = {
  HISTORY: 'history',
  EMAILS: 'emails',
  AUDIT: 'audit',
} as const;

export const RECORD_HISTORY_TABS = [
  RECORD_HISTORY_SECTIONS.HISTORY,
  RECORD_HISTORY_SECTIONS.EMAILS,
  RECORD_HISTORY_SECTIONS.AUDIT,
] as const;

export type RecordHistoryTab = (typeof RECORD_HISTORY_TABS)[number];
export const DEFAULT_RECORD_HISTORY_TAB: RecordHistoryTab = RECORD_HISTORY_SECTIONS.HISTORY;

/** Issue detail view tabs. */
export const ISSUE_DETAIL_SECTIONS = {
  DETAILS: 'details',
  DOCUMENTS: 'documents',
  LOG: 'log',
} as const;

export const ISSUE_DETAIL_TABS = [
  ISSUE_DETAIL_SECTIONS.DETAILS,
  ISSUE_DETAIL_SECTIONS.DOCUMENTS,
  ISSUE_DETAIL_SECTIONS.LOG,
] as const;

export type IssueDetailTab = (typeof ISSUE_DETAIL_TABS)[number];
export const DEFAULT_ISSUE_DETAIL_TAB: IssueDetailTab = ISSUE_DETAIL_SECTIONS.DETAILS;

/** Issue list filter tabs. */
export const ISSUE_LIST_TABS = ['All', 'Mine'] as const;
export type IssueListTab = (typeof ISSUE_LIST_TABS)[number];
export const DEFAULT_ISSUE_LIST_TAB: IssueListTab = 'All';

/** Context passed to issue detail tab components and label resolvers. */
export interface IssueDetailContext {
  issue: IssueDetails;
  publicId: string;
}

/** Configuration interface for issue detail tabs. */
export interface IssueTabSectionConfig {
  key: IssueDetailTab;
  label: string | ((context: IssueDetailContext) => string);
  disabled?: (context: IssueDetailContext) => boolean;
  render: (context: IssueDetailContext) => ReactNode;
}

/** Component mapping for every issue detail tab. */
export const ISSUE_DETAIL_TAB_COMPONENTS: Record<
  IssueDetailTab,
  (context: IssueDetailContext) => ReactNode
> = {
  details: ({ issue }) => <IssueSummary issue={issue} />,
  documents: ({ issue }) => <DocumentsSection issue={issue} />,
  log: ({ publicId }) => <LogSection publicId={publicId} />,
};

/** Ordered configuration for issue detail tabs. */
export const ISSUE_DETAIL_TAB_SECTIONS: readonly IssueTabSectionConfig[] = [
  {
    key: ISSUE_DETAIL_SECTIONS.DETAILS,
    label: 'Details',
    render: ISSUE_DETAIL_TAB_COMPONENTS.details,
  },
  {
    key: ISSUE_DETAIL_SECTIONS.DOCUMENTS,
    label: ({ issue }) => `Documents${issue.documentCount ? ` (${issue.documentCount})` : ''}`,
    render: ISSUE_DETAIL_TAB_COMPONENTS.documents,
  },
  {
    key: ISSUE_DETAIL_SECTIONS.LOG,
    label: 'Log',
    render: ISSUE_DETAIL_TAB_COMPONENTS.log,
  },
];

/** Dynamically renders the active tab component based on configuration. */
export function renderIssueDetailTab(
  activeTab: IssueDetailTab | string,
  context: IssueDetailContext,
): ReactNode {
  const renderer = ISSUE_DETAIL_TAB_COMPONENTS[activeTab as IssueDetailTab];
  return renderer ? renderer(context) : null;
}
