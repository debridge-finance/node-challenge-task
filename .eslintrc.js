module.exports = {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/strict',
      "plugin:prettier/recommended"
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      // Required for type-checked configs
      project: './tsconfig.json',
    },
    plugins: [
      '@typescript-eslint',
      'prettier'
    ],
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  };