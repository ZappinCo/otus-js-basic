import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import pluginJest from "eslint-plugin-jest";


export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      ...js.configs.recommended.rules,
      "semi": ["error", "always"]
    },
  },
  {
    files: ["**/*.test.js", "**/*.spec.js"],
    plugins: { jest: pluginJest, },
    languageOptions: { globals: pluginJest.environments.globals.globals, },
    rules: {
      ...pluginJest.configs["flat/recommended"].rules,
      "semi": ["error", "always"]
    },
  },
]);
