import type {
  CftActionStatus,
  EcnKind,
  FaiRequirement,
  NoteStatus,
  NoteType,
} from '@cyient/api-client/ecn';
import type { Option } from '@cyient/shared-ui';
import {
  actionStatusInfo,
  faiLabels,
  kindLabels,
  openStatuses,
  statusInfo,
  typeLabels,
} from './note-status';
import { STATUS_ACTIONS } from './status-actions';

export type YesNo = 'Yes' | 'No';
export type Kind = NonNullable<EcnKind>;

/** Yes / No radio and dropdown options. */
export const YES_NO_OPTIONS: readonly Option<YesNo>[] = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];
export const yesNoOptions = YES_NO_OPTIONS;

/** Note type options (ECN or TCN). */
export const TYPE_OPTIONS: readonly Option<NoteType>[] = [
  { value: 'Ecn', label: typeLabels.Ecn },
  { value: 'Tcn', label: typeLabels.Tcn },
];
export const typeOptions = TYPE_OPTIONS;

/** ECN kind options (SAP or Non-SAP). */
export const KIND_OPTIONS: readonly Option<Kind>[] = [
  { value: 'Sap', label: kindLabels.Sap },
  { value: 'NonSap', label: kindLabels.NonSap },
];
export const kindOptions = KIND_OPTIONS;

/** FAI requirement options. */
export const FAI_OPTIONS: readonly Option<FaiRequirement>[] = (
  Object.keys(faiLabels) as FaiRequirement[]
).map((value) => ({
  value,
  label: faiLabels[value],
}));
export const faiOptions = FAI_OPTIONS;

/** CFT action status options. */
export const ACTION_STATUS_OPTIONS: readonly Option<CftActionStatus>[] = (
  Object.keys(actionStatusInfo) as CftActionStatus[]
).map((value) => ({
  value,
  label: actionStatusInfo[value].label,
}));
export const actionStatusOptions = ACTION_STATUS_OPTIONS;

const toOptions = (statuses: readonly NoteStatus[]): Option<NoteStatus>[] =>
  statuses.map((value) => ({ value, label: statusInfo[value].label }));

/** All note status options for filters. */
export const STATUS_OPTIONS: readonly Option<NoteStatus>[] = toOptions(
  Object.keys(statusInfo) as NoteStatus[],
);
export const statusOptions = STATUS_OPTIONS;

/** Open/in-progress status options for notes. */
export const OPEN_STATUS_OPTIONS: readonly Option<NoteStatus>[] = toOptions(openStatuses);
export const openStatusOptions = OPEN_STATUS_OPTIONS;

/** Open tasks stage filter options. */
export const STAGE_OPTIONS: readonly Option<NoteStatus>[] = [
  { value: STATUS_ACTIONS.CFT_REVIEW, label: 'CFT Review (CFT members)' },
  { value: STATUS_ACTIONS.CFT_CLOSED, label: 'CFT Actions Closed (initiator)' },
  { value: STATUS_ACTIONS.REVIEWER_REVIEW, label: 'Reviewer Review' },
  { value: STATUS_ACTIONS.APPROVER_REVIEW, label: 'Approver Review' },
  { value: STATUS_ACTIONS.APPROVED, label: 'Approved (release by ECN admins)' },
];
export const stageOptions = STAGE_OPTIONS;
