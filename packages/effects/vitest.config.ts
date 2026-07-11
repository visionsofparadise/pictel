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
                    include: ["src/**/*.unit.test.ts", "src/**/*.unit.test.tsx"],
                },
            },
            {
                resolve: {
                    alias: {
                        pictel: fileURLToPath(new URL("../pictel/src/index.ts", import.meta.url)),
                        "@pictel/effects": fileURLToPath(new URL("./src/index.ts", import.meta.url)),
                        "@pictel/ml": fileURLToPath(new URL("../ml/src/index.ts", import.meta.url)),
                    },
                },
                define: {
                    "import.meta.env.PICTEL_UPDATE_BASELINES": JSON.stringify(process.env.PICTEL_UPDATE_BASELINES ?? ""),
                },
                publicDir: "integration-fixtures/assets",
                test: {
                    name: "integration",
                    globals: true,
                    include: ["integration-fixtures/*.integration.test.tsx"],
                    testTimeout: 90000,
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        instances: [{ browser: "chromium" }],
                        headless: true,
                        screenshotFailures: false,
                    },
                },
            },
            {
                resolve: {
                    alias: {
                        pictel: fileURLToPath(new URL("../pictel/src/index.ts", import.meta.url)),
                        "@pictel/effects": fileURLToPath(new URL("./src/index.ts", import.meta.url)),
                        "@pictel/ml": fileURLToPath(new URL("../ml/src/index.ts", import.meta.url)),
                    },
                },
                define: {
                    "import.meta.env.PICTEL_UPDATE_BASELINES": JSON.stringify(process.env.PICTEL_UPDATE_BASELINES ?? ""),
                },
                publicDir: "integration-fixtures/assets",
                test: {
                    name: "heavy",
                    globals: true,
                    include: ["integration-fixtures/*.integration.heavy.test.tsx"],
                    testTimeout: 90000,
                    fileParallelism: false,
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        instances: [{ browser: "chromium" }],
                        headless: true,
                        screenshotFailures: false,
                    },
                },
            },
        ],
    },
});
