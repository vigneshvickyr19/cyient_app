import { createAppConfig } from '@cyient/shared-config/vite';

// Served under /ecn/, the path the API's email links use (/ecn/notes/{id})
export default createAppConfig({ port: 4204, basePath: '/ecn' });
