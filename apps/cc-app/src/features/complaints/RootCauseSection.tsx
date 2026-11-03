import type { ComplaintDetails } from '@cyient/api-client/cc';
import { applyServerErrors, Button, DetailList, Form, FormTextArea, SectionCard, useActionFailure, useNotify } from '@cyient/shared-ui';
import { maxLength, textOrNull } from '@cyient/shared-utils';
import { Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { complaintKeys } from './keys';
import { useSaveRootCause } from './mutations';

interface RootCauseValues {
  occurrence: string;
  nonDetection: string;
  system: string;
}

const LONG_TEXT = 4000;

const segments = [
  { name: 'occurrence', label: 'Why it occurred' },
  { name: 'nonDetection', label: 'Why it was not detected' },
  { name: 'system', label: 'Why the system allowed it' },
] as const;

interface RootCauseSectionProps {
  complaint: ComplaintDetails;
  /** Called after a save that moved the complaint on (the first save opens D5). */
  onMoved: () => void;
}

/** D4: the why-why analysis in three segments; at least one is needed. The team saves it until D8 is saved. */
export function RootCauseSection({ complaint, onMoved }: RootCauseSectionProps) {
  const notify = useNotify();
  const failed = useActionFailure(complaintKeys.detail(complaint.publicId));
  const save = useSaveRootCause(complaint.publicId);
  const { rootCause } = complaint;
  const canSave = complaint.allowedActions?.canSaveRootCause === true;
  const form = useForm<RootCauseValues>({
    defaultValues: { occurrence: rootCause.occurrence ?? '', nonDetection: rootCause.nonDetection ?? '', system: rootCause.system ?? '' },
  });

  if (!canSave) {
    return (
      <SectionCard title="D4 Root cause" subheader="The why-why analysis">
        <DetailList columns={2} items={segments.map((segment) => ({ label: segment.label, value: rootCause[segment.name], wide: true }))} />
      </SectionCard>
    );
  }

  const submit = (values: RootCauseValues) => {
    save.mutate(
      { occurrence: textOrNull(values.occurrence), nonDetection: textOrNull(values.nonDetection), system: textOrNull(values.system), version: complaint.version },
      {
        onSuccess: (saved) => {
          const moved = saved.status !== complaint.status;
          notify.success(moved ? 'Root cause saved. D5 is open: add the actions.' : 'Root cause saved.');
          if (moved) onMoved();
        },
        onError: (error) => {
          if (!applyServerErrors(error, form)) failed(error);
        },
      },
    );
  };

  return (
    <SectionCard
      title="D4 Root cause"
      subheader={complaint.status === 'RootCause' ? 'Fill in at least one segment. Saving it opens D5, the action plan.' : 'Fill in at least one segment.'}
    >
      <Form form={form} onSubmit={submit}>
        <Stack spacing={2}>
          {segments.map((segment, index) => (
            <FormTextArea<RootCauseValues>
              key={segment.name}
              name={segment.name}
              label={segment.label}
              rules={{
                ...maxLength(LONG_TEXT, segment.label),
                ...(index === 0
                  ? {
                      validate: (_: string, values: RootCauseValues) =>
                        segments.some((s) => values[s.name].trim() !== '') || 'Fill in at least one segment of the why-why analysis.',
                    }
                  : {}),
              }}
            />
          ))}
          <Button type="submit" variant="contained" loading={save.isPending} sx={{ alignSelf: 'flex-end' }}>
            Save root cause
          </Button>
        </Stack>
      </Form>
    </SectionCard>
  );
}
