import type { UserConfig } from 'vitest/config';

export function createTestConfig(options?: { environment?: 'jsdom' | 'node' }): UserConfig;
