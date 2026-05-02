// eslint.config.js
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";

export default [
    // Глобальные игноры
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
    // JavaScript файлы
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
    // TypeScript файлы
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