import type { AdminActionInput, HolidayInput } from '@cyient/api-client/cc';
import { type RecordHistoryTabsProps, toastMeta } from '@cyient/shared-ui';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelComplaint,
  getComplaintHistory,
  listAdminComplaints,
  listComplaintAudit,
  listComplaintEmails,
} from '@/api-callers/manage/admin-complaint.api';
import { ccTags } from '@/api-callers/api-tags';
import { listHolidays, saveHoliday } from '@/api-callers/manage/holiday.api';
import { useCcApi } from '@/hooks/useCcApi';
import type { ComplaintListQuery } from '@/types/complaints';

/** Every complaint, drafts included. */
export function useAdminComplaints(query: ComplaintListQuery) {
  const api = useCcApi();
  return useQuery({
    queryKey: ccTags.manage.complaints(query),
    queryFn: ({ signal }) => listAdminComplaints(api, query, signal),
    placeholderData: keepPreviousData,
  });
}

/** The complaint's history, emails and audit trail, for its Record tabs. */
export function useComplaintRecord(publicId: string): Pick<RecordHistoryTabsProps, 'loaders' | 'queryKey'> {
  const api = useCcApi();
  return {
    queryKey: ccTags.manage.record(publicId),
    loaders: {
      history: ({ signal }) => getComplaintHistory(api, publicId, signal),
      emails: ({ page, pageSize, signal }) => listComplaintEmails(api, publicId, page, pageSize, signal),
      audit: ({ page, pageSize, signal }) => listComplaintAudit(api, publicId, page, pageSize, signal),
    },
  };
}

/** The holiday calendar of one year, switched-off days included. */
export function useHolidays(year: number) {
  const api = useCcApi();
  return useQuery({
    queryKey: ccTags.manage.holidayYear(year),
    queryFn: ({ signal }) => listHolidays(api, year, signal),
  });
}

/** Cancels a complaint that is not closed; open tasks close and the initiator is emailed. */
export function useCancelComplaint(publicId: string) {
  const api = useCcApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta({ success: 'The complaint is cancelled and the initiator is emailed.' }),
    mutationFn: (input: AdminActionInput) => cancelComplaint(api, publicId, input),
    onSuccess: (result) => {
      queryClient.setQueryData(ccTags.complaint.detail(publicId), result.data);
      void queryClient.invalidateQueries({ queryKey: ccTags.manage.all });
      void queryClient.invalidateQueries({ queryKey: ccTags.complaint.all });
    },
  });
}

/** Adds a day to the holiday calendar, or changes one (holidays are switched off, never deleted). */
export function useSaveHoliday() {
  const api = useCcApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta<unknown, { id: number | null }>({ success: (_, { id }) => (id === null ? 'Holiday added.' : 'Holiday changed.') }),
    mutationFn: ({ id, input }: { id: number | null; input: HolidayInput }) => saveHoliday(api, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ccTags.manage.holidays() }),
  });
}
