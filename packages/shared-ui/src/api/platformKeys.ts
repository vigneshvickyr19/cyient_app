/** Query keys of the shared platform data, so every app caches and invalidates them the same way. */
export const platformKeys = {
  all: ['platform'] as const,
  session: () => [...platformKeys.all, 'session'] as const,
  me: () => [...platformKeys.all, 'me'] as const,
  version: () => [...platformKeys.all, 'version'] as const,
  masterTypes: () => [...platformKeys.all, 'master-types'] as const,
  masters: (type: string) => [...platformKeys.all, 'masters', type] as const,
  people: (search: string, limit: number) => [...platformKeys.all, 'people', search, limit] as const,
  admin: () => [...platformKeys.all, 'admin'] as const,
};
