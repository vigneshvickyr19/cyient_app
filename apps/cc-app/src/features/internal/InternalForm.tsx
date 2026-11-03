import type { InternalDetails, InternalInput } from '@cyient/api-client/cc';
import {
  applyServerErrors,
  Button,
  Form,
  FormDatePicker,
  FormDropdown,
  FormInput,
  FormTextArea,
  SectionCard,
  useMasterOptions,
  useNotify,
} from '@cyient/shared-ui';
import { businessToday, maxLength, numberOrNull, required, textOrNull } from '@cyient/shared-utils';
import { Box, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { masterTypes } from '../../lib/masters';
import { notAfterToday, zeroOrMore } from '../../lib/rules';

/** An internal complaint as the API's input has it: the customer and the problem description are required. */
interface InternalFormValues {
  customerId: number | null;
  complaintDate: string | null;
  locationId: number | null;
  internalPartNo: string;
  partDescription: string;
  rejectedQuantity: string;
  detectionStageId: number | null;
  problemDescription: string;
}

function formValuesOf(complaint?: InternalDetails): InternalFormValues {
  return {
    customerId: complaint?.customer.id ?? null,
    complaintDate: complaint?.complaintDate ?? businessToday(),
    locationId: complaint?.location?.id ?? null,
    internalPartNo: complaint?.internalPartNo ?? '',
    partDescription: complaint?.partDescription ?? '',
    rejectedQuantity: complaint?.rejectedQuantity === null || complaint?.rejectedQuantity === undefined ? '' : String(complaint.rejectedQuantity),
    detectionStageId: complaint?.detectionStage?.id ?? null,
    problemDescription: complaint?.problemDescription ?? '',
  };
}

function inputOf(values: InternalFormValues, version?: string): InternalInput {
  return {
    customerId: values.customerId ?? 0,
    complaintDate: values.complaintDate,
    locationId: values.locationId,
    internalPartNo: textOrNull(values.internalPartNo),
    partDescription: textOrNull(values.partDescription),
    rejectedQuantity: numberOrNull(values.rejectedQuantity),
    detectionStageId: values.detectionStageId,
    problemDescription: textOrNull(values.problemDescription),
    version: version ?? null,
  };
}

interface InternalFormProps {
  complaint?: InternalDetails;
  saving: boolean;
  onSave: (input: InternalInput) => Promise<unknown>;
  onCancel: () => void;
}

/** Records or changes an internal complaint (an in-house rejection). */
export function InternalForm({ complaint, saving, onSave, onCancel }: InternalFormProps) {
  const notify = useNotify();
  const form = useForm<InternalFormValues>({ defaultValues: formValuesOf(complaint), mode: 'onTouched' });
  const customers = useMasterOptions(masterTypes.customer);
  const locations = useMasterOptions(masterTypes.location);
  const stages = useMasterOptions(masterTypes.detectionStage);

  const submit = async (values: InternalFormValues) => {
    try {
      await onSave(inputOf(values, complaint?.version));
    } catch (error) {
      if (!applyServerErrors(error, form)) notify.error(error, 'The internal complaint could not be saved.');
    }
  };

  return (
    <Form form={form} onSubmit={submit}>
      <Stack spacing={3}>
        <SectionCard title="Internal complaint" subheader="The customer is required also for a rejection found in-house.">
          <Stack spacing={2}>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } }}>
              <FormDropdown<InternalFormValues, number> name="customerId" label="Customer" options={customers} rules={required('Customer')} />
              <FormDatePicker<InternalFormValues>
                name="complaintDate"
                label="Complaint date"
                maxDate={businessToday()}
                rules={{ validate: notAfterToday("Complaint date can't be in the future.") }}
              />
              <FormDropdown<InternalFormValues, number> name="locationId" label="Location" options={locations} emptyLabel="Not given" />
              <FormInput<InternalFormValues> name="internalPartNo" label="Internal part no" rules={maxLength(100, 'Internal part no')} />
              <FormInput<InternalFormValues> name="rejectedQuantity" label="Rejected quantity" type="number" rules={{ validate: zeroOrMore('Rejected quantity') }} />
              <FormDropdown<InternalFormValues, number> name="detectionStageId" label="Detection stage" options={stages} emptyLabel="Not given" />
            </Box>
            <FormTextArea<InternalFormValues> name="partDescription" label="Part description" minRows={2} rules={maxLength(500, 'Part description')} />
            <FormTextArea<InternalFormValues>
              name="problemDescription"
              label="Problem description"
              helperText="What was rejected and why"
              rules={{
                required: 'Problem description is required.',
                validate: (value) => (typeof value === 'string' && value.trim() !== '') || 'Problem description is required.',
                ...maxLength(4000, 'Problem description'),
              }}
            />
          </Stack>
        </SectionCard>

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={saving}>
            {complaint ? 'Save changes' : 'Record complaint'}
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
}
