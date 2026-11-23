import type { RequestDetails } from '@cyient/api-client/dn';
import { DetailList, SectionCard } from '@cyient/shared-ui';
import { formatDate, formatDateTime } from '@cyient/shared-utils';
import { Stack } from '@mui/material';
import { STATUS_ACTIONS } from '@/constants/request-status';
import { SerialsSection } from '@/views/requests/detail/SerialsSection';

export interface RequestSummaryProps {
  request: RequestDetails;
}

export function RequestSummary({ request }: RequestSummaryProps) {
  return (
    <Stack spacing={3}>
      <SectionCard title="Deviation request">
        <DetailList
          items={[
            { label: 'Initiated by', value: request.initiator.name },
            { label: 'Designation', value: request.designation },
            { label: 'Date', value: formatDate(request.requestDate) },
            { label: 'Initiator department', value: request.initiatorDepartment.name },
            { label: 'W.O no', value: request.workOrderNo },
            { label: 'Line no / cell no / equipment no', value: request.lineCellEquipmentNo },
            { label: 'Customer', value: request.customer.name },
            { label: 'Product FG number', value: request.productFgNumber },
            { label: 'Unit number', value: request.unit.name },
            { label: 'Deviation quantity', value: request.deviationQuantity },
            { label: 'Change category', value: request.changeCategory.name },
            { label: 'Financial year', value: request.financialYear },
          ]}
        />
      </SectionCard>
      <SectionCard title="Deviation details">
        <DetailList
          items={[
            { label: 'Prescribed / defined process', value: request.prescribedProcess, wide: true },
            { label: 'Process change required', value: request.processChangeRequired, wide: true },
            { label: 'Reason for change', value: request.reasonForChange, wide: true },
            { label: 'Action taken to prevent re-occurrence', value: request.preventiveAction, wide: true },
          ]}
        />
      </SectionCard>
      {request.submittedAt && (
        <SectionCard title="Progress">
          <DetailList
            items={[
              { label: 'Submitted', value: formatDateTime(request.submittedAt) },
              { label: 'Pending with', value: request.pendingWith?.name },
              { label: 'Pending role', value: request.pendingRole },
              { label: 'Reporting manager', value: request.reportingManager?.name },
              { label: 'Further approval required', value: request.furtherApprovalRequired === null ? null : request.furtherApprovalRequired ? 'Yes' : 'No' },
              { label: 'Final approval date', value: formatDate(request.finalApprovalDate) },
              { label: 'Valid until', value: formatDate(request.validUntil) },
              { label: 'More details asked for', value: request.moreInfo, wide: true },
              { label: "Initiator's answer", value: request.revertComments, wide: true },
            ]}
          />
        </SectionCard>
      )}
      {(request.status === STATUS_ACTIONS.APPROVED || request.startingSerialNo !== null || request.endingSerialNo !== null) && <SerialsSection request={request} />}
    </Stack>
  );
}
