import type { ConfigArray } from 'typescript-eslint';

export function createEslintConfig(options: { tsconfigRootDir: string; kind?: 'app' | 'library' }): ConfigArray;
