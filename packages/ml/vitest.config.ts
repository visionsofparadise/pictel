import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        test: {
          name: "unit",
          globals: true,
          environment: "node",
          include: ["src/**/*.unit.test.ts"],
        },
      },
      {
        resolve: {
          alias: {
            pictel: fileURLToPath(new URL("../pictel/src/index.ts", import.meta.url)),
            "@pictel/ml": fileURLToPath(new URL("./src/index.ts", import.meta.url)),
          },
          dedupe: ["react", "react-dom"],
        },
        optimizeDeps: {
          include: ["react", "react-dom", "react/jsx-runtime", "react-dom/client", "@huggingface/transformers"],
        },
        test: {
          name: "heavy",
          globals: true,
          include: ["src/**/*.integration.heavy.test.ts", "src/**/*.integration.heavy.test.tsx"],
          testTimeout: 600_000,
          fileParallelism: false,
          browser: {
            enabled: true,
            provider: playwright({
              launchOptions: { channel: "chromium", args: ["--enable-unsafe-webgpu"] },
              persistentContext: "./.browser-profile",
            }),
            instances: [{ browser: "chromium" }],
            headless: true,
            screenshotFailures: false,
          },
        },
      },
    ],
  },
});
