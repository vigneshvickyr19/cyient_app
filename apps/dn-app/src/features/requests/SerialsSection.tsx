import type { RequestDetails } from '@cyient/api-client/dn';
import { applyServerErrors, Button, DetailList, Form, FormInput, SectionCard, useActionFailure } from '@cyient/shared-ui';
import { maxLength, required } from '@cyient/shared-utils';
import { Box, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { requestKeys } from './keys';
import { useUpdateSerials } from './mutations';

interface SerialValues {
  startingSerialNo: string;
  endingSerialNo: string;
}

const SERIAL_LENGTH = 50;

/** The serial form; a new one is made for each version of the request, so it starts from the saved range. */
function SerialsForm({ request }: { request: RequestDetails }) {
  const failed = useActionFailure(requestKeys.detail(request.publicId));
  const save = useUpdateSerials(request.publicId);
  const form = useForm<SerialValues>({
    defaultValues: { startingSerialNo: request.startingSerialNo ?? '', endingSerialNo: request.endingSerialNo ?? '' },
  });

  const submit = (values: SerialValues) => {
    save.mutate(
      { startingSerialNo: values.startingSerialNo.trim(), endingSerialNo: values.endingSerialNo.trim(), version: request.version },
      {
        onError: (error) => {
          if (!applyServerErrors(error, form)) failed(error);
        },
      },
    );
  };

  return (
    <Form form={form} onSubmit={submit}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'flex-start' } }}>
        <Box sx={{ flex: 1 }}>
          <FormInput<SerialValues>
            name="startingSerialNo"
            label="Starting serial no"
            rules={{ ...required('Starting Serial No'), ...maxLength(SERIAL_LENGTH, 'Starting Serial No') }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormInput<SerialValues>
            name="endingSerialNo"
            label="Ending serial no"
            rules={{ ...required('Ending Serial No'), ...maxLength(SERIAL_LENGTH, 'Ending Serial No') }}
          />
        </Box>
        <Button type="submit" variant="contained" loading={save.isPending} sx={{ mt: { md: 1 } }}>
          Save serial range
        </Button>
      </Stack>
    </Form>
  );
}

/** The affected serial range of an approved deviation; the production supervisor records it. */
export function SerialsSection({ request }: { request: RequestDetails }) {
  const canUpdate = request.allowedActions?.canUpdateSerials === true;
  return (
    <SectionCard title="Affected serial range" subheader={canUpdate ? 'Record the starting and ending serial numbers this deviation covers.' : undefined}>
      {canUpdate ? (
        <SerialsForm key={request.version} request={request} />
      ) : (
        <DetailList
          items={[
            { label: 'Starting serial no', value: request.startingSerialNo ?? 'Not recorded yet' },
            { label: 'Ending serial no', value: request.endingSerialNo ?? 'Not recorded yet' },
          ]}
        />
      )}
    </SectionCard>
  );
}
