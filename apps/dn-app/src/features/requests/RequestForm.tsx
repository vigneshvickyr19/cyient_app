import { isApiError } from '@cyient/api-client';
import type { BoxAssignment, DraftDetails, RequestDetails, ReviewerBox } from '@cyient/api-client/dn';
import {
  applyServerErrors,
  Button,
  DetailList,
  ErrorState,
  errorMessage,
  Form,
  FormDropdown,
  FormInput,
  FormPeopleList,
  FormPeoplePicker,
  FormTextArea,
  InlineAlert,
  SectionCard,
  SectionSkeleton,
  useAuth,
  useMasterOptions,
  useNotify,
  type PersonOption,
} from '@cyient/shared-ui';
import { formatDate, maxLength, required } from '@cyient/shared-utils';
import { Box, Stack, Typography } from '@mui/material';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { useReviewerBoxes } from './queries';
import { MAX_INFORMED } from './status';

/** The Deviation Request and Reviewers tabs, as the API's draft rules have them (BRD-03 section 5): every field is required. */
export interface RequestFormValues {
  initiatorDepartmentId: number | null;
  workOrderNo: string;
  lineCellEquipmentNo: string;
  customerId: number | null;
  productFgNumber: string;
  unitId: number | null;
  deviationQuantity: string;
  changeCategoryId: number | null;
  prescribedProcess: string;
  processChangeRequired: string;
  reasonForChange: string;
  preventiveAction: string;
  /** The person in each box, by boxKey(box id). */
  reviewers: Record<string, PersonOption | null>;
  informed: PersonOption[];
}

const LONG_TEXT = 4000;

/** Form field keys of the boxes; not plain numbers, which React Hook Form would read as array positions. */
const boxKey = (boxId: number) => `box${boxId}`;

const person = (ref: { id: number; name: string | null }): PersonOption => ({ id: ref.id, name: ref.name ?? '' });

function formValuesOf(request?: RequestDetails): RequestFormValues {
  const reviewers: Record<string, PersonOption | null> = {};
  for (const reviewer of request?.reviewers ?? []) {
    if (reviewer.boxId !== null) reviewers[boxKey(reviewer.boxId)] = person(reviewer.user);
  }
  return {
    initiatorDepartmentId: request?.initiatorDepartment.id ?? null,
    workOrderNo: request?.workOrderNo ?? '',
    lineCellEquipmentNo: request?.lineCellEquipmentNo ?? '',
    customerId: request?.customer.id ?? null,
    productFgNumber: request?.productFgNumber ?? '',
    unitId: request?.unit.id ?? null,
    deviationQuantity: request ? String(request.deviationQuantity) : '',
    changeCategoryId: request?.changeCategory.id ?? null,
    prescribedProcess: request?.prescribedProcess ?? '',
    processChangeRequired: request?.processChangeRequired ?? '',
    reasonForChange: request?.reasonForChange ?? '',
    preventiveAction: request?.preventiveAction ?? '',
    reviewers,
    informed: (request?.informedPeople ?? []).map(person),
  };
}

/** Only the boxes of the chosen category are sent; a box left empty is skipped (a draft may leave boxes empty). */
function assignmentsOf(values: RequestFormValues, boxes: readonly ReviewerBox[]): BoxAssignment[] {
  return boxes.flatMap((box) => {
    const chosen = values.reviewers[boxKey(box.id)];
    return chosen ? [{ boxId: box.id, userId: chosen.id }] : [];
  });
}

function draftOf(values: RequestFormValues, reviewers: BoxAssignment[], version?: string): DraftDetails {
  return {
    initiatorDepartmentId: values.initiatorDepartmentId ?? 0,
    workOrderNo: values.workOrderNo.trim(),
    lineCellEquipmentNo: values.lineCellEquipmentNo.trim(),
    customerId: values.customerId ?? 0,
    productFgNumber: values.productFgNumber.trim(),
    unitId: values.unitId ?? 0,
    deviationQuantity: Number(values.deviationQuantity),
    changeCategoryId: values.changeCategoryId ?? 0,
    prescribedProcess: values.prescribedProcess.trim(),
    processChangeRequired: values.processChangeRequired.trim(),
    reasonForChange: values.reasonForChange.trim(),
    preventiveAction: values.preventiveAction.trim(),
    reviewers,
    informedUserIds: values.informed.map((chosen) => chosen.id),
    version: version ?? null,
  };
}

/**
 * Shows the API's field errors on the form: reviewers[i] and informedUserIds[i] point into the lists sent, so they are
 * placed on that box and on the people to be informed; the rest by name.
 */
function applyDraftErrors(error: unknown, form: UseFormReturn<RequestFormValues>, sent: readonly BoxAssignment[]): boolean {
  let placed = false;
  if (isApiError(error)) {
    for (const [field, message] of Object.entries(error.fieldErrors())) {
      const index = /^reviewers\[(\d+)\]/i.exec(field)?.[1];
      const boxId = index === undefined ? undefined : sent[Number(index)]?.boxId;
      if (boxId !== undefined) {
        form.setError(`reviewers.${boxKey(boxId)}`, { type: 'server', message });
        placed = true;
      } else if (/^informedUserIds/i.test(field)) {
        form.setError('informed', { type: 'server', message });
        placed = true;
      }
    }
  }
  const named = applyServerErrors(error, form);
  return placed || named;
}

const quantityRule = (value: unknown) =>
  typeof value !== 'string' || value.trim() === '' || (Number.isInteger(Number(value)) && Number(value) >= 1) || 'Deviation Quantity must be at least 1.';

function ReviewerBoxFields({ changeCategoryId, initiatorId }: { changeCategoryId: number | null; initiatorId: number }) {
  const boxes = useReviewerBoxes(changeCategoryId);

  if (changeCategoryId === null) {
    return <Typography color="text.secondary">Choose the change category to see its reviewer and approver boxes.</Typography>;
  }
  if (boxes.isPending) return <SectionSkeleton />;
  if (boxes.isError) return <ErrorState message={errorMessage(boxes.error)} onRetry={() => void boxes.refetch()} />;
  if (boxes.data.length === 0) {
    return (
      <InlineAlert severity="warning" title="No reviewers set up">
        The reviewers of this change category are not set up yet. You can save the draft, but ask IT to add them before you submit it.
      </InlineAlert>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
      {[...boxes.data]
        .sort((a, b) => a.sequence - b.sequence)
        .map((box) => (
          <FormPeoplePicker<RequestFormValues>
            key={box.id}
            name={`reviewers.${boxKey(box.id)}`}
            label={box.name}
            excludeIds={[initiatorId]}
            helperText={
              box.isHeadOfDepartment
                ? 'Head of department: approves last. Needed before you submit.'
                : box.isMandatory
                  ? 'Needed before you submit.'
                  : 'Optional: an empty box is skipped.'
            }
          />
        ))}
    </Box>
  );
}

interface RequestFormProps {
  request?: RequestDetails;
  saving: boolean;
  onSave: (draft: DraftDetails) => Promise<unknown>;
  onCancel: () => void;
}

/** The Deviation Request and Reviewers tabs of a new or draft deviation. The initiator, designation and date come from the API. */
export function RequestForm({ request, saving, onSave, onCancel }: RequestFormProps) {
  const { user } = useAuth();
  const notify = useNotify();
  const form = useForm<RequestFormValues>({ defaultValues: formValuesOf(request), mode: 'onTouched' });
  const departments = useMasterOptions('Department');
  const customers = useMasterOptions('Customer');
  const units = useMasterOptions('Unit');
  const categories = useMasterOptions('ChangeCategory');
  const changeCategoryId = useWatch({ control: form.control, name: 'changeCategoryId' });
  const boxes = useReviewerBoxes(changeCategoryId);

  const submit = async (values: RequestFormValues) => {
    const reviewers = assignmentsOf(values, boxes.data ?? []);
    try {
      await onSave(draftOf(values, reviewers, request?.version));
    } catch (error) {
      if (!applyDraftErrors(error, form, reviewers)) notify.error(error, 'The deviation could not be saved.');
    }
  };

  return (
    <Form form={form} onSubmit={submit}>
      <Stack spacing={3}>
        <SectionCard title="Deviation request">
          <Stack spacing={2}>
            {request ? (
              <DetailList
                items={[
                  { label: 'Initiated by', value: request.initiator.name },
                  { label: 'Designation', value: request.designation },
                  { label: 'Date', value: formatDate(request.requestDate) },
                ]}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Initiated by {user.displayName}. Your designation and today&apos;s date are filled in when you save.
              </Typography>
            )}
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } }}>
              <FormDropdown<RequestFormValues, number>
                name="initiatorDepartmentId"
                label="Initiator department"
                options={departments}
                rules={required('Initiator Department')}
              />
              <FormInput<RequestFormValues> name="workOrderNo" label="W.O no" rules={{ ...required('W.O No'), ...maxLength(50, 'W.O No') }} />
              <FormInput<RequestFormValues>
                name="lineCellEquipmentNo"
                label="Line no / cell no / equipment no"
                rules={{ ...required('Line No. / Cell No / Equip No'), ...maxLength(100, 'Line No. / Cell No / Equip No') }}
              />
              <FormDropdown<RequestFormValues, number> name="customerId" label="Customer" options={customers} rules={required('Customer')} />
              <FormInput<RequestFormValues>
                name="productFgNumber"
                label="Product FG number"
                rules={{ ...required('Product FG Number'), ...maxLength(100, 'Product FG Number') }}
              />
              <FormDropdown<RequestFormValues, number> name="unitId" label="Unit number" options={units} rules={required('Unit Number')} />
              <FormInput<RequestFormValues>
                name="deviationQuantity"
                label="Deviation quantity"
                type="number"
                rules={{ ...required('Deviation Quantity'), validate: quantityRule }}
              />
              <FormDropdown<RequestFormValues, number>
                name="changeCategoryId"
                label="Change category"
                options={categories}
                rules={required('Change Category')}
                helperText="Decides who reviews the deviation."
              />
            </Box>
          </Stack>
        </SectionCard>

        <SectionCard title="Deviation details">
          <Stack spacing={2}>
            <FormTextArea<RequestFormValues>
              name="prescribedProcess"
              label="Prescribed / defined process"
              rules={{ ...required('Prescribed / defined Process'), ...maxLength(LONG_TEXT, 'Prescribed / defined Process') }}
            />
            <FormTextArea<RequestFormValues>
              name="processChangeRequired"
              label="Process change required"
              rules={{ ...required('Process Change required'), ...maxLength(LONG_TEXT, 'Process Change required') }}
            />
            <FormTextArea<RequestFormValues>
              name="reasonForChange"
              label="Reason for change"
              rules={{ ...required('Reason for Change'), ...maxLength(LONG_TEXT, 'Reason for Change') }}
            />
            <FormTextArea<RequestFormValues>
              name="preventiveAction"
              label="Action taken to prevent re-occurrence"
              rules={{ ...required('Action taken to prevent Re-occurrence'), ...maxLength(LONG_TEXT, 'Action taken to prevent Re-occurrence') }}
            />
          </Stack>
        </SectionCard>

        <SectionCard title="Reviewers" subheader="Your reporting manager reviews it first, then the people below in this order.">
          <ReviewerBoxFields changeCategoryId={changeCategoryId} initiatorId={user.userId} />
        </SectionCard>

        <SectionCard title="People to be informed" subheader="They are emailed when the deviation is approved.">
          <FormPeopleList<RequestFormValues>
            name="informed"
            label="Add a person"
            listLabel="People to be informed"
            excludeIds={[user.userId]}
            max={MAX_INFORMED}
            maxMessage={`At most ${MAX_INFORMED} people can be informed.`}
          />
        </SectionCard>

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          {/* Waits for the category's boxes, so their people are sent */}
          <Button type="submit" variant="contained" loading={saving} disabled={saving || boxes.isFetching}>
            {request ? 'Save changes' : 'Save draft'}
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
}
