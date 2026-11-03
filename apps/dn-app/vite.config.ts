import { createAppConfig } from '@cyient/shared-config/vite';

// Served under /dn/, the path the API's email links use (/dn/requests/{id})
export default createAppConfig({ port: 4202, basePath: '/dn' });
