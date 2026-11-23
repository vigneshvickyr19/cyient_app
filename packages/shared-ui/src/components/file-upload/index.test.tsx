import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test';
import { FileUpload } from './index';

function UploadWrapper() {
  const [files, setFiles] = useState<File[]>([]);
  return <FileUpload value={files} onChange={setFiles} extensions={['.pdf']} maxSizeMb={1} multiple />;
}

describe('FileUpload', () => {
  it('refuses the wrong type of file with a message and lists accepted ones', async () => {
    const { container } = renderWithProviders(<UploadWrapper />);
    await screen.findByText('Choose files');
    const input = container.querySelector<HTMLInputElement>('input[type=file]')!;

    await userEvent.upload(input, [new File(['x'], 'procedure.pdf'), new File(['x'], 'macro.xlsm')], { applyAccept: false });

    expect(screen.getByText('procedure.pdf')).toBeInTheDocument();
    expect(screen.queryByText('macro.xlsm')).not.toBeInTheDocument();
    expect(screen.getByText('macro.xlsm: only .pdf files are accepted.')).toBeInTheDocument();
  });
});
