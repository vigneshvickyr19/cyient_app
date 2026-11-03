import type { AttachmentKind, CftActionStatus, EcnKind, FaiRequirement, NoteStatus, NoteType } from '@cyient/api-client/ecn';
import { documentUpload, type Option, type Tone } from '@cyient/shared-ui';

/** Status names as people know them from today's tool (EcnStatusNames in the API), and their colour. */
export const statusInfo: Record<NoteStatus, { label: string; tone: Tone }> = {
  Draft: { label: 'Draft', tone: 'neutral' },
  CftMeeting: { label: 'CFT Meeting', tone: 'info' },
  CftReview: { label: 'CFT Review', tone: 'info' },
  CftClosed: { label: 'CFT Actions Closed', tone: 'primary' },
  ReviewerReview: { label: 'Reviewer Review', tone: 'info' },
  ApproverReview: { label: 'Approver Review', tone: 'info' },
  Approved: { label: 'Approved', tone: 'success' },
  Released: { label: 'Released', tone: 'success' },
  Cancelled: { label: 'Cancelled', tone: 'warning' },
};

/** Statuses of notes not yet closed, as the In progress list shows them. */
const openStatuses: NoteStatus[] = ['Draft', 'CftMeeting', 'CftReview', 'CftClosed', 'ReviewerReview', 'ApproverReview', 'Approved'];

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
  Select: { label: 'Select', tone: 'neutral' },
  Open: { label: 'Open', tone: 'warning' },
  Closed: { label: 'Closed', tone: 'success' },
  NotApplicable: { label: 'Not Applicable', tone: 'neutral' },
  FutureDate: { label: 'Future date', tone: 'info' },
};
export const actionStatusOptions: Option<CftActionStatus>[] = (Object.keys(actionStatusInfo) as CftActionStatus[]).map((value) => ({
  value,
  label: actionStatusInfo[value].label,
}));

/** Actions that still need the member: anything not closed or marked not applicable. */
export const isOpenAction = (status: CftActionStatus) => status !== 'Closed' && status !== 'NotApplicable';

export const attachmentKindLabels: Record<AttachmentKind, string> = {
  CustomerDocument: 'Customer documents',
  EcrApproval: 'ECR approval from the customer',
  SapEcn: 'SAP ECN',
  CftAction: 'NPI Engineer tab actions',
};

/** File types the ECN API accepts (its Platform:Files:AllowedExtensions): every API's documents, and archives and saved emails. */
export const attachmentExtensions: readonly string[] = [...documentUpload.extensions, '.zip', '.msg', '.eml'];
