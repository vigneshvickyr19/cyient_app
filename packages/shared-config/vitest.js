import { defineConfig } from 'vitest/config';

/**
 * Vitest for a shared package: jsdom with Testing Library matchers for React code, plain Node otherwise.
 *
 * @param {{ environment?: 'jsdom' | 'node' }} [options]
 */
export function createTestConfig({ environment = 'node' } = {}) {
  return defineConfig({
    test: {
      environment,
      setupFiles: environment === 'jsdom' ? ['@cyient/shared-config/vitest-setup'] : [],
      css: false,
      testTimeout: 30_000,
    },
  });
}
