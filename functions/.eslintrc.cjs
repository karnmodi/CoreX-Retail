module.exports = {
  env: {
    es6: true,
    node: true, // Ensures Node.js environment
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  extends: [
    'eslint:recommended',
    'google',
  ],
  rules: {
    'no-restricted-globals': ['error', 'name', 'length'],
    'prefer-arrow-callback': 'error',
    'quotes': ['error', 'double', { 'allowTemplateLiterals': true }],
  },
  overrides: [
    {
      files: ['**/*.js'],
      env: {
        node: true,
      },
      rules: {},
    },
  ],
  globals: {
    require: 'readonly', // Explicitly define 'require' as global
    module: 'readonly',  // Explicitly define 'module' as global
    exports: 'readonly', // Explicitly define 'exports' as global
  },
};
