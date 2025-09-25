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
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" }
      ],
      "react/no-unescaped-entities": "warn",
    },
  },
  {
    files: [
      "src/types/**/*.ts",
      "src/types/**/*.d.ts",
      "src/types/contentful-types.generated.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: [
      "src/components/**/*-pdf.tsx",
      "src/components/**/summary-*.tsx",
      "src/components/**/governance-model-factsheet-pdf.tsx",
      "src/components/**/implementation-variant-factsheet-pdf.tsx",
      "src/components/**/mobility-solution-factsheet-pdf.tsx",
    ],
    rules: {
      "jsx-a11y/alt-text": "off",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
