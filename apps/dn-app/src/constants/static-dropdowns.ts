import type { DnStatus } from '@cyient/api-client/dn';
import type { Option } from '@cyient/shared-ui';
import { statusInfo } from './request-status';

export type YesNo = 'yes' | 'no';

/** Yes/No options for radio groups and dropdowns. */
export const YES_NO_OPTIONS: readonly Option<YesNo>[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];
export const yesNoOptions = YES_NO_OPTIONS;

/** Status filter options for DN requests. */
export const STATUS_OPTIONS: readonly Option<DnStatus>[] = (
  Object.keys(statusInfo) as DnStatus[]
).map((value) => ({
  value,
  label: statusInfo[value].label,
}));
export const statusOptions = STATUS_OPTIONS;
