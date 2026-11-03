import type { SourcingInput } from '@cyient/api-client/mppl';
import { useNotify } from '@cyient/shared-ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMpplApi } from '../../lib/api';
import { sourcingKeys } from './keys';

/** Adds a row (id null) or changes one; the list and the New Issue form's lookups are refreshed. */
export function useSaveSourcing() {
  const api = useMpplApi();
  const notify = useNotify();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | null; input: SourcingInput }) =>
      id === null ? api.post('/api/v1/admin/sourcing', { body: input }) : api.put('/api/v1/admin/sourcing/{id}', { path: { id }, body: input }),
    onSuccess: (result, { id }) => {
      queryClient.setQueryData(sourcingKeys.row(result.data.id), result.data);
      void queryClient.invalidateQueries({ queryKey: sourcingKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: [...sourcingKeys.all, 'lookup'] });
      notify.success(result.message ?? (id === null ? 'The sourcing master row is added.' : 'The sourcing master row is saved.'));
    },
  });
}
