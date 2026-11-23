import type { DcrStatus, ReleasedStatus } from '@cyient/api-client/dcr';
import type { Tone } from '@cyient/shared-ui';
import { STATUS_ACTIONS } from './status-actions';

export { STATUS_ACTIONS };

/** Status names as people know them from today's tool, and their colour. */
export const statusInfo: Record<DcrStatus, { label: string; tone: Tone }> = {
  [STATUS_ACTIONS.DRAFT]: { label: 'Draft', tone: 'neutral' },
  [STATUS_ACTIONS.IMS_REVIEW]: { label: 'IMS Review', tone: 'info' },
  [STATUS_ACTIONS.DEPT_MANAGER_REVIEW]: { label: 'Dept Manager Review', tone: 'info' },
  [STATUS_ACTIONS.DEPT_HEAD_REVIEW]: { label: 'Dept Head Review', tone: 'info' },
  [STATUS_ACTIONS.MR_REVIEW]: { label: 'MR Review', tone: 'info' },
  [STATUS_ACTIONS.APPROVED]: { label: 'Approved', tone: 'success' },
  [STATUS_ACTIONS.IMS_REJECTED]: { label: 'Rejected at IMS Review', tone: 'error' },
  [STATUS_ACTIONS.DEPT_MANAGER_REJECTED]: { label: 'Rejected by Dept Manager', tone: 'error' },
  [STATUS_ACTIONS.DEPT_HEAD_REJECTED]: { label: 'Rejected by Dept Head', tone: 'error' },
  [STATUS_ACTIONS.MR_REJECTED]: { label: 'Rejected by MR', tone: 'error' },
  [STATUS_ACTIONS.WITHDRAWN]: { label: 'Withdrawn', tone: 'neutral' },
  [STATUS_ACTIONS.CANCELLED]: { label: 'Cancelled', tone: 'warning' },
};

export const releasedInfo: Record<ReleasedStatus, { label: string; tone: Tone }> = {
  [STATUS_ACTIONS.NOT_YET_RELEASED]: { label: 'Not yet released', tone: 'neutral' },
  [STATUS_ACTIONS.RELEASED]: { label: 'Released', tone: 'success' },
};

export const isDcrStatus = (value: string | undefined): value is DcrStatus => value !== undefined && value in statusInfo;
export const isReleasedStatus = (value: string | undefined): value is ReleasedStatus => value !== undefined && value in releasedInfo;
