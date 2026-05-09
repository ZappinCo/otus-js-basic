// eslint.config.cjs
const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const globals = require("globals");

module.exports = [
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            "coverage/**",
            "**/*.test.ts",
            "**/*.test.js",
            "**/*.test.tsx",
        ],
    },
    js.configs.recommended,
    {
        files: ["src/**/*.js", "src/**/*.mjs", "src/**/*.cjs"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            "semi": ["error", "always"],
        },
    },
    {
        files: ["src/**/*.ts", "src/**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            "semi": ["error", "always"],
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
];