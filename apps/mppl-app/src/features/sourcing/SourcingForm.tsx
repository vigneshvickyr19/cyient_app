import { isApiError } from '@cyient/api-client';
import type { NamedRef, SourcingDetails, SourcingInput } from '@cyient/api-client/mppl';
import {
  applyServerErrors,
  Button,
  ErrorState,
  errorMessage,
  Form,
  FormCheckbox,
  FormDropdown,
  FormInput,
  FormPeoplePicker,
  Modal,
  SectionSkeleton,
  useMasterOptions,
  useNotify,
  type PersonOption,
} from '@cyient/shared-ui';
import { maxLength, required } from '@cyient/shared-utils';
import { Box, Stack, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { sourcingKeys } from './keys';
import { useSaveSourcing } from './mutations';
import { useSourcingRow } from './queries';

/** A sourcing master row, as the API's SourcingMasterHandlers check it. */
interface SourcingFormValues {
  projectId: number | null;
  commodityId: number | null;
  customerName: string;
  customerGroup: string;
  segment: string;
  sourcingLead: PersonOption | null;
  escalation1: PersonOption | null;
  escalation2: PersonOption | null;
  escalation3: PersonOption | null;
  productEngineer: PersonOption | null;
  processEngineer: PersonOption | null;
  isActive: boolean;
}

const person = (ref: NamedRef | null | undefined): PersonOption | null => (ref ? { id: ref.id, name: ref.name ?? '' } : null);

function formValuesOf(row?: SourcingDetails): SourcingFormValues {
  return {
    projectId: row?.project.id ?? null,
    commodityId: row?.commodity?.id ?? null,
    customerName: row?.customerName ?? '',
    customerGroup: row?.customerGroup ?? '',
    segment: row?.segment ?? '',
    sourcingLead: person(row?.sourcingLead),
    escalation1: person(row?.escalation1),
    escalation2: person(row?.escalation2),
    escalation3: person(row?.escalation3),
    productEngineer: person(row?.productEngineer),
    processEngineer: person(row?.processEngineer),
    isActive: row?.isActive ?? true,
  };
}

function inputOf(values: SourcingFormValues, version?: string): SourcingInput {
  return {
    projectId: values.projectId ?? 0,
    commodityId: values.commodityId,
    customerName: values.customerName.trim(),
    customerGroup: values.customerGroup.trim(),
    segment: values.segment.trim(),
    sourcingLeadUserId: values.sourcingLead?.id ?? null,
    escalation1UserId: values.escalation1?.id ?? null,
    escalation2UserId: values.escalation2?.id ?? null,
    escalation3UserId: values.escalation3?.id ?? null,
    productEngineerUserId: values.productEngineer?.id ?? null,
    processEngineerUserId: values.processEngineer?.id ?? null,
    isActive: values.isActive,
    version: version ?? null,
  };
}

const serverFieldNames = {
  sourcingLeadUserId: 'sourcingLead',
  escalation1UserId: 'escalation1',
  escalation2UserId: 'escalation2',
  escalation3UserId: 'escalation3',
  productEngineerUserId: 'productEngineer',
  processEngineerUserId: 'processEngineer',
} as const;

const FORM_ID = 'sourcing-form';

function SourcingFields({ row, onClose }: { row?: SourcingDetails; onClose: () => void }) {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const save = useSaveSourcing();
  const form = useForm<SourcingFormValues>({ defaultValues: formValuesOf(row), mode: 'onTouched' });
  const projects = useMasterOptions('Project');
  const commodities = useMasterOptions('Commodity');

  const submit = (values: SourcingFormValues) => {
    save.mutate(
      { id: row?.id ?? null, input: inputOf(values, row?.version) },
      {
        onSuccess: onClose,
        onError: (error) => {
          if (applyServerErrors(error, form, serverFieldNames)) return;
          // A project has one active row per commodity: the duplicate is about the commodity chosen
          if (isApiError(error) && error.hasCode('MPPL_SOURCING_DUPLICATE')) {
            form.setError('commodityId', { type: 'server', message: error.message }, { shouldFocus: true });
            return;
          }
          notify.error(error, 'The sourcing master row could not be saved.');
          if (isApiError(error) && error.isConflict && row) void queryClient.invalidateQueries({ queryKey: sourcingKeys.row(row.id) });
        },
      },
    );
  };

  const twoColumns = { display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' } } as const;

  return (
    <>
      <Form form={form} onSubmit={submit} id={FORM_ID}>
        <Stack spacing={2}>
          <Box sx={twoColumns}>
            <FormDropdown<SourcingFormValues, number> name="projectId" label="Project" options={projects} rules={required('Project')} />
            <FormDropdown<SourcingFormValues, number>
              name="commodityId"
              label="Commodity"
              options={commodities}
              emptyLabel="Every other commodity"
              helperText="Leave empty for the project's commodities without a row of their own."
            />
            <FormInput<SourcingFormValues> name="customerName" label="Customer" rules={{ ...required('Customer name'), ...maxLength(200, 'Customer name') }} />
            <FormInput<SourcingFormValues>
              name="customerGroup"
              label="Customer group"
              helperText="For example ABB for ABB US and ABB India."
              rules={{ ...required('Customer group'), ...maxLength(200, 'Customer group') }}
            />
            <FormInput<SourcingFormValues> name="segment" label="Segment" rules={{ ...required('Segment'), ...maxLength(100, 'Segment') }} />
            <FormPeoplePicker<SourcingFormValues> name="sourcingLead" label="Sourcing Lead" rules={required('Sourcing Lead')} />
          </Box>
          <Typography variant="subtitle2" component="h3">
            Escalation levels
          </Typography>
          <Box sx={twoColumns}>
            <FormPeoplePicker<SourcingFormValues> name="escalation1" label="Level 1" helperText="The Sourcing Lead's reporting manager." />
            <FormPeoplePicker<SourcingFormValues> name="escalation2" label="Level 2" />
            <FormPeoplePicker<SourcingFormValues> name="escalation3" label="Level 3" helperText="The supply chain head." />
          </Box>
          <Typography variant="subtitle2" component="h3">
            Engineers
          </Typography>
          <Box sx={twoColumns}>
            <FormPeoplePicker<SourcingFormValues> name="productEngineer" label="Product engineer" />
            <FormPeoplePicker<SourcingFormValues> name="processEngineer" label="Process engineer" />
          </Box>
          <FormCheckbox<SourcingFormValues>
            name="isActive"
            label="Active"
            helperText="Switch off to stop the row being used for new issues. Issues already raised keep their Sourcing Lead."
          />
        </Stack>
      </Form>
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', pt: 3 }}>
        <Button onClick={onClose} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" form={FORM_ID} variant="contained" loading={save.isPending}>
          {row ? 'Save changes' : 'Add row'}
        </Button>
      </Stack>
    </>
  );
}

/** Reads the row again (for its current version) before it is changed. */
function EditSourcing({ id, onClose }: { id: number; onClose: () => void }) {
  const row = useSourcingRow(id);
  if (row.isPending) return <SectionSkeleton />;
  if (row.isError) return <ErrorState message={errorMessage(row.error)} onRetry={() => void row.refetch()} />;
  return <SourcingFields key={row.data.version} row={row.data} onClose={onClose} />;
}

/** Adds a sourcing master row (id null) or changes one. */
export function SourcingDialog({ id, onClose }: { id: number | null; onClose: () => void }) {
  return (
    <Modal open title={id === null ? 'Add a sourcing master row' : 'Change the sourcing master row'} onClose={onClose} maxWidth="md">
      {id === null ? <SourcingFields onClose={onClose} /> : <EditSourcing id={id} onClose={onClose} />}
    </Modal>
  );
}
