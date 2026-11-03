import { createAppConfig } from '@cyient/shared-config/vite';

// Served under /cc/, the path the API's email links use (/cc/complaints/{id})
export default createAppConfig({ port: 4203, basePath: '/cc' });
