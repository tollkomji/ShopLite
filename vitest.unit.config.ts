import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['apps/**/src/**/*.test.ts', 'apps/**/src/**/*.spec.ts'],
    exclude: [
      '**/*.int.test.ts',
      '**/*.e2e.test.ts',
      '**/dist/**',
      '**/.stryker-tmp/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/src/generated/**',
    ],
  },
});
