import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export interface FieldLabelProps {
  id?: string;
  /** The id of the input the label belongs to. */
  htmlFor: string;
  error?: boolean;
  required?: boolean;
  children: ReactNode;
}

/** The label above a field: bold, red while the field has an error, with a star when it is required. */
export function FieldLabel({ id, htmlFor, error = false, required = false, children }: FieldLabelProps) {
  return (
    <Box sx={{ mb: 0.5 }}>
      <Typography
        id={id}
        component="label"
        htmlFor={htmlFor}
        variant="body2"
        sx={{
          fontWeight: 600,
          color: error ? 'error.main' : 'text.primary',
          transition: (t) => t.transitions.create('color', { duration: 150 }),
        }}
      >
        {children}
        {required && (
          <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
            *
          </Box>
        )}
      </Typography>
    </Box>
  );
}
