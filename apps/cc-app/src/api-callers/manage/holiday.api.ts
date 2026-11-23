import type { HolidayInput } from '@cyient/api-client/cc';
import { ccEndpoints } from '@/api-callers/api-endpoints';
import type { CcApi } from '@/types/api';

/** The holiday calendar of one year, switched-off days included. */
export const listHolidays = async (api: CcApi, year: number, signal?: AbortSignal) =>
  (await api.get(ccEndpoints.holiday.collection, { query: { year }, signal })).data;

/** Adds a day (id null) to the holiday calendar, or changes one (holidays are switched off, never deleted). */
export const saveHoliday = (api: CcApi, id: number | null, input: HolidayInput) =>
  id === null ? api.post(ccEndpoints.holiday.collection, { body: input }) : api.put(ccEndpoints.holiday.item, { path: { id }, body: input });
