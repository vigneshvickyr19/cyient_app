import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';

/** An address the app doesn't have. */
export function NotFoundPage({ homeTo = '/' }: { homeTo?: string }) {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 8 }}>
      <Typography variant="h2" component="h1">
        Page not found
      </Typography>
      <Typography color="text.secondary">The address may be mistyped, or the page has moved.</Typography>
      <Button component={RouterLink} to={homeTo} variant="contained">
        Go to the home page
      </Button>
    </Stack>
  );
}
