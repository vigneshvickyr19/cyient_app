import type { RequestDetails } from '@cyient/api-client/dn';
import { Stack } from '@mui/material';
import { InformedPeople, ReviewerSequence } from '@/components/requests/ReviewersSection';

export interface ReviewersSectionProps {
  request: RequestDetails;
}

export function ReviewersSection({ request }: ReviewersSectionProps) {
  return (
    <Stack spacing={3}>
      <ReviewerSequence request={request} />
      <InformedPeople request={request} />
    </Stack>
  );
}
