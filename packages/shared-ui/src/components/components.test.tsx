import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test';
import { ConfirmDialog } from './ConfirmDialog';
import { FileUpload } from './FileUpload';

describe('ConfirmDialog', () => {
  it('will not confirm without a required comment, then passes the comment on', async () => {
    const onConfirm = vi.fn();
    renderWithProviders(
      <ConfirmDialog open title="Reject this request?" comment="required" commentLabel="Reason" confirmLabel="Reject" danger onConfirm={onConfirm} onClose={vi.fn()} />,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Reject' }));
    expect(screen.getByText('Reason is required.')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    await userEvent.type(screen.getByRole('textbox', { name: /Reason/ }), '  Wrong template  ');
    await userEvent.click(screen.getByRole('button', { name: 'Reject' }));
    expect(onConfirm).toHaveBeenCalledWith('Wrong template');
  });
});

function Upload() {
  const [files, setFiles] = useState<File[]>([]);
  return <FileUpload value={files} onChange={setFiles} extensions={['.pdf']} maxSizeMb={1} multiple />;
}

describe('FileUpload', () => {
  it('refuses the wrong type of file with a message and lists accepted ones', async () => {
    const { container } = renderWithProviders(<Upload />);
    await screen.findByText('Choose files');
    const input = container.querySelector<HTMLInputElement>('input[type=file]')!;

    await userEvent.upload(input, [new File(['x'], 'procedure.pdf'), new File(['x'], 'macro.xlsm')], { applyAccept: false });

    expect(screen.getByText('procedure.pdf')).toBeInTheDocument();
    expect(screen.queryByText('macro.xlsm')).not.toBeInTheDocument();
    expect(screen.getByText('macro.xlsm: only .pdf files are accepted.')).toBeInTheDocument();
  });
});
