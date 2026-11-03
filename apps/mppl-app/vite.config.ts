import { createAppConfig } from '@cyient/shared-config/vite';

// Served under /mppl/, the path the API's email links use (/mppl/issues/{id})
export default createAppConfig({ port: 4205, basePath: '/mppl' });
