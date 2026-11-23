import { toastMeta } from '@cyient/shared-ui';
import type { SourcingInput } from '@cyient/api-client/mppl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mpplTags } from '@/api-callers/api-tags';
import { saveSourcing } from '@/api-callers/sourcing/sourcing.api';
import { useMpplApi } from '@/hooks/useMpplApi';

/** Adds a row (id null) or changes one; the list and the New Issue form's lookups are refreshed. */
export function useSaveSourcing() {
  const api = useMpplApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta<unknown, { id: number | null }>({ success: (_, { id }) => (id === null ? 'The sourcing master row is added.' : 'The sourcing master row is saved.'), error: 'The sourcing master row could not be saved.' }),
    mutationFn: ({ id, input }: { id: number | null; input: SourcingInput }) => saveSourcing(api, id, input),
    onSuccess: (result) => {
      queryClient.setQueryData(mpplTags.sourcing.row(result.data.id), result.data);
      void queryClient.invalidateQueries({ queryKey: mpplTags.sourcing.lists() });
      void queryClient.invalidateQueries({ queryKey: mpplTags.sourcing.lookupsAll() });
    },
  });
}
