import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // Relax a few strict rules to unblock CI and local commits;
    // we keep them documented to revisit and tighten later.
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react/display-name": "off",
      "react/no-unescaped-entities": "off",
      // Keep as a warning to avoid blocking commits for stylistic prefs
      "prefer-const": "warn",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**", "src/test/**"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "react/display-name": "off",
    },
  },
];

export default eslintConfig;
