const baseConfig = require('../../eslint.config.js');

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}'],
        },
      ],
    },
    languageOptions: {
      parser: require('jsonc-eslint-parser'),
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      "@nx/interface-name-prefix": "off",
      "@nx/explicit-function-return-type": "off",
      "@nx/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": ["off"]
    }
  }
];
