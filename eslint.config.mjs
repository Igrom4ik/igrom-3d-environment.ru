import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "coverage/**", "**/*.log"],
  },
  ...compat.extends("next/core-web-vitals"),
];
