import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grow,
  IconButton,
  type DialogProps,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { forwardRef, useId, type FormEvent, type ReactElement, type ReactNode } from 'react';

const ModalTransition = forwardRef(function ModalTransition(
  props: TransitionProps & {
    children: ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return (
    <Grow
      ref={ref}
      {...props}
      style={{
        transformOrigin: 'center 40%',
        ...props.style,
      }}
      timeout={{ enter: 240, exit: 180 }}
    />
  );
});

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
  /** Optional custom transition component if desired. */
  TransitionComponent?: DialogProps['TransitionComponent'];
}

/** A dialog with a title, content and actions; as a form it submits on Enter, and while an action runs it cannot be closed. */
export function Modal({
  open,
  title,
  onClose,
  children,
  actions,
  maxWidth = 'sm',
  onSubmit,
  busy = false,
  TransitionComponent = ModalTransition,
}: ModalProps) {
  const titleId = useId();
  const close = () => {
    if (!busy) onClose();
  };

  const body = (
    <>
      <DialogContent
        dividers
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: 2.5,
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        {children}
      </DialogContent>
      {actions && (
        <DialogActions
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: 2,
            gap: 1.25,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'action.hover',
          }}
        >
          {actions}
        </DialogActions>
      )}
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby={titleId}
      slots={{
        transition: TransitionComponent,
      }}
      slotProps={{
        backdrop: {
          transitionDuration: { enter: 240, exit: 180 },
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          },
        },
        paper: {
          elevation: 0,
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)'
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          },
        },
      }}
    >
      <DialogTitle
        id={titleId}
        sx={{
          px: { xs: 2.5, sm: 3 },
          pt: { xs: 2, sm: 2.5 },
          pb: 1.5,
          pr: 6,
          fontWeight: 700,
          fontSize: '1.15rem',
          letterSpacing: '-0.2px',
          color: 'text.primary',
        }}
      >
        {title}
        <IconButton
          aria-label="Close"
          onClick={close}
          disabled={busy}
          size="small"
          sx={{
            position: 'absolute',
            right: 14,
            top: 14,
            color: 'text.secondary',
            bgcolor: 'action.hover',
            transition: (theme) =>
              theme.transitions.create(['background-color', 'color', 'transform'], {
                duration: 180,
              }),
            '&:hover': {
              bgcolor: 'action.selected',
              color: 'text.primary',
              transform: 'scale(1.08)',
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
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
