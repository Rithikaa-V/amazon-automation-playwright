import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules', 'playwright-report', 'test-results', 'blob-report', 'all-blob-reports', '.auth'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // The anti-flakiness rules that matter most for this code base:
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-force-option': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/no-focused-test': 'error',
      // Page-object methods contain the assertions, and skips are conditional by design.
      'playwright/expect-expect': 'off',
      'playwright/no-skipped-test': ['warn', { allowConditional: true }],
      'playwright/no-conditional-in-test': 'off',
      'playwright/no-conditional-expect': 'off',
    },
  },
  { rules: { '@typescript-eslint/no-non-null-assertion': 'error', 'no-console': 'error' } },
  { files: ['scripts/**/*.ts'], rules: { 'no-console': 'off' } },
);
