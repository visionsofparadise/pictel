import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { fileURLToPath } from "node:url";

export default defineConfig({
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
    test: {
        globals: true,
        include: ["integration-fixtures/*.integration.test.tsx"],
        passWithNoTests: true,
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
});
