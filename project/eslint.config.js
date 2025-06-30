import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
        __DEV__: "readonly",
        NodeJS: "readonly",
      },
    },
    plugins: {
      react: react,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // React 17+ doesn't require React to be in scope
      "no-unused-vars": "warn", // Change to warn for now, will address later
      "react/prop-types": "off", // Disable prop-types validation for TypeScript
      // Your custom rules here
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
        __DEV__: "readonly",
        NodeJS: "readonly",
      },
    },
    plugins: {
      react: react,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // React 17+ doesn't require React to be in scope
      "no-unused-vars": "warn", // Change to warn for now, will address later
      "react/prop-types": "off", // Disable prop-types validation for TypeScript
      // Your custom rules here
    },
  },
];