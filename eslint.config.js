// eslint.config.js

const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const { FlatCompat } = require('@eslint/eslintrc');

// FlatCompat 기본 설정
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: [
      'dist/',
      '.next/',
      'node_modules/',
      'coverage/',
      'build/',
      'out/',
      'examples/',
    ],
  },

  // 1) 기본 JS 추천 규칙
  js.configs.recommended,

  // 2) Prettier와 충돌하는 규칙 off (eslint-config-prettier)
  ...compat.extends('prettier'),

  // 3) TS 추천 규칙 (plugin:@typescript-eslint/recommended)
  ...compat.extends('plugin:@typescript-eslint/recommended'),

  // 4) TS 파일 전용 설정
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',

      // logger 라이브러리니까 console 허용
      'no-console': 'off',
    },
  },

  // 5) eslint.config.js 전용(Node/CJS) 설정
  {
    files: ['eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
];
