import { Button as MuiButton, Stack, Typography } from '@mui/material';
import { useState, type ReactNode } from 'react';
import { Button } from './Button';
import { TextArea } from './inputs';
import { Modal } from './Modal';

export interface ConfirmDialogProps {
  open: boolean;
  title: ReactNode;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for actions that can't be undone (reject, cancel, delete). */
  danger?: boolean;
  /** Asks for a comment; "required" won't confirm without one. */
  comment?: 'optional' | 'required';
  commentLabel?: string;
  /** While the action runs. */
  loading?: boolean;
  onConfirm: (comment: string) => void;
  onClose: () => void;
  /** More fields between the message and the comment, for example a date. */
  children?: ReactNode;
  /** Whether the extra fields allow confirming. */
  canConfirm?: boolean;
}

/** Asks before an action, optionally with a comment (approve, reject, send back, cancel...). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  comment,
  commentLabel = 'Comment',
  loading = false,
  onConfirm,
  onClose,
  children,
  canConfirm = true,
}: ConfirmDialogProps) {
  const [text, setText] = useState('');
  const [touched, setTouched] = useState(false);
  const missing = comment === 'required' && text.trim() === '';

  const close = () => {
    setText('');
    setTouched(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={close}
      busy={loading}
      onSubmit={(event) => {
        event.preventDefault();
        setTouched(true);
        if (!missing && canConfirm) onConfirm(text.trim());
      }}
      actions={
        <>
          <MuiButton onClick={close} disabled={loading}>
            {cancelLabel}
          </MuiButton>
          <Button type="submit" variant="contained" color={danger ? 'error' : 'primary'} loading={loading} disabled={!canConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        {message && (typeof message === 'string' ? <Typography variant="body2">{message}</Typography> : message)}
        {children}
        {comment && (
          <TextArea
            label={commentLabel}
            required={comment === 'required'}
            value={text}
            onChange={setText}
            onBlur={() => {
              setTouched(true);
            }}
            error={touched && missing ? `${commentLabel} is required.` : undefined}
            autoFocus
          />
        )}
      </Stack>
    </Modal>
  );
}
