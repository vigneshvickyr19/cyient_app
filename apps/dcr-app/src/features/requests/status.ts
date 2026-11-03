import type { DcrStatus, ReleasedStatus } from '@cyient/api-client/dcr';
import type { Option, Tone } from '@cyient/shared-ui';

/** Status names as people know them from today's tool, and their colour. */
export const statusInfo: Record<DcrStatus, { label: string; tone: Tone }> = {
  Draft: { label: 'Draft', tone: 'neutral' },
  ImsReview: { label: 'IMS Review', tone: 'info' },
  DeptManagerReview: { label: 'Dept Manager Review', tone: 'info' },
  DeptHeadReview: { label: 'Dept Head Review', tone: 'info' },
  MrReview: { label: 'MR Review', tone: 'info' },
  Approved: { label: 'Approved', tone: 'success' },
  ImsRejected: { label: 'Rejected at IMS Review', tone: 'error' },
  DeptManagerRejected: { label: 'Rejected by Dept Manager', tone: 'error' },
  DeptHeadRejected: { label: 'Rejected by Dept Head', tone: 'error' },
  MrRejected: { label: 'Rejected by MR', tone: 'error' },
  Withdrawn: { label: 'Withdrawn', tone: 'neutral' },
  Cancelled: { label: 'Cancelled', tone: 'warning' },
};

export const releasedInfo: Record<ReleasedStatus, { label: string; tone: Tone }> = {
  NotYetReleased: { label: 'Not yet released', tone: 'neutral' },
  Released: { label: 'Released', tone: 'success' },
};

export const statusOptions: Option<DcrStatus>[] = (Object.keys(statusInfo) as DcrStatus[]).map((value) => ({
  value,
  label: statusInfo[value].label,
}));

export const releasedOptions: Option<ReleasedStatus>[] = (Object.keys(releasedInfo) as ReleasedStatus[]).map((value) => ({
  value,
  label: releasedInfo[value].label,
}));

export const isDcrStatus = (value: string | undefined): value is DcrStatus => value !== undefined && value in statusInfo;
export const isReleasedStatus = (value: string | undefined): value is ReleasedStatus => value !== undefined && value in releasedInfo;
