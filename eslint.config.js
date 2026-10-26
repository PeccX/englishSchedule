const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  { ignores: ['node_modules/', '.expo/', 'dist/', 'coverage/', '*.config.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/domain/collision/**/*.ts'],
    rules: { complexity: ['error', 8] },
  },
);
