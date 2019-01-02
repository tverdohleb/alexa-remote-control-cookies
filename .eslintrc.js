module.exports = {
  plugins: ['prettier'],
  extends: ['airbnb', 'prettier'],
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    es6: true,
    node: true,
  },
  rules: {
    'prettier/prettier': 'error',
  },
};
