import type { InternalComplaintStatus } from '@cyient/api-client/cc';
import type { Option, Tone } from '@cyient/shared-ui';

export const internalStatusInfo: Record<InternalComplaintStatus, { label: string; tone: Tone }> = {
  Open: { label: 'Open', tone: 'info' },
  Closed: { label: 'Closed', tone: 'success' },
};

export const internalStatusOptions: Option<InternalComplaintStatus>[] = (Object.keys(internalStatusInfo) as InternalComplaintStatus[]).map((value) => ({
  value,
  label: internalStatusInfo[value].label,
}));

export const isInternalStatus = (value: string | undefined): value is InternalComplaintStatus => value !== undefined && value in internalStatusInfo;
