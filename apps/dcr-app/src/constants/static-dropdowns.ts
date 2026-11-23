import type { ClauseChangeType, DcrStatus, ReleasedStatus } from '@cyient/api-client/dcr';
import type { Option } from '@cyient/shared-ui';
import { releasedInfo, statusInfo } from './request-status';

/** Status filter options for DCR requests. */
export const STATUS_OPTIONS: readonly Option<DcrStatus>[] = (
  Object.keys(statusInfo) as DcrStatus[]
).map((value) => ({
  value,
  label: statusInfo[value].label,
}));
export const statusOptions = STATUS_OPTIONS;

/** Released filter options for DCR requests. */
export const RELEASED_OPTIONS: readonly Option<ReleasedStatus>[] = (
  Object.keys(releasedInfo) as ReleasedStatus[]
).map((value) => ({
  value,
  label: releasedInfo[value].label,
}));
export const releasedOptions = RELEASED_OPTIONS;

/** Review stage options for task management. */
export const DCR_REVIEW_STAGES = [
  'ImsReview',
  'DeptManagerReview',
  'DeptHeadReview',
  'MrReview',
] as const;

export const STAGE_OPTIONS: readonly Option<DcrStatus>[] = DCR_REVIEW_STAGES.map(
  (value) => ({
    value,
    label: statusInfo[value].label,
  }),
);
export const stageOptions = STAGE_OPTIONS;

/** Clause change type options (Addition, Amendment, Deletion). */
export const CLAUSE_CHANGE_TYPE_OPTIONS: readonly Option<ClauseChangeType>[] = [
  { value: 'Addition', label: 'Addition' },
  { value: 'Amendment', label: 'Amendment' },
  { value: 'Deletion', label: 'Deletion' },
];
export const clauseChangeTypeOptions = CLAUSE_CHANGE_TYPE_OPTIONS;
export const changeTypes = CLAUSE_CHANGE_TYPE_OPTIONS;
