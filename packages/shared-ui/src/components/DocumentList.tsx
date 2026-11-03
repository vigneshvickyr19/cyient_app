import { formatDateTime, formatFileSize } from '@cyient/shared-utils';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { Chip, IconButton, List, ListItem, ListItemIcon, ListItemText, Stack, Tooltip } from '@mui/material';
import { useState } from 'react';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { FileUpload } from './FileUpload';

/** A stored document as every API returns it (StoredFile). */
export interface DocumentItem {
  id: number;
  fileKey: string;
  fileName: string;
  sizeBytes: number;
  versionNo: number;
  isCurrent: boolean;
  uploadedBy: { name: string | null };
  uploadedAt: string;
}

export interface DocumentListProps {
  files: readonly DocumentItem[];
  onDownload: (file: DocumentItem) => void;
  /** Whether a download is running for this file. */
  downloading?: (file: DocumentItem) => boolean;
  /** Present when the user may upload: the same file name again adds a new version. */
  upload?: {
    onUpload: (file: File) => Promise<unknown>;
    uploading: boolean;
    extensions?: readonly string[];
    maxSizeMb?: number;
  };
  emptyMessage?: string;
}

/** Documents with their version, size and uploader, a download for each, and an upload when allowed. */
export function DocumentList({ files, onDownload, downloading, upload, emptyMessage = 'No documents have been added.' }: DocumentListProps) {
  const [chosen, setChosen] = useState<File[]>([]);

  return (
    <Stack spacing={2}>
      {files.length === 0 ? (
        <EmptyState title="No documents" message={emptyMessage} />
      ) : (
        <List dense disablePadding aria-label="Documents">
          {files.map((file) => (
            <ListItem
              key={file.id}
              divider
              secondaryAction={
                <Tooltip title={`Download ${file.fileName}`}>
                  <span>
                    <IconButton aria-label={`Download ${file.fileName}`} onClick={() => { onDownload(file); }} disabled={downloading?.(file)}>
                      <DownloadIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              }
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <InsertDriveFileOutlinedIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <span>{file.fileName}</span>
                    {file.versionNo > 1 && <Chip label={`v${file.versionNo}`} variant="outlined" />}
                    {!file.isCurrent && <Chip label="Earlier version" variant="outlined" />}
                  </Stack>
                }
                secondary={`${formatFileSize(file.sizeBytes)} · ${file.uploadedBy.name ?? 'Unknown'} · ${formatDateTime(file.uploadedAt)}`}
              />
            </ListItem>
          ))}
        </List>
      )}
      {upload && (
        <Stack spacing={1}>
          <FileUpload value={chosen} onChange={setChosen} extensions={upload.extensions} maxSizeMb={upload.maxSizeMb} disabled={upload.uploading} label="Add a document" />
          {chosen.length > 0 && (
            <Button
              variant="contained"
              loading={upload.uploading}
              onClick={() => {
                const [file] = chosen;
                // A failed upload is reported by the caller; the file stays chosen to try again
                if (file) void upload.onUpload(file).then(() => { setChosen([]); }, () => undefined);
              }}
              sx={{ alignSelf: 'flex-start' }}
            >
              Upload
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}
