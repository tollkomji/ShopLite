/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
module.exports = {
  packageManager: 'pnpm',
  plugins: ['@stryker-mutator/vitest-runner'],
  testRunner: 'vitest',
  checkers: [],
  reporters: ['clear-text', 'html'],
  mutate: ['apps/order-service/src/domain/order.ts'],
  thresholds: { high: 80, low: 60, break: 0 },
};
