import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

/** Libraries grouped into long-cached chunks, by the package a module comes from (wherever it is installed). */
const vendorChunks = [
  ['react', /[\\/]node_modules[\\/](react|react-dom|react-router|scheduler|cookie|set-cookie-parser)[\\/]/],
  ['grid', /[\\/]node_modules[\\/]@mui[\\/]x-data-grid[\\/]/],
  ['pickers', /[\\/]node_modules[\\/](@mui[\\/]x-date-pickers|dayjs)[\\/]/],
  ['mui', /[\\/]node_modules[\\/](@mui|@emotion|@popperjs|react-transition-group|stylis|clsx)[\\/]/],
  ['data', /[\\/]node_modules[\\/](@tanstack|react-hook-form)[\\/]/],
  ['msal', /[\\/]node_modules[\\/]@azure[\\/]/],
];

/** @param {string} id */
function vendorChunk(id) {
  return vendorChunks.find(([, pattern]) => pattern.test(id))?.[0];
}

/**
 * The Vite set-up of every app: React, the app's own dev port and base path (the path its email links use, for
 * example /dcr/), a production build split into cached vendor chunks, and Vitest in jsdom.
 *
 * @param {{ port: number; basePath: string }} options
 */
export function createAppConfig({ port, basePath }) {
  return defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const base = `/${(env.VITE_BASE_PATH || basePath).replace(/^\/+|\/+$/g, '')}/`;

    // The APIs send no CORS headers for the dev origins, so in development (and `vite preview`) the dev server forwards
    // /api to the real API and the app calls its own address. Set VITE_API_PROXY_TARGET (see .env.development).
    const apiProxy = env.VITE_API_PROXY_TARGET
      ? { '/api': { target: env.VITE_API_PROXY_TARGET, changeOrigin: true } }
      : undefined;

    return {
      base,
      plugins: [react()],
      resolve: {
        // `@/…` is the app's own src folder (each app's tsconfig has the matching `paths`)
        alias: [{ find: /^@\//, replacement: `${path.resolve(process.cwd(), 'src')}/` }],
        // One copy of each library that holds React state, whichever package imports it
        dedupe: ['react', 'react-dom', 'react-router', '@emotion/react', '@mui/material', '@tanstack/react-query', 'react-hook-form'],
      },
      server: { port, strictPort: true, proxy: apiProxy },
      preview: { port, strictPort: true, proxy: apiProxy },
      build: {
        outDir: 'dist',
        sourcemap: true,
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
          output: { manualChunks: vendorChunk },
        },
      },
      test: {
        environment: 'jsdom',
        setupFiles: ['@cyient/shared-config/vitest-setup'],
        css: false,
        // Page tests render the whole provider tree and lazy pages; slow machines need more than the 5 s default
        testTimeout: 30_000,
      },
    };
  });
}
