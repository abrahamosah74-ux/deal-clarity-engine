// https://docs.expo.dev/guides/using-eslint/
module.exports = [
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        __DEV__: 'readonly',
      },
    },
  },
];
