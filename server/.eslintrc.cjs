module.exports = {
  root: true,
  env: { browser: false, es2020: true },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["simple-import-sort"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["off"],
    "@typescript-eslint/explicit-function-return-type": ["off"],
    "@typescript-eslint/explicit-module-boundary-types": ["off"],
    "@typescript-eslint/no-empty-function": ["off"],
    "@typescript-eslint/no-explicit-any": ["off"],
    "no-useless-catch": ["off"],
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
};
