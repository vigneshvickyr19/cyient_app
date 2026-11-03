import { createAppConfig } from '@cyient/shared-config/vite';

// Served under /dcr/, the path the API's email links use (/dcr/requests/{id})
export default createAppConfig({ port: 4201, basePath: '/dcr' });
