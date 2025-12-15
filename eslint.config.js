import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

const TS_FILES = ['**/*.{ts,tsx,mts,cts}'];

export default defineConfig([
  {
    ignores: [
      // временные/генеренные директории
      '**/.stryker-tmp/**',
      '**/src/generated/**',

      // сборки/зависимости/отчёты
      'dist/**',
      '**/dist/**',
      'node_modules/**',
      '**/node_modules/**',
      'coverage/**',
      '**/coverage/**',

      // prisma
      '**/prisma/migrations/**',

      // типы
      '**/*.d.ts',
    ],
  },

  // База для JS
  js.configs.recommended,

  // ВАЖНО: ограничиваем type-checked конфиги только TS-файлами
  ...tseslint.configs.recommendedTypeChecked.map(cfg => ({
    ...cfg,
    files: cfg.files ?? TS_FILES,
  })),

  // Наши настройки TypeScript (project + globals + правила)
  {
    files: TS_FILES,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],
    },
  },

  // Послабления для тестов
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/*.int.test.ts', '**/*.e2e.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },

  // Prettier — последним
  prettier,
]);
