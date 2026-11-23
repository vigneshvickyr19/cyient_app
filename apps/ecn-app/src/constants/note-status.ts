import type { AttachmentKind, CftActionStatus, EcnKind, FaiRequirement, NoteStatus, NoteType } from '@cyient/api-client/ecn';
import { documentUpload, type Option, type Tone } from '@cyient/shared-ui';
import { STATUS_ACTIONS } from './status-actions';

export { STATUS_ACTIONS };

/** Status names as people know them from today's tool (EcnStatusNames in the API), and their colour. */
export const statusInfo: Record<NoteStatus, { label: string; tone: Tone }> = {
  [STATUS_ACTIONS.DRAFT]: { label: 'Draft', tone: 'neutral' },
  [STATUS_ACTIONS.CFT_MEETING]: { label: 'CFT Meeting', tone: 'info' },
  [STATUS_ACTIONS.CFT_REVIEW]: { label: 'CFT Review', tone: 'info' },
  [STATUS_ACTIONS.CFT_CLOSED]: { label: 'CFT Actions Closed', tone: 'primary' },
  [STATUS_ACTIONS.REVIEWER_REVIEW]: { label: 'Reviewer Review', tone: 'info' },
  [STATUS_ACTIONS.APPROVER_REVIEW]: { label: 'Approver Review', tone: 'info' },
  [STATUS_ACTIONS.APPROVED]: { label: 'Approved', tone: 'success' },
  [STATUS_ACTIONS.RELEASED]: { label: 'Released', tone: 'success' },
  [STATUS_ACTIONS.CANCELLED]: { label: 'Cancelled', tone: 'warning' },
};

/** Statuses of notes not yet closed, as the In progress list shows them. */
const openStatuses: NoteStatus[] = [
  STATUS_ACTIONS.DRAFT,
  STATUS_ACTIONS.CFT_MEETING,
  STATUS_ACTIONS.CFT_REVIEW,
  STATUS_ACTIONS.CFT_CLOSED,
  STATUS_ACTIONS.REVIEWER_REVIEW,
  STATUS_ACTIONS.APPROVER_REVIEW,
  STATUS_ACTIONS.APPROVED,
];

const toOptions = (statuses: readonly NoteStatus[]): Option<NoteStatus>[] => statuses.map((value) => ({ value, label: statusInfo[value].label }));

export const statusOptions = toOptions(Object.keys(statusInfo) as NoteStatus[]);
export const openStatusOptions = toOptions(openStatuses);

export const isNoteStatus = (value: string | null | undefined): value is NoteStatus => typeof value === 'string' && value in statusInfo;

/** A Log or task stage: a status (CftReview) shown by its name, or a step such as Release as it is. */
export const stageLabel = (stage: string) => (isNoteStatus(stage) ? statusInfo[stage].label : stage);

export const typeLabels: Record<NoteType, string> = { Ecn: 'ECN', Tcn: 'TCN' };
export const typeOptions: Option<NoteType>[] = [
  { value: 'Ecn', label: 'ECN' },
  { value: 'Tcn', label: 'TCN' },
];
export const isNoteType = (value: string | null | undefined): value is NoteType => value === 'Ecn' || value === 'Tcn';

type Kind = NonNullable<EcnKind>;
export const kindLabels: Record<Kind, string> = { Sap: 'SAP', NonSap: 'Non-SAP' };
export const kindOptions: Option<Kind>[] = [
  { value: 'Sap', label: 'SAP' },
  { value: 'NonSap', label: 'Non-SAP' },
];
export const isEcnKind = (value: string | null | undefined): value is Kind => value === 'Sap' || value === 'NonSap';

export const faiLabels: Record<FaiRequirement, string> = { Required: 'Required', NotRequired: 'Not-Required', Partial: 'Partial' };
export const faiOptions: Option<FaiRequirement>[] = (Object.keys(faiLabels) as FaiRequirement[]).map((value) => ({ value, label: faiLabels[value] }));

/** CFT action statuses as on the function tabs. */
export const actionStatusInfo: Record<CftActionStatus, { label: string; tone: Tone }> = {
  [STATUS_ACTIONS.SELECT]: { label: 'Select', tone: 'neutral' },
  [STATUS_ACTIONS.OPEN]: { label: 'Open', tone: 'warning' },
  [STATUS_ACTIONS.CLOSED]: { label: 'Closed', tone: 'success' },
  [STATUS_ACTIONS.NOT_APPLICABLE]: { label: 'Not Applicable', tone: 'neutral' },
  [STATUS_ACTIONS.FUTURE_DATE]: { label: 'Future date', tone: 'info' },
};
export const actionStatusOptions: Option<CftActionStatus>[] = (Object.keys(actionStatusInfo) as CftActionStatus[]).map((value) => ({
  value,
  label: actionStatusInfo[value].label,
}));

/** Actions that still need the member: anything not closed or marked not applicable. */
export const isOpenAction = (status: CftActionStatus) => status !== STATUS_ACTIONS.CLOSED && status !== STATUS_ACTIONS.NOT_APPLICABLE;

export const attachmentKindLabels: Record<AttachmentKind, string> = {
  CustomerDocument: 'Customer documents',
  EcrApproval: 'ECR approval from the customer',
  SapEcn: 'SAP ECN',
  CftAction: 'NPI Engineer tab actions',
};

/** File types the ECN API accepts (its Platform:Files:AllowedExtensions): every API's documents, and archives and saved emails. */
export const attachmentExtensions: readonly string[] = [...documentUpload.extensions, '.zip', '.msg', '.eml'];
