import type { ReviewerBoxInput } from '@cyient/api-client/dn';
import { dnEndpoints } from '@/api-callers/api-endpoints';
import type { DnApi } from '@/types/api';

/** A change category's boxes, switched-off ones included, for IT's maintenance. */
export const listAdminReviewerBoxes = async (api: DnApi, changeCategoryId: number | null, signal?: AbortSignal) =>
  (await api.get(dnEndpoints.adminReviewerBox.collection, { query: { changeCategoryId: changeCategoryId ?? undefined }, signal })).data;

/** Adds a box (id null) or changes one. */
export const saveReviewerBox = (api: DnApi, id: number | null, input: ReviewerBoxInput) =>
  id === null ? api.post(dnEndpoints.adminReviewerBox.collection, { body: input }) : api.put(dnEndpoints.adminReviewerBox.item, { path: { id }, body: input });
