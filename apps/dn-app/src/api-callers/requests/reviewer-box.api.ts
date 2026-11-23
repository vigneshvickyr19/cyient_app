import { dnEndpoints } from '@/api-callers/api-endpoints';
import type { DnApi } from '@/types/api';

/** The reviewer and approver boxes of a change category, in order, the head of department last. */
export const listReviewerBoxes = async (api: DnApi, changeCategoryId: number, signal?: AbortSignal) =>
  (await api.get(dnEndpoints.reviewerBox.collection, { query: { changeCategoryId }, signal })).data;
