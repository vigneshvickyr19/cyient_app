import type { AdminActionInput, HolidayInput } from '@cyient/api-client/cc';
import { useNotify, type RecordHistoryTabsProps } from '@cyient/shared-ui';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCcApi } from '../../lib/api';
import { complaintKeys, type ComplaintListQuery } from '../complaints/keys';

const manageKeys = {
  all: ['cc', 'manage'] as const,
  complaints: (query: ComplaintListQuery) => [...manageKeys.all, 'complaints', query] as const,
  record: (publicId: string) => [...manageKeys.all, 'record', publicId] as const,
  holidays: () => [...manageKeys.all, 'holidays'] as const,
  holidayYear: (year: number) => [...manageKeys.holidays(), year] as const,
};

/** Every complaint, drafts included. */
export function useAdminComplaints(query: ComplaintListQuery) {
  const api = useCcApi();
  return useQuery({
    queryKey: manageKeys.complaints(query),
    queryFn: ({ signal }) => api.get('/api/v1/admin/complaints', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** The complaint's history, emails and audit trail, for its Record tabs. */
export function useComplaintRecord(publicId: string): Pick<RecordHistoryTabsProps, 'loaders' | 'queryKey'> {
  const api = useCcApi();
  const path = { publicId };
  return {
    queryKey: manageKeys.record(publicId),
    loaders: {
      history: async ({ signal }) => (await api.get('/api/v1/admin/complaints/{publicId}/history', { path, signal })).data,
      emails: ({ page, pageSize, signal }) => api.get('/api/v1/admin/complaints/{publicId}/emails', { path, query: { page, pageSize }, signal }),
      audit: ({ page, pageSize, signal }) => api.get('/api/v1/admin/complaints/{publicId}/audit', { path, query: { page, pageSize }, signal }),
    },
  };
}

/** The holiday calendar of one year, switched-off days included. */
export function useHolidays(year: number) {
  const api = useCcApi();
  return useQuery({
    queryKey: manageKeys.holidayYear(year),
    queryFn: async ({ signal }) => (await api.get('/api/v1/admin/holidays', { query: { year }, signal })).data,
  });
}

/** Cancels a complaint that is not closed; open tasks close and the initiator is emailed. */
export function useCancelComplaint(publicId: string) {
  const api = useCcApi();
  const queryClient = useQueryClient();
  const notify = useNotify();
  return useMutation({
    mutationFn: (input: AdminActionInput) => api.post('/api/v1/admin/complaints/{publicId}/cancel', { path: { publicId }, body: input }),
    onSuccess: (result) => {
      queryClient.setQueryData(complaintKeys.detail(publicId), result.data);
      void queryClient.invalidateQueries({ queryKey: manageKeys.all });
      void queryClient.invalidateQueries({ queryKey: complaintKeys.all });
      notify.success(result.message ?? 'The complaint is cancelled and the initiator is emailed.');
    },
  });
}

/** Adds a day to the holiday calendar, or changes one (holidays are switched off, never deleted). */
export function useSaveHoliday() {
  const api = useCcApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | null; input: HolidayInput }) =>
      id === null ? api.post('/api/v1/admin/holidays', { body: input }) : api.put('/api/v1/admin/holidays/{id}', { path: { id }, body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: manageKeys.holidays() }),
  });
}
