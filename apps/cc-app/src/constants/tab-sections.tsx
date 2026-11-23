import type { ComplaintDetails } from '@cyient/api-client/cc';
import type { ReactNode } from 'react';
import { ActionsSection } from '@/views/complaints/detail/ActionsSection';
import { DocumentsSection } from '@/views/complaints/detail/DocumentsSection';
import { FirstPageSection } from '@/views/complaints/detail/FirstPageSection';
import { LogSection } from '@/views/complaints/detail/LogSection';
import { RootCauseSection } from '@/views/complaints/detail/RootCauseSection';
import { StepTextSection } from '@/views/complaints/detail/StepTextSection';
import { stepReached } from './complaint-status';

/** Administration record history tabs for complaints. */
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

/** 8D complaint detail sections. */
export const COMPLAINT_DETAIL_SECTIONS = {
  REGISTRATION: 'registration',
  D4: 'd4',
  D5: 'd5',
  D6: 'd6',
  D7: 'd7',
  D8: 'd8',
  DOCUMENTS: 'documents',
  LOG: 'log',
} as const;

export const COMPLAINT_DETAIL_TABS = [
  COMPLAINT_DETAIL_SECTIONS.REGISTRATION,
  COMPLAINT_DETAIL_SECTIONS.D4,
  COMPLAINT_DETAIL_SECTIONS.D5,
  COMPLAINT_DETAIL_SECTIONS.D6,
  COMPLAINT_DETAIL_SECTIONS.D7,
  COMPLAINT_DETAIL_SECTIONS.D8,
  COMPLAINT_DETAIL_SECTIONS.DOCUMENTS,
  COMPLAINT_DETAIL_SECTIONS.LOG,
] as const;

export type ComplaintDetailTab = (typeof COMPLAINT_DETAIL_TABS)[number];
export const DEFAULT_COMPLAINT_DETAIL_TAB: ComplaintDetailTab = COMPLAINT_DETAIL_SECTIONS.REGISTRATION;

/** Complaint list scope filter tabs. */
export const COMPLAINT_LIST_TABS = ['All', 'Mine'] as const;
export type ComplaintListTab = (typeof COMPLAINT_LIST_TABS)[number];
export const DEFAULT_COMPLAINT_LIST_TAB: ComplaintListTab = 'All';

/** Context passed to tab components and label resolvers. */
export interface ComplaintDetailContext {
  complaint: ComplaintDetails;
  publicId: string;
  onMoved: () => void;
  canUpload: boolean;
  status: string;
}

/** Configuration interface for complaint detail tabs. */
export interface ComplaintTabSectionConfig {
  key: ComplaintDetailTab;
  label: string | ((context: ComplaintDetailContext) => string);
  disabled?: (context: ComplaintDetailContext) => boolean;
  render: (context: ComplaintDetailContext) => ReactNode;
}

/** Component mapping for every complaint detail tab. */
export const COMPLAINT_DETAIL_TAB_COMPONENTS: Record<
  ComplaintDetailTab,
  (context: ComplaintDetailContext) => ReactNode
> = {
  registration: ({ complaint }) => <FirstPageSection complaint={complaint} />,
  d4: ({ complaint, onMoved }) => <RootCauseSection complaint={complaint} onMoved={onMoved} />,
  d5: ({ complaint, onMoved }) => <ActionsSection complaint={complaint} onMoved={onMoved} />,
  d6: ({ complaint, onMoved }) => <StepTextSection complaint={complaint} step="verification" onMoved={onMoved} />,
  d7: ({ complaint, onMoved }) => <StepTextSection complaint={complaint} step="horizontalDeployment" onMoved={onMoved} />,
  d8: ({ complaint, onMoved }) => <StepTextSection complaint={complaint} step="closure" onMoved={onMoved} />,
  documents: ({ complaint, canUpload }) => <DocumentsSection complaint={complaint} canUpload={canUpload} />,
  log: ({ publicId }) => <LogSection publicId={publicId} />,
};

/** Ordered configuration for complaint detail tabs. */
export const COMPLAINT_DETAIL_TAB_SECTIONS: readonly ComplaintTabSectionConfig[] = [
  {
    key: COMPLAINT_DETAIL_SECTIONS.REGISTRATION,
    label: 'First page',
    disabled: ({ status }) => !stepReached(status as any, 0),
    render: COMPLAINT_DETAIL_TAB_COMPONENTS.registration,
  },
  {
    key: COMPLAINT_DETAIL_SECTIONS.D4,
    label: 'Root cause',
    disabled: ({ status }) => !stepReached(status as any, 1),
    render: COMPLAINT_DETAIL_TAB_COMPONENTS.d4,
  },
  {
    key: COMPLAINT_DETAIL_SECTIONS.D5,
    label: ({ complaint }) =>
      complaint.actions.length > 0 ? `Actions (${complaint.actions.length})` : 'Actions',
    disabled: ({ status }) => !stepReached(status as any, 2),
    render: COMPLAINT_DETAIL_TAB_COMPONENTS.d5,
  },
  {
    key: COMPLAINT_DETAIL_SECTIONS.D6,
    label: 'Verification',
    disabled: ({ status }) => !stepReached(status as any, 3),
    render: COMPLAINT_DETAIL_TAB_COMPONENTS.d6,
  },
  {
    key: COMPLAINT_DETAIL_SECTIONS.D7,
    label: 'Deployment',
    disabled: ({ status }) => !stepReached(status as any, 4),
    render: COMPLAINT_DETAIL_TAB_COMPONENTS.d7,
  },
  {
    key: COMPLAINT_DETAIL_SECTIONS.D8,
    label: 'Closure',
    disabled: ({ status }) => !stepReached(status as any, 5),
    render: COMPLAINT_DETAIL_TAB_COMPONENTS.d8,
  },
  {
    key: COMPLAINT_DETAIL_SECTIONS.DOCUMENTS,
    label: ({ complaint }) => `Documents${complaint.documentCount ? ` (${complaint.documentCount})` : ''}`,
    render: COMPLAINT_DETAIL_TAB_COMPONENTS.documents,
  },
  {
    key: COMPLAINT_DETAIL_SECTIONS.LOG,
    label: 'Log',
    render: COMPLAINT_DETAIL_TAB_COMPONENTS.log,
  },
];

/** Dynamically renders the active tab component based on configuration. */
export function renderComplaintDetailTab(
  activeTab: ComplaintDetailTab | string,
  context: ComplaintDetailContext,
): ReactNode {
  const renderer = COMPLAINT_DETAIL_TAB_COMPONENTS[activeTab as ComplaintDetailTab];
  return renderer ? renderer(context) : null;
}
