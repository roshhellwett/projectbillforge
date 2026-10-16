import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "drizzle/meta/**",
    "public/**",
    "dist/**",
    "coverage/**",
  ]),
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    rules: {
      // TypeScript's compiler is the source of truth for type correctness.
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      // These React 19 compiler diagnostics are useful guidance, but several
      // existing hydration, focus, and async-loading patterns intentionally
      // update local state from effects. Keep them visible without making the
      // repository hook unusable until each workflow can be refactored safely.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
]);
