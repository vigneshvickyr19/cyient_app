/** Query keys of the ECN lists: customers and CFT functions with their predefined actions. */
export const masterKeys = {
  all: ['ecn', 'masters'] as const,
  customers: (includeInactive: boolean) => [...masterKeys.all, 'customers', includeInactive] as const,
  allCustomers: () => [...masterKeys.all, 'customers'] as const,
  functions: () => [...masterKeys.all, 'cft-functions'] as const,
  adminFunctions: () => [...masterKeys.all, 'cft-functions', 'admin'] as const,
};
