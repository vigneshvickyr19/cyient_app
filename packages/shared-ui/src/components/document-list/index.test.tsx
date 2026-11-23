import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DocumentList, type DocumentItem } from './index';

describe('DocumentList', () => {
  it('shows empty state when no files exist', () => {
    render(<DocumentList files={[]} onDownload={vi.fn()} />);
    expect(screen.getByText('No documents')).toBeInTheDocument();
  });

  it('renders files and triggers download callback', async () => {
    const onDownload = vi.fn();
    const files: DocumentItem[] = [
      {
        id: 1,
        fileKey: 'key-1',
        fileName: 'drawing.dwg',
        sizeBytes: 1024,
        versionNo: 1,
        isCurrent: true,
        uploadedBy: { name: 'John' },
        uploadedAt: '2026-11-01T10:00:00Z',
      },
    ];

    render(<DocumentList files={files} onDownload={onDownload} />);
    expect(screen.getByText('drawing.dwg')).toBeInTheDocument();

    const downloadBtn = screen.getByRole('button', { name: /Download drawing.dwg/i });
    await userEvent.click(downloadBtn);
    expect(onDownload).toHaveBeenCalledWith(files[0]);
  });
});
