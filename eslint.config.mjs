// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import nextConfig from "eslint-config-next";

/**
 * Feature Module Boundary Rules
 *
 * These rules enforce the import hierarchy defined in docs/module-map.md:
 *
 * | From Module          | Can Import                                    |
 * |---------------------|-----------------------------------------------|
 * | features/editor     | shared/*, lib/supabase                       |
 * | features/lessons    | shared/*, features/editor (public API)       |
 * | features/projects   | shared/*, features/editor, features/progress |
 * | features/progress   | shared/*, features/auth, lib/supabase        |
 * | features/auth       | shared/*, lib/supabase                       |
 * | features/navigation | shared/*, features/progress, features/auth   |
 * | shared/*            | lib/*                                        |
 * | lib/*               | Nothing                                      |
 * | app/*               | All features (public APIs), shared/*, lib/*  |
 *
 * Key principle: Features import other features only through their public
 * index.ts barrel exports, never from internal paths.
 */
const featureBoundaryRules = {
  files: ["src/features/**/*.{ts,tsx}"],
  rules: {
    // Warn on imports that bypass feature public APIs
    // These patterns detect imports into feature internals
    "no-restricted-imports": ["warn", {
      patterns: [
        {
          // Prevent importing from another feature's internal paths
          // Features should only import from @/features/*/index.ts
          group: ["@/features/*/components/*", "@/features/*/lib/*", "@/features/*/hooks/*"],
          message: "Import from the feature's public API (index.ts) instead of internal paths."
        },
        {
          // Prevent editor from importing other features (it's a leaf module)
          group: ["@/features/lessons*", "@/features/projects*", "@/features/progress*", "@/features/auth*", "@/features/navigation*"],
          message: "The editor feature should not import from other features. It's a foundational module."
        }
      ]
    }]
  }
};

const sharedBoundaryRules = {
  files: ["src/shared/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": ["warn", {
      patterns: [
        {
          // Shared modules cannot import from features
          group: ["@/features/*"],
          message: "Shared modules cannot import from features. Move shared code to src/shared/."
        }
      ]
    }]
  }
};

const libBoundaryRules = {
  files: ["src/lib/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": ["warn", {
      patterns: [
        {
          // lib modules cannot import from features or shared
          group: ["@/features/*", "@/shared/*"],
          message: "lib modules are foundational and cannot import from features or shared."
        }
      ]
    }]
  }
};

const eslintConfig = [
  {
    ignores: [".next/*", "node_modules/*"],
  },
  ...nextConfig,
  ...storybook.configs["flat/recommended"],
  featureBoundaryRules,
  sharedBoundaryRules,
  libBoundaryRules,
];

export default eslintConfig;
