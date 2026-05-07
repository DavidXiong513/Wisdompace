import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/**",
    // Reference sub-projects (not part of main codebase):
    "fojin-master/**",
    "big-five-personality/**",
    "mbti-assessment/**",
    "depression-assessment-lowrisk/**",
    "skill-能力兴趣测评/**",
  ]),
]);

export default eslintConfig;
