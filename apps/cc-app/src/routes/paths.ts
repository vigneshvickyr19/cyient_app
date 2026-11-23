/** Every address of the app; the navigation and redirects use these, so a path is spelled in one place. */
export const ROUTES = {
  home: '/',
  pending: '/pending',
  complaints: '/complaints',
  newComplaint: '/complaints/new',
  complaint: (publicId: string) => `/complaints/${publicId}`,
  editComplaint: (publicId: string) => `/complaints/${publicId}/edit`,
  internalComplaints: '/internal-complaints',
  newInternalComplaint: '/internal-complaints/new',
  internalComplaint: (publicId: string) => `/internal-complaints/${publicId}`,
  editInternalComplaint: (publicId: string) => `/internal-complaints/${publicId}/edit`,
  manageComplaints: '/manage/complaints',
  manageComplaint: (publicId: string) => `/manage/complaints/${publicId}`,
  holidays: '/manage/holidays',
  admin: '/admin',
} as const;
