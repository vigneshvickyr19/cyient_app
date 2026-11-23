import type { RequestDetails } from '@cyient/api-client/dcr';
import { DetailList, SectionCard } from '@cyient/shared-ui';
import { formatDate, formatDateTime } from '@cyient/shared-utils';
import { Stack } from '@mui/material';

export interface RequestSummaryProps {
  request: RequestDetails;
}

export function RequestSummary({ request }: RequestSummaryProps) {
  return (
    <Stack spacing={3}>
      <SectionCard title="Document request">
        <DetailList
          items={[
            { label: 'Requested by', value: request.requestFrom.name },
            { label: 'Designation', value: request.designation },
            { label: 'Request date', value: formatDate(request.requestDate) },
            { label: 'Location', value: request.location.name },
            { label: 'Department / Function', value: request.department.name },
            { label: 'Need by', value: formatDate(request.needByDate) },
            { label: 'Document reference', value: request.documentReference },
            { label: 'Current revision no', value: request.currentRevisionNo },
            { label: 'Current revision date', value: formatDate(request.currentRevisionDate) },
            { label: 'Document description', value: request.documentDescription, wide: true },
          ]}
        />
      </SectionCard>
      <SectionCard title="Reason and risk">
        <DetailList
          items={[
            { label: 'Reason category', value: request.reasonCategory.name },
            { label: 'Reason for changes', value: request.reasonForChanges, wide: true },
            { label: 'Risk and impact on the QMS', value: request.riskToQms, wide: true },
            { label: 'Risk and impact on the devices', value: request.riskToDevices, wide: true },
          ]}
        />
      </SectionCard>
      <SectionCard title="Reviewers and release">
        <DetailList
          items={[
            { label: 'Department Manager', value: request.deptManager.name },
            { label: 'Department Head', value: request.deptHead.name },
            { label: 'Submitted', value: formatDateTime(request.submittedAt) },
            { label: 'Release date', value: formatDate(request.releaseDate) },
            { label: 'Effective implementation date', value: formatDate(request.effectiveImplementationDate) },
          ]}
        />
      </SectionCard>
    </Stack>
  );
}
