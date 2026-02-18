import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off", // Can be ginored => React 17+ 
      "no-use-before-define": ["error", {
        "functions": true,
        "classes": true,
        "variables": true
      }],
      "no-unused-vars": ["warn", {
        "vars": "all",
        "args": "after-used",
        "ignoreRestSiblings": true,
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_"
      }]
    },
    settings: {
      react: { version: "detect" },
    },
  },
];
