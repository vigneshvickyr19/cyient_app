import { StatusChip } from '../../components/display';

/** Whether a role, user or master item is in use. */
export function ActiveChip({ active }: { active: boolean }) {
  return <StatusChip label={active ? 'Active' : 'Switched off'} tone={active ? 'success' : 'neutral'} />;
}
