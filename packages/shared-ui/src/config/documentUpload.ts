/**
 * The documents every API accepts, as its Platform:Files defaults: PDF, Word, Excel, PowerPoint, PNG and JPEG, up to
 * 25 MB. Checked before upload, as the API does.
 */
export const documentUpload = {
  extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.png', '.jpg', '.jpeg'],
  maxSizeMb: 25,
} as const satisfies { extensions: readonly string[]; maxSizeMb: number };
