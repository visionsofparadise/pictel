import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    passWithNoTests: true,
    exclude: ["**/*.integration.test.ts", "**/*.integration.test.tsx", "**/node_modules/**", "**/dist/**"],
  },
});
