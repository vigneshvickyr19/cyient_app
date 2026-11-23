import type { RequestDetails } from '@cyient/api-client/dn';
import type { ReactNode } from 'react';
import { DocumentsSection } from '@/views/requests/detail/DocumentsSection';
import { HistorySection } from '@/views/requests/detail/HistorySection';
import { RequestSummary } from '@/views/requests/detail/RequestSummary';
import { ReviewersSection } from '@/views/requests/detail/ReviewersSection';

/** Administration record history tabs for deviation requests. */
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

/** Deviation request detail view tabs. */
export const REQUEST_DETAIL_SECTIONS = {
  DETAILS: 'details',
  REVIEWERS: 'reviewers',
  DOCUMENTS: 'documents',
  HISTORY: 'history',
} as const;

export const REQUEST_DETAIL_TABS = [
  REQUEST_DETAIL_SECTIONS.DETAILS,
  REQUEST_DETAIL_SECTIONS.REVIEWERS,
  REQUEST_DETAIL_SECTIONS.DOCUMENTS,
  REQUEST_DETAIL_SECTIONS.HISTORY,
] as const;

export type RequestDetailTab = (typeof REQUEST_DETAIL_TABS)[number];
export const DEFAULT_REQUEST_DETAIL_TAB: RequestDetailTab = REQUEST_DETAIL_SECTIONS.DETAILS;

/** Request list filter tabs. */
export const REQUEST_LIST_TABS = ['All', 'Mine'] as const;
export type RequestListTab = (typeof REQUEST_LIST_TABS)[number];
export const DEFAULT_REQUEST_LIST_TAB: RequestListTab = 'All';

/** Context passed to request detail tab components and label resolvers. */
export interface RequestDetailContext {
  request: RequestDetails;
  publicId: string;
}

/** Configuration interface for request detail tabs. */
export interface RequestTabSectionConfig {
  key: RequestDetailTab;
  label: string | ((context: RequestDetailContext) => string);
  disabled?: (context: RequestDetailContext) => boolean;
  render: (context: RequestDetailContext) => ReactNode;
}

/** Component mapping for every request detail tab. */
export const REQUEST_DETAIL_TAB_COMPONENTS: Record<
  RequestDetailTab,
  (context: RequestDetailContext) => ReactNode
> = {
  details: ({ request }) => <RequestSummary request={request} />,
  reviewers: ({ request }) => <ReviewersSection request={request} />,
  documents: ({ request }) => <DocumentsSection request={request} />,
  history: ({ publicId }) => <HistorySection publicId={publicId} />,
};

/** Ordered configuration for request detail tabs. */
export const REQUEST_DETAIL_TAB_SECTIONS: readonly RequestTabSectionConfig[] = [
  {
    key: REQUEST_DETAIL_SECTIONS.DETAILS,
    label: 'Deviation request',
    render: REQUEST_DETAIL_TAB_COMPONENTS.details,
  },
  {
    key: REQUEST_DETAIL_SECTIONS.REVIEWERS,
    label: ({ request }) => `Reviewers (${request.reviewers.length})`,
    render: REQUEST_DETAIL_TAB_COMPONENTS.reviewers,
  },
  {
    key: REQUEST_DETAIL_SECTIONS.DOCUMENTS,
    label: ({ request }) => `Documents${request.documentCount ? ` (${request.documentCount})` : ''}`,
    render: REQUEST_DETAIL_TAB_COMPONENTS.documents,
  },
  {
    key: REQUEST_DETAIL_SECTIONS.HISTORY,
    label: 'History',
    render: REQUEST_DETAIL_TAB_COMPONENTS.history,
  },
];

/** Dynamically renders the active tab component based on configuration. */
export function renderRequestDetailTab(
  activeTab: RequestDetailTab | string,
  context: RequestDetailContext,
): ReactNode {
  const renderer = REQUEST_DETAIL_TAB_COMPONENTS[activeTab as RequestDetailTab];
  return renderer ? renderer(context) : null;
}
