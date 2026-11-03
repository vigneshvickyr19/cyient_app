import type { ComplaintDetails, ComplaintInput, EarlierComplaint } from '@cyient/api-client/cc';
import {
  applyServerErrors,
  Button,
  Form,
  FormCheckbox,
  FormDatePicker,
  FormDropdown,
  FormInput,
  FormPeopleList,
  FormRadioGroup,
  FormTextArea,
  SectionCard,
  useAuth,
  useMasterOptions,
  useNotify,
  type Option,
  type PersonOption,
} from '@cyient/shared-ui';
import { businessToday, formatDate, maxLength, numberOrNull, required, textOrNull } from '@cyient/shared-utils';
import { Box, Stack } from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';
import { masterTypes } from '../../lib/masters';
import { notAfterToday, zeroOrMore } from '../../lib/rules';
import { useEarlierComplaints } from './queries';

type YesNo = 'yes' | 'no';

/** The first page (D1 to D3), as the API's input has it: only the customer is required (BR-07). */
interface ComplaintFormValues {
  customerId: number | null;
  complaintDate: string | null;
  reportedDate: string | null;
  customerReference: string;
  modeOfCommunicationId: number | null;
  sourceId: number | null;
  customerContact: string;
  acknowledgementDate: string | null;
  locationId: number | null;
  complaintDescription: string;
  isCritical: boolean;
  isRepeat: boolean;
  repeatOfPublicId: string | null;
  internalPartNo: string;
  customerPartNo: string;
  revision: string;
  batch: string;
  partDescription: string;
  quantityShipped: string;
  rejectedQuantity: string;
  serialNumbers: string;
  processCategoryId: number | null;
  detectionStageId: number | null;
  problemDescription: string;
  required: YesNo | null;
  requiredJustification: string;
  teamMembers: PersonOption[];
}

const LONG_TEXT = 4000;
const MAX_MEMBERS = 50;

const yesNo: Option<YesNo>[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

function formValuesOf(complaint?: ComplaintDetails): ComplaintFormValues {
  const text = (value: string | null | undefined) => value ?? '';
  const count = (value: number | null | undefined) => (value === null || value === undefined ? '' : String(value));
  return {
    customerId: complaint?.customer.id ?? null,
    complaintDate: complaint?.complaintDate ?? businessToday(),
    reportedDate: complaint?.reportedDate ?? null,
    customerReference: text(complaint?.customerReference),
    modeOfCommunicationId: complaint?.modeOfCommunication?.id ?? null,
    sourceId: complaint?.source?.id ?? null,
    customerContact: text(complaint?.customerContact),
    acknowledgementDate: complaint?.acknowledgementDate ?? null,
    locationId: complaint?.location?.id ?? null,
    complaintDescription: text(complaint?.complaintDescription),
    isCritical: complaint?.isCritical ?? false,
    isRepeat: complaint?.isRepeat ?? false,
    repeatOfPublicId: complaint?.repeatOf?.publicId ?? null,
    internalPartNo: text(complaint?.internalPartNo),
    customerPartNo: text(complaint?.customerPartNo),
    revision: text(complaint?.revision),
    batch: text(complaint?.batch),
    partDescription: text(complaint?.partDescription),
    quantityShipped: count(complaint?.quantityShipped),
    rejectedQuantity: count(complaint?.rejectedQuantity),
    serialNumbers: text(complaint?.serialNumbers),
    processCategoryId: complaint?.processCategory?.id ?? null,
    detectionStageId: complaint?.detectionStage?.id ?? null,
    problemDescription: text(complaint?.problemDescription),
    required: complaint?.required === true ? 'yes' : complaint?.required === false ? 'no' : null,
    requiredJustification: text(complaint?.requiredJustification),
    teamMembers: (complaint?.teamMembers ?? []).map((member) => ({ id: member.userId, name: member.name ?? '', detail: member.designation })),
  };
}

function inputOf(values: ComplaintFormValues, version?: string): ComplaintInput {
  return {
    customerId: values.customerId ?? 0,
    complaintDate: values.complaintDate,
    reportedDate: values.reportedDate,
    customerReference: textOrNull(values.customerReference),
    modeOfCommunicationId: values.modeOfCommunicationId,
    sourceId: values.sourceId,
    internalPartNo: textOrNull(values.internalPartNo),
    partDescription: textOrNull(values.partDescription),
    rejectedQuantity: numberOrNull(values.rejectedQuantity),
    complaintDescription: textOrNull(values.complaintDescription),
    processCategoryId: values.processCategoryId,
    detectionStageId: values.detectionStageId,
    acknowledgementDate: values.acknowledgementDate,
    isRepeat: values.isRepeat,
    repeatOfPublicId: values.isRepeat ? values.repeatOfPublicId : null,
    customerPartNo: textOrNull(values.customerPartNo),
    revision: textOrNull(values.revision),
    batch: textOrNull(values.batch),
    quantityShipped: numberOrNull(values.quantityShipped),
    serialNumbers: textOrNull(values.serialNumbers),
    isCritical: values.isCritical,
    customerContact: textOrNull(values.customerContact),
    problemDescription: textOrNull(values.problemDescription),
    locationId: values.locationId,
    required: values.required === null ? null : values.required === 'yes',
    requiredJustification: values.required === 'no' ? textOrNull(values.requiredJustification) : null,
    teamMemberUserIds: values.teamMembers.map((member) => member.id),
    version: version ?? null,
  };
}

const serverFieldNames = { teamMemberUserIds: 'teamMembers' } as const;

const earlierLabel = (earlier: EarlierComplaint) =>
  [earlier.complaintNo, formatDate(earlier.complaintDate), earlier.complaintDescription].filter(Boolean).join(' · ');

interface ComplaintFormProps {
  complaint?: ComplaintDetails;
  saving: boolean;
  onSave: (input: ComplaintInput) => Promise<unknown>;
  onCancel: () => void;
}

/** The first page of an external complaint (D1 to D3) for a new complaint, or for the initiator to correct it. */
export function ComplaintForm({ complaint, saving, onSave, onCancel }: ComplaintFormProps) {
  const { user } = useAuth();
  const notify = useNotify();
  const form = useForm<ComplaintFormValues>({ defaultValues: formValuesOf(complaint), mode: 'onTouched' });
  const customers = useMasterOptions(masterTypes.customer);
  const modes = useMasterOptions(masterTypes.modeOfCommunication);
  const sources = useMasterOptions(masterTypes.source);
  const categories = useMasterOptions(masterTypes.processCategory);
  const stages = useMasterOptions(masterTypes.detectionStage);
  const locations = useMasterOptions(masterTypes.location);
  const [customerId, isRepeat, answer] = useWatch({ control: form.control, name: ['customerId', 'isRepeat', 'required'] });
  const earlier = useEarlierComplaints(customerId, complaint?.publicId, isRepeat);
  const current = complaint?.repeatOf ? [complaint.repeatOf] : [];
  const earlierOptions: Option<string>[] = [...(earlier.data ?? []), ...current.filter((c) => !earlier.data?.some((e) => e.publicId === c.publicId))].map(
    (item) => ({ value: item.publicId, label: earlierLabel(item) }),
  );
  const today = businessToday();

  const submit = async (values: ComplaintFormValues) => {
    try {
      await onSave(inputOf(values, complaint?.version));
    } catch (error) {
      if (!applyServerErrors(error, form, serverFieldNames)) notify.error(error, 'The complaint could not be saved.');
    }
  };

  const grid = { display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } } as const;

  return (
    <Form form={form} onSubmit={submit}>
      <Stack spacing={3}>
        <SectionCard title="Customer and complaint" subheader="Only the customer is required.">
          <Stack spacing={2}>
            <Box sx={grid}>
              <FormDropdown<ComplaintFormValues, number> name="customerId" label="Customer" options={customers} rules={required('Customer')} />
              <FormDatePicker<ComplaintFormValues>
                name="complaintDate"
                label="Complaint date"
                maxDate={today}
                rules={{ validate: notAfterToday("Complaint date can't be in the future.") }}
              />
              <FormDatePicker<ComplaintFormValues>
                name="reportedDate"
                label="Reported date"
                maxDate={today}
                helperText="When the customer reported it, if different"
                rules={{ validate: notAfterToday("Reported date can't be in the future.") }}
              />
              <FormInput<ComplaintFormValues> name="customerReference" label="Customer reference" rules={maxLength(100, 'Customer reference')} />
              <FormDropdown<ComplaintFormValues, number> name="modeOfCommunicationId" label="Mode of communication" options={modes} emptyLabel="Not given" />
              <FormDropdown<ComplaintFormValues, number> name="sourceId" label="Source of complaint" options={sources} emptyLabel="Not given" />
              <FormInput<ComplaintFormValues> name="customerContact" label="Customer contact" rules={maxLength(200, 'Customer contact')} />
              <FormDatePicker<ComplaintFormValues> name="acknowledgementDate" label="Acknowledgement date" />
              <FormDropdown<ComplaintFormValues, number> name="locationId" label="Location" options={locations} emptyLabel="Not given" />
            </Box>
            <FormTextArea<ComplaintFormValues> name="complaintDescription" label="Complaint description" rules={maxLength(LONG_TEXT, 'Complaint description')} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormCheckbox<ComplaintFormValues> name="isCritical" label="Critical complaint" />
              <FormCheckbox<ComplaintFormValues> name="isRepeat" label="Repeat of an earlier complaint of this customer" />
            </Stack>
            {isRepeat && (
              <Box sx={{ maxWidth: { md: 'calc(200% / 3)' } }}>
                <FormDropdown<ComplaintFormValues, string>
                  name="repeatOfPublicId"
                  label="Earlier complaint"
                  options={earlierOptions}
                  emptyLabel="Not chosen yet"
                  disabled={customerId === null}
                  helperText={
                    customerId === null
                      ? 'Choose the customer first.'
                      : earlier.isSuccess && earlier.data.length === 0
                        ? 'This customer has no published complaints.'
                        : 'Needed to publish a repeat complaint.'
                  }
                  rules={{
                    validate: (value) =>
                      value === null || !earlier.data || earlier.data.some((e) => e.publicId === value) || 'Choose an earlier complaint of the same customer.',
                  }}
                />
              </Box>
            )}
          </Stack>
        </SectionCard>

        <SectionCard title="Part">
          <Stack spacing={2}>
            <Box sx={grid}>
              <FormInput<ComplaintFormValues> name="internalPartNo" label="Internal part no" rules={maxLength(100, 'Internal part no')} />
              <FormInput<ComplaintFormValues> name="customerPartNo" label="Customer part no" rules={maxLength(100, 'Customer part no')} />
              <FormInput<ComplaintFormValues> name="revision" label="Revision" rules={maxLength(20, 'Revision')} />
              <FormInput<ComplaintFormValues> name="batch" label="Batch" rules={maxLength(100, 'Batch')} />
              <FormInput<ComplaintFormValues> name="quantityShipped" label="Quantity shipped" type="number" rules={{ validate: zeroOrMore('Quantity shipped') }} />
              <FormInput<ComplaintFormValues> name="rejectedQuantity" label="Rejected quantity" type="number" rules={{ validate: zeroOrMore('Rejected quantity') }} />
              <FormDropdown<ComplaintFormValues, number> name="processCategoryId" label="Process / category" options={categories} emptyLabel="Not given" />
              <FormDropdown<ComplaintFormValues, number> name="detectionStageId" label="Detection stage" options={stages} emptyLabel="Not given" />
            </Box>
            <FormTextArea<ComplaintFormValues> name="partDescription" label="Part description" minRows={2} rules={maxLength(500, 'Part description')} />
            <FormTextArea<ComplaintFormValues> name="serialNumbers" label="Serial numbers" minRows={2} rules={maxLength(LONG_TEXT, 'Serial numbers')} />
          </Stack>
        </SectionCard>

        <SectionCard title="D2 Problem description">
          <Stack spacing={2}>
            <FormTextArea<ComplaintFormValues> name="problemDescription" label="Problem description" rules={maxLength(LONG_TEXT, 'Problem description')} />
            <FormRadioGroup<ComplaintFormValues, YesNo> name="required" label="Required" options={yesNo} helperText="When the answer is No, give the justification." />
            {answer === 'no' && (
              <FormTextArea<ComplaintFormValues>
                name="requiredJustification"
                label="Justification"
                rules={{
                  ...maxLength(LONG_TEXT, 'Justification'),
                  validate: (value, values) => values.required !== 'no' || (typeof value === 'string' && value.trim() !== '') || 'A justification is required when the answer is No.',
                }}
              />
            )}
          </Stack>
        </SectionCard>

        <SectionCard title="D1 Team" subheader="The initiator and these people work on the 8D steps; each is emailed when the complaint is published.">
          <FormPeopleList<ComplaintFormValues>
            name="teamMembers"
            label="Add a team member"
            listLabel="Team members"
            excludeIds={[complaint?.initiator.id ?? user.userId]}
            max={MAX_MEMBERS}
            maxMessage={`A team can have at most ${MAX_MEMBERS} members.`}
            emptyText="No team members yet."
            helperText="At least one team member is needed to publish."
          />
        </SectionCard>

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={saving}>
            {complaint ? 'Save changes' : 'Save draft'}
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
}
