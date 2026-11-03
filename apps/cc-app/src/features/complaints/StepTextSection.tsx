import type { ComplaintDetails } from '@cyient/api-client/cc';
import { applyServerErrors, Button, DetailList, Form, FormTextArea, SectionCard, useActionFailure, useNotify } from '@cyient/shared-ui';
import { maxLength } from '@cyient/shared-utils';
import { Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { complaintKeys } from './keys';
import { useSaveStep, type TextStep } from './mutations';

interface StepValues {
  text: string;
}

/** D6, D7 and D8 as the API names them (CcStatusNames), what each holds, and what saving the open step does. */
const stepInfo: Record<TextStep, { title: string; label: string; status: ComplaintDetails['status']; next: string; allowed: 'canSaveVerification' | 'canSaveHorizontalDeployment' | 'canSaveClosureSummary' }> = {
  verification: {
    title: 'D6 Verification',
    label: 'Verification of the actions',
    status: 'Verification',
    next: 'Saving it opens D7, the horizontal deployment.',
    allowed: 'canSaveVerification',
  },
  horizontalDeployment: {
    title: 'D7 Horizontal Deployment',
    label: 'Horizontal deployment',
    status: 'HorizontalDeployment',
    next: 'Saving it opens D8, the closure.',
    allowed: 'canSaveHorizontalDeployment',
  },
  closure: {
    title: 'D8 Closure',
    label: 'Closure summary',
    status: 'Closure',
    next: 'Saving it sends the complaint back to the initiator to review and close.',
    allowed: 'canSaveClosureSummary',
  },
};

const valueOf = (complaint: ComplaintDetails, step: TextStep) =>
  step === 'verification' ? complaint.verification : step === 'horizontalDeployment' ? complaint.horizontalDeployment : complaint.closureSummary;

interface StepTextSectionProps {
  complaint: ComplaintDetails;
  step: TextStep;
  /** Called after a save that moved the complaint on to the next step. */
  onMoved: () => void;
}

/** One of the text steps D6, D7 and D8: the team saves it when it opens, and D6 and D7 again until D8 is saved. */
export function StepTextSection({ complaint, step, onMoved }: StepTextSectionProps) {
  const info = stepInfo[step];
  const notify = useNotify();
  const failed = useActionFailure(complaintKeys.detail(complaint.publicId));
  const save = useSaveStep(complaint.publicId, step);
  const value = valueOf(complaint, step);
  const canSave = complaint.allowedActions?.[info.allowed] === true;
  const form = useForm<StepValues>({ defaultValues: { text: value ?? '' } });

  if (!canSave) {
    return (
      <SectionCard title={info.title}>
        <DetailList items={[{ label: info.label, value, wide: true }]} />
      </SectionCard>
    );
  }

  const submit = (values: StepValues) => {
    save.mutate(
      { text: values.text.trim(), version: complaint.version },
      {
        onSuccess: (saved) => {
          notify.success(`${info.title} saved.`);
          if (saved.status !== complaint.status) onMoved();
        },
        onError: (error) => {
          if (!applyServerErrors(error, form)) failed(error);
        },
      },
    );
  };

  return (
    <SectionCard title={info.title} subheader={complaint.status === info.status ? info.next : undefined}>
      <Form form={form} onSubmit={submit}>
        <Stack spacing={2}>
          <FormTextArea<StepValues>
            name="text"
            label={info.label}
            minRows={4}
            rules={{
              required: `${info.title} is required.`,
              validate: (text) => text.trim() !== '' || `${info.title} is required.`,
              ...maxLength(4000, info.label),
            }}
          />
          <Button type="submit" variant="contained" loading={save.isPending} sx={{ alignSelf: 'flex-end' }}>
            Save {info.title.slice(0, 2)}
          </Button>
        </Stack>
      </Form>
    </SectionCard>
  );
}
