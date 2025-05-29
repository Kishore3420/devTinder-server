// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    warnOnUnsupportedTypeScriptVersion: false,
  },
  plugins: ['@typescript-eslint', 'prettier'], // Ensure 'prettier' plugin is included
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Recommended TypeScript rules
    'prettier', // Disables ESLint rules that conflict with Prettier
  ],
  rules: {
    // Your existing rules
    'prettier/prettier': [
      'error',
      {}, // This empty object ensures it picks up .prettierrc.js or prettier.config.js
      // You could also explicitly pass options here, but a config file is better.
      // e.g. 'prettier/prettier': ['error', { singleQuote: true }]
      // but it's best to rely on the prettier.config.js file.
    ],
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn', // Consider 'off' if too noisy, or ensure types are consistently added
    '@typescript-eslint/no-explicit-any': 'warn',

    // Essential additions - prevent common bugs
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-var-requires': 'error', // Good for TS projects
    'no-debugger': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'no-eval': 'error',
    'no-var': 'error', // Use let/const
    'prefer-const': 'error',
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'error', // Helps catch unused function calls or assignments
    'no-throw-literal': 'error', // Prefer throwing Error objects
  },
  env: {
    node: true,
    es6: true,
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts', '**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
        node: true, // Ensure node environment is also active for test files if needed
      },
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        'no-console': 'off', // Often useful to log in tests
      },
    },
  ],
  settings: {
    // If you use path aliases or specific resolver settings
    // 'import/resolver': {
    //   typescript: {}, // Example for eslint-plugin-import with typescript
    // },
  },
  // If your .prettierrc.js is not at the root, or you want to be very explicit (usually not needed)
  // "prettierOptions": {
  //   "config": "./path/to/your/.prettierrc.js"
  // }
};
