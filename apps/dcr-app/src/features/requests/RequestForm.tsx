import type { DraftDetails, RequestDetails } from '@cyient/api-client/dcr';
import {
  applyServerErrors,
  Button,
  Form,
  FormDatePicker,
  FormDropdown,
  FormInput,
  FormPeoplePicker,
  FormTextArea,
  InlineAlert,
  SectionCard,
  useAuth,
  useMasterOptions,
  useNotify,
  type PersonOption,
} from '@cyient/shared-ui';
import { businessToday, maxLength, notInFuture, notInPast, required } from '@cyient/shared-utils';
import { Box, Stack } from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';

/** The New Request form, as the API's draft rules have it (BRD-05 RULE-01): every field is required. */
export interface RequestFormValues {
  locationId: number | null;
  departmentId: number | null;
  documentReference: string;
  currentRevisionNo: string;
  currentRevisionDate: string | null;
  documentDescription: string;
  reasonCategoryId: number | null;
  reasonForChanges: string;
  riskToQms: string;
  riskToDevices: string;
  deptManager: PersonOption | null;
  deptHead: PersonOption | null;
  needByDate: string | null;
}

const LONG_TEXT = 4000;

function formValuesOf(request?: RequestDetails): RequestFormValues {
  const person = (ref: { id: number; name: string | null } | undefined) => (ref ? { id: ref.id, name: ref.name ?? '' } : null);
  return {
    locationId: request?.location.id ?? null,
    departmentId: request?.department.id ?? null,
    documentReference: request?.documentReference ?? '',
    currentRevisionNo: request?.currentRevisionNo ?? '',
    currentRevisionDate: request?.currentRevisionDate ?? null,
    documentDescription: request?.documentDescription ?? '',
    reasonCategoryId: request?.reasonCategory.id ?? null,
    reasonForChanges: request?.reasonForChanges ?? '',
    riskToQms: request?.riskToQms ?? '',
    riskToDevices: request?.riskToDevices ?? '',
    deptManager: person(request?.deptManager),
    deptHead: person(request?.deptHead),
    needByDate: request?.needByDate ?? null,
  };
}

function draftOf(values: RequestFormValues, version?: string): DraftDetails {
  return {
    locationId: values.locationId ?? 0,
    departmentId: values.departmentId ?? 0,
    documentReference: values.documentReference.trim(),
    currentRevisionNo: values.currentRevisionNo.trim(),
    currentRevisionDate: values.currentRevisionDate,
    documentDescription: values.documentDescription.trim(),
    reasonCategoryId: values.reasonCategoryId ?? 0,
    reasonForChanges: values.reasonForChanges.trim(),
    riskToQms: values.riskToQms.trim(),
    riskToDevices: values.riskToDevices.trim(),
    deptManagerUserId: values.deptManager?.id ?? null,
    deptHeadUserId: values.deptHead?.id ?? null,
    needByDate: values.needByDate,
    version: version ?? null,
  };
}

const serverFieldNames = { deptManagerUserId: 'deptManager', deptHeadUserId: 'deptHead' } as const;

interface RequestFormProps {
  request?: RequestDetails;
  saving: boolean;
  onSave: (draft: DraftDetails) => Promise<unknown>;
  onCancel: () => void;
}

/** The Document Request tab for a new or draft DCR. The requester picks the Dept Manager and Dept Head, as today. */
export function RequestForm({ request, saving, onSave, onCancel }: RequestFormProps) {
  const { user } = useAuth();
  const notify = useNotify();
  const form = useForm<RequestFormValues>({ defaultValues: formValuesOf(request), mode: 'onTouched' });
  const locations = useMasterOptions('Location');
  const departments = useMasterOptions('Department');
  const reasons = useMasterOptions('ReasonCategory');
  const [deptManager, deptHead] = useWatch({ control: form.control, name: ['deptManager', 'deptHead'] });

  const submit = async (values: RequestFormValues) => {
    try {
      await onSave(draftOf(values, request?.version));
    } catch (error) {
      if (!applyServerErrors(error, form, serverFieldNames)) notify.error(error, 'The request could not be saved.');
    }
  };

  return (
    <Form form={form} onSubmit={submit}>
      <Stack spacing={3}>
        <SectionCard title="Document">
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } }}>
            <FormDropdown<RequestFormValues, number> name="locationId" label="Location" options={locations} rules={required('Location')} />
            <FormDropdown<RequestFormValues, number> name="departmentId" label="Department / Function" options={departments} rules={required('Department/Function')} />
            <FormInput<RequestFormValues>
              name="documentReference"
              label="Document reference"
              rules={{ ...required('Document Reference'), ...maxLength(100, 'Document Reference') }}
            />
            <FormInput<RequestFormValues>
              name="currentRevisionNo"
              label="Current revision no"
              rules={{ ...required('Current Revision No'), ...maxLength(20, 'Current Revision No') }}
            />
            <FormDatePicker<RequestFormValues>
              name="currentRevisionDate"
              label="Current revision date"
              maxDate={businessToday()}
              rules={{ ...required('Current Revision Date'), validate: notInFuture('Current Revision Date') }}
            />
            <FormDatePicker<RequestFormValues>
              name="needByDate"
              label="Need by date"
              minDate={businessToday()}
              rules={{ ...required('Need By Date'), validate: notInPast('Need By Date') }}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <FormTextArea<RequestFormValues>
              name="documentDescription"
              label="Document description"
              rules={{ ...required('Document Description'), ...maxLength(LONG_TEXT, 'Document Description') }}
            />
          </Box>
        </SectionCard>

        <SectionCard title="Reason and risk">
          <Stack spacing={2}>
            <Box sx={{ maxWidth: { md: 'calc(100% / 3)' } }}>
              <FormDropdown<RequestFormValues, number> name="reasonCategoryId" label="Reason category" options={reasons} rules={required('Reason Category')} />
            </Box>
            <FormTextArea<RequestFormValues>
              name="reasonForChanges"
              label="Reason for changes"
              rules={{ ...required('Reason for Changes'), ...maxLength(LONG_TEXT, 'Reason for Changes') }}
            />
            <FormTextArea<RequestFormValues>
              name="riskToQms"
              label="Risk and impact on the QMS"
              rules={{ ...required('Risk and impact on the QMS'), ...maxLength(LONG_TEXT, 'Risk and impact on the QMS') }}
            />
            <FormTextArea<RequestFormValues>
              name="riskToDevices"
              label="Risk and impact on the devices"
              rules={{ ...required('Risk and impact on the devices'), ...maxLength(LONG_TEXT, 'Risk and impact on the devices') }}
            />
          </Stack>
        </SectionCard>

        <SectionCard title="Reviewers" subheader="After IMS Review, the DCR goes to these people, then to the MR.">
          <Stack spacing={2}>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
              <FormPeoplePicker<RequestFormValues>
                name="deptManager"
                label="Review by Department Manager"
                excludeIds={[user.userId]}
                rules={required('Review By Department Manager')}
              />
              <FormPeoplePicker<RequestFormValues>
                name="deptHead"
                label="Review by Department Head"
                excludeIds={[user.userId]}
                rules={required('Review By Department Head')}
              />
            </Box>
            {deptManager && deptManager.id === deptHead?.id && (
              <InlineAlert>The same person reviews at both levels and approves at each one.</InlineAlert>
            )}
          </Stack>
        </SectionCard>

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={saving}>
            {request ? 'Save changes' : 'Save draft'}
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
}
