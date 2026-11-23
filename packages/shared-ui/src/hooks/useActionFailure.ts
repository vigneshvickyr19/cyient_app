import { isApiError } from '@cyient/api-client';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';

export interface ActionFailureOptions {
  /** Runs after a conflict, once the record is being read again; for example to close the dialog. */
  onConflict?: () => void;
  /** Reads again only the query at `queryKey`, not the ones under it (a record's log, its attachments...). */
  exact?: boolean;
}

/**
 * Handles a failed change to a record: when someone changed the record in between (409) the record at `queryKey` is
 * read again, so the page shows it as it is now. The error itself is shown by the app's mutation toasts. The result
 * fits a mutation's `onError`.
 */
export function useActionFailure(queryKey: QueryKey, { onConflict, exact }: ActionFailureOptions = {}): (error: unknown) => void {
  const queryClient = useQueryClient();
  return (error) => {
    if (isApiError(error) && error.isConflict) {
      void queryClient.invalidateQueries({ queryKey, exact });
      onConflict?.();
    }
  };
}
