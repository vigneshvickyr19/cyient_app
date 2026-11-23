import { isApiError } from '@cyient/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNotify } from './NotificationProvider';

/** What a mutation says about its own toast. Without any of it, a change that works says "Done." and one that fails says why. */
export interface MutationToastMeta {
  /** Shown when the API sends no confirmation of its own. A function can use the result and the variables. */
  success?: string | ((data: never, variables: never) => string);
  /** Shown when the error has no message of its own. */
  error?: string;
  /** No toast for a success, a failure, or both (a file download says nothing when it works). */
  silent?: boolean | 'success' | 'error';
  // TanStack Query wants a mutation's meta to be a Record
  [key: string]: unknown;
}

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: MutationToastMeta;
  }
}

/** Types a mutation's toast text by its result and variables: `meta: toastMeta<Result, Variables>({ success: (r, v) => ... })`. */
export function toastMeta<Data, Variables = void>(meta: {
  success?: string | ((data: Data, variables: Variables) => string);
  error?: string;
  silent?: MutationToastMeta['silent'];
}): MutationToastMeta {
  return meta;
}

/** The API's own confirmation, when the mutation returned the whole result (the data is then unwrapped, with no message). */
function apiMessage(data: unknown): string | null {
  if (typeof data === 'object' && data !== null && 'traceId' in data && 'message' in data && typeof data.message === 'string') {
    return data.message;
  }
  return null;
}

/**
 * One toast for every change an app makes (POST, PUT, DELETE...): the API's confirmation when it sent one, else the
 * mutation's own text, else "Done."; and the reason when it fails. Mutations with their own meta can say otherwise.
 */
export function MutationToasts() {
  const queryClient = useQueryClient();
  const notify = useNotify();

  useEffect(
    () =>
      queryClient.getMutationCache().subscribe((event) => {
        if (event.type !== 'updated') return;
        const { mutation, action } = event;
        const meta = mutation.meta ?? {};
        const silent = meta.silent;

        if (action.type === 'success' && silent !== true && silent !== 'success') {
          const own = typeof meta.success === 'function' ? (meta.success as (d: unknown, v: unknown) => string)(action.data, mutation.state.variables) : meta.success;
          notify.success(apiMessage(action.data) ?? own ?? 'Done.');
        }

        if (action.type === 'error' && silent !== true && silent !== 'error') {
          if (isApiError(action.error) && action.error.isConflict) notify.warning(action.error.message);
          else notify.error(action.error, meta.error);
        }
      }),
    [queryClient, notify],
  );

  return null;
}
