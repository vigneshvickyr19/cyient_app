import type { InternalComplaintStatus } from '@cyient/api-client/cc';
import type { Tone } from '@cyient/shared-ui';
import { STATUS_ACTIONS } from './status-actions';

export const internalStatusInfo: Record<InternalComplaintStatus, { label: string; tone: Tone }> = {
  [STATUS_ACTIONS.OPEN]: { label: 'Open', tone: 'info' },
  [STATUS_ACTIONS.CLOSED]: { label: 'Closed', tone: 'success' },
};

export const isInternalStatus = (value: string | undefined): value is InternalComplaintStatus => value !== undefined && value in internalStatusInfo;
