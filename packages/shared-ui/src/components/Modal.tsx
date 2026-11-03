import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, type DialogProps } from '@mui/material';
import { useId, type FormEvent, type ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: DialogProps['maxWidth'];
  /** Makes the dialog a form: Enter submits it. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** While an action runs the dialog can't be closed. */
  busy?: boolean;
}

/** A dialog with a title, a close button, content and actions. */
export function Modal({ open, title, onClose, children, actions, maxWidth = 'sm', onSubmit, busy = false }: ModalProps) {
  const titleId = useId();
  const close = () => {
    if (!busy) onClose();
  };

  const body = (
    <>
      <DialogContent dividers>{children}</DialogContent>
      {actions && <DialogActions sx={{ px: 3, py: 2 }}>{actions}</DialogActions>}
    </>
  );

  return (
    <Dialog open={open} onClose={close} maxWidth={maxWidth} aria-labelledby={titleId}>
      <DialogTitle id={titleId} sx={{ pr: 6 }}>
        {title}
        <IconButton aria-label="Close" onClick={close} disabled={busy} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      {onSubmit ? (
        <Box component="form" noValidate onSubmit={onSubmit} sx={{ display: 'contents' }}>
          {body}
        </Box>
      ) : (
        body
      )}
    </Dialog>
  );
}
