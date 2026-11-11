import { createEslintConfig } from '@cyient/shared-config/eslint';

export default [
  ...createEslintConfig({ tsconfigRootDir: import.meta.dirname, kind: 'app' }),
  {
    ignores: ['src/mockData/**'],
  },
];
