import type { ActionStatus, ComplaintStatus, InternalComplaintStatus } from '@cyient/api-client/cc';
import type { Option } from '@cyient/shared-ui';
import { statusInfo } from './complaint-status';
import { internalStatusInfo } from './internal-status';
import { STATUS_ACTIONS } from './status-actions';

export type YesNo = 'yes' | 'no';

/** Yes/No radio and dropdown options. */
export const YES_NO_OPTIONS: readonly Option<YesNo>[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];
export const yesNoOptions = YES_NO_OPTIONS;

/** Critical filter options for external complaints. */
export const CRITICAL_OPTIONS: readonly Option<YesNo>[] = [
  { value: 'yes', label: 'Critical' },
  { value: 'no', label: 'Not critical' },
];
export const criticalOptions = CRITICAL_OPTIONS;

/** Status filter options for external complaints. */
export const STATUS_OPTIONS: readonly Option<ComplaintStatus>[] = (
  Object.keys(statusInfo) as ComplaintStatus[]
).map((value) => ({
  value,
  label: statusInfo[value].label,
}));
export const statusOptions = STATUS_OPTIONS;

/** Status filter options for internal complaints. */
export const INTERNAL_STATUS_OPTIONS: readonly Option<InternalComplaintStatus>[] = (
  Object.keys(internalStatusInfo) as InternalComplaintStatus[]
).map((value) => ({
  value,
  label: internalStatusInfo[value].label,
}));
export const internalStatusOptions = INTERNAL_STATUS_OPTIONS;

/** Containment action status options (Done / Still open). */
export const CONTAINMENT_STATUS_OPTIONS: readonly Option<ActionStatus>[] = [
  { value: STATUS_ACTIONS.CLOSED, label: 'Done' },
  { value: STATUS_ACTIONS.OPEN, label: 'Still open' },
];
export const containmentStatusOptions = CONTAINMENT_STATUS_OPTIONS;

/** Internal complaint action status options (Open / Closed). */
export const INTERNAL_ACTION_STATUS_OPTIONS: readonly Option<ActionStatus>[] = [
  { value: STATUS_ACTIONS.OPEN, label: 'Open' },
  { value: STATUS_ACTIONS.CLOSED, label: 'Closed' },
];
export const internalActionStatusOptions = INTERNAL_ACTION_STATUS_OPTIONS;

/** Generates year options centered around a base year (default: current business year). */
export function getYearOptions(
  baseYear: number = new Date().getFullYear(),
  pastYears = 2,
  futureYears = 2,
): Option<number>[] {
  const total = pastYears + 1 + futureYears;
  const start = baseYear - pastYears;
  return Array.from({ length: total }, (_, i) => start + i).map((value) => ({
    value,
    label: String(value),
  }));
}
