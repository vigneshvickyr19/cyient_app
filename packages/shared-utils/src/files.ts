/** Hands a downloaded file to the browser to save, under the name the API gave it. */
export function saveFile(blob: Blob, fileName: string | null, fallbackName = 'download'): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName ?? fallbackName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Let the browser start the download before the address is released
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
