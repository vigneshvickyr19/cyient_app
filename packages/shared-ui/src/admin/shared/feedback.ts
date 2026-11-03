import { isApiError } from '@cyient/api-client';
import { useNotify } from '../../notifications/NotificationProvider';

export const CONFLICT_MESSAGE = 'Someone else saved a change after you opened this page. Reload to see their change, then make yours again.';

/** Whether a failed save was refused because someone saved in between (409). */
export function isConflict(error: unknown): boolean {
  return isApiError(error) && error.isConflict;
}

/** Shows why a change failed; a 409 tells the user to reload. */
export function useChangeFailed(): (error: unknown, fallback: string) => void {
  const notify = useNotify();
  return (error, fallback) => {
    if (isConflict(error)) notify.warning(CONFLICT_MESSAGE);
    else notify.error(error, fallback);
  };
}
