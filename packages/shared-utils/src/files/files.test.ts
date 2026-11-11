import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { saveFile } from './files';

describe('saveFile', () => {
  const createObjectURLSpy = vi.fn().mockReturnValue('blob:mock-url');
  const revokeObjectURLSpy = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('URL', {
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('triggers browser download with specified file name', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockReturnValue();
    const blob = new Blob(['sample content'], { type: 'text/plain' });

    saveFile(blob, 'report.pdf');

    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    clickSpy.mockRestore();
  });

  it('uses fallbackName when fileName is null', () => {
    let capturedDownloadName = '';
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      capturedDownloadName = this.download;
    });

    const blob = new Blob(['data']);
    saveFile(blob, null, 'default-report.xlsx');

    expect(capturedDownloadName).toBe('default-report.xlsx');
    clickSpy.mockRestore();
  });
});
