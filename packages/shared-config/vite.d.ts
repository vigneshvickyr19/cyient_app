import type { UserConfigFnObject } from 'vite';

export function createAppConfig(options: { port: number; basePath: string }): UserConfigFnObject;
