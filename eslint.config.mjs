import nextConfig from "eslint-config-next";

export default [
  {
    ignores: [".next/*", "node_modules/*"],
  },
  ...nextConfig,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
];
