import { isApiError } from '@cyient/api-client';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useNotify } from '../notifications/NotificationProvider';

export interface ActionFailureOptions {
  /** Runs after a conflict, once the record is being read again; for example to close the dialog. */
  onConflict?: () => void;
  /** Reads again only the query at `queryKey`, not the ones under it (a record's log, its attachments...). */
  exact?: boolean;
  /** Shown for an error without a message of its own. */
  fallback?: string;
}

/**
 * Handles a failed change to a record: the error is shown, and when someone changed the record in between (409) the
 * record at `queryKey` is read again, so the page shows it as it is now. The result fits a mutation's `onError`.
 */
export function useActionFailure(queryKey: QueryKey, { onConflict, exact, fallback }: ActionFailureOptions = {}): (error: unknown) => void {
  const notify = useNotify();
  const queryClient = useQueryClient();
  return (error) => {
    notify.error(error, fallback);
    if (isApiError(error) && error.isConflict) {
      void queryClient.invalidateQueries({ queryKey, exact });
      onConflict?.();
    }
  };
}
