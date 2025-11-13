const presetNodeTypescriptPrettier = require("@cybozu/eslint-config/flat/presets/node-typescript-prettier");

/**
 * @type { import("eslint").Linter.Config[] }
 */
module.exports = [
  ...presetNodeTypescriptPrettier,
  {
    rules: {
      "n/no-process-exit": "off",
      // fetch is supported in Node.js 18, but eslint reports an error, so we ignore it
      "n/no-unsupported-features/node-builtins": ["error", { ignores: ["fetch"] }],
    },
  },
  {
    files: ["__tests__/**/*.ts", "__tests__/**/*.js"],
    rules: {
      "n/no-missing-require": "off",
      "n/no-unpublished-require": "off",
      "n/no-unpublished-import": "off",
      "n/no-extraneous-import": "off",
    },
  },
  {
    ignores: ["bin/*", "dist/*"],
  },
];
