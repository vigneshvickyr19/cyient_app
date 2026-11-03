import js from '@eslint/js';
import pluginQuery from '@tanstack/eslint-plugin-query';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * The lint rules every package and app uses: type-checked TypeScript, React hooks, TanStack Query and, for apps,
 * React Fast Refresh boundaries.
 *
 * @param {{ tsconfigRootDir: string; kind?: 'app' | 'library' }} options
 */
export function createEslintConfig({ tsconfigRootDir, kind = 'library' }) {
  return tseslint.config(
    { ignores: ['dist', 'coverage', 'scripts', 'src/generated', '*.config.js', '*.config.ts'] },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    ...pluginQuery.configs['flat/recommended'],
    {
      languageOptions: {
        globals: globals.browser,
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      plugins: { 'react-hooks': reactHooks },
      rules: {
        ...reactHooks.configs.recommended.rules,
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        'no-console': ['error', { allow: ['warn', 'error'] }],
        eqeqeq: ['error', 'always'],
      },
    },
    kind === 'app'
      ? {
          plugins: { 'react-refresh': reactRefresh },
          rules: { 'react-refresh/only-export-components': ['warn', { allowConstantExport: true }] },
        }
      : {},
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
    },
  );
}
