/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

const stylistic = require('@stylistic/eslint-plugin');

const customized = stylistic.configs.customize({
  // the following options are the default values
  indent: 2,
  quotes: 'single',
  semi: true,
  jsx: true,
  // ...
});

// console.info('customized', customized);

/**
 * 各项目共享此`eslint`配置
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  overrides: [
    {
      env: {
        browser: true,
        node: true,
      },
      plugins: ['@stylistic'],
      extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        // 'plugin:@stylistic/recommended-extends',
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier/skip-formatting',
      ],
      parserOptions: {
        ecmaVersion: 'latest',
      },
      files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.cjs', '*.mjs', '*.cts', '*.mts', '*.vue'],
      excludedFiles: ['.git', '.idea', 'node_modules', '.gitignore', 'dist', 'public', 'libs', 'lib', 'envs', 'templates', 'temp'],
      rules: {
        ...customized.rules,
        '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
        'vue/multi-word-component-names': [
          'error',
          { ignores: ['index', 'main'] },
        ],
        // 'vue/no-v-text-v-html-on-component': [
        //   'error',
        //   { allow: ['view'] },
        // ],
      },
    },
  ],
};
