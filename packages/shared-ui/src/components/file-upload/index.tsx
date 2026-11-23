import { fileProblem, formatFileSize } from '@cyient/shared-utils';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Box, Button, FormHelperText, IconButton, List, ListItem, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import { useState, type DragEvent, type ReactNode } from 'react';

export interface FileUploadProps {
  label?: ReactNode;
  value: readonly File[];
  onChange: (files: File[]) => void;
  multiple?: boolean;
  /** Lower-case extensions with the dot, for example ['.pdf', '.docx']; checked before upload, as the API does. */
  extensions?: readonly string[];
  maxSizeMb?: number;
  disabled?: boolean;
  error?: string;
  helperText?: ReactNode;
}

/** Choose or drop files; wrong types and oversized files are refused with a message before anything is sent. */
export function FileUpload({ label = 'Choose files', value, onChange, multiple = false, extensions, maxSizeMb, disabled, error, helperText }: FileUploadProps) {
  const [problem, setProblem] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const add = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    const problems = files.map((file) => fileProblem(file, { extensions, maxSizeMb })).filter((p): p is string => p !== null);
    setProblem(problems[0] ?? null);
    const accepted = files.filter((file) => fileProblem(file, { extensions, maxSizeMb }) === null);
    if (accepted.length > 0) onChange(multiple ? [...value, ...accepted] : accepted.slice(0, 1));
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) add(event.dataTransfer.files);
  };

  const message = error ?? problem;

  return (
    <Stack spacing={1}>
      <Box
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => {
          setDragging(false);
        }}
        onDrop={onDrop}
        sx={{
          border: 1,
          borderStyle: 'dashed',
          borderColor: message ? 'error.main' : dragging ? 'primary.main' : 'divider',
          borderRadius: 1,
          bgcolor: dragging ? 'action.hover' : 'transparent',
          p: 2,
          textAlign: 'center',
        }}
      >
        <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} disabled={disabled}>
          {label}
          <input
            type="file"
            hidden
            multiple={multiple}
            accept={extensions?.join(',')}
            disabled={disabled}
            onChange={(event) => {
              add(event.target.files);
              event.target.value = '';
            }}
          />
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          or drop {multiple ? 'files' : 'a file'} here
          {extensions?.length ? ` · ${extensions.join(', ')}` : ''}
          {maxSizeMb ? ` · up to ${maxSizeMb} MB` : ''}
        </Typography>
      </Box>
      {value.length > 0 && (
        <List dense disablePadding>
          {value.map((file, index) => (
            <ListItem
              key={`${file.name}-${index}`}
              secondaryAction={
                <IconButton
                  aria-label={`Remove ${file.name}`}
                  disabled={disabled}
                  onClick={() => {
                    onChange(value.filter((_, i) => i !== index));
                  }}
                >
                  <CloseIcon />
                </IconButton>
              }
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <InsertDriveFileOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary={file.name} secondary={formatFileSize(file.size)} />
            </ListItem>
          ))}
        </List>
      )}
      {(message ?? helperText) && <FormHelperText error={Boolean(message)}>{message ?? helperText}</FormHelperText>}
    </Stack>
  );
}
