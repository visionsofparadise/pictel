import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { fileURLToPath } from "node:url";

export default defineConfig({
    resolve: {
        alias: {
            pictel: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
            "@pictel/effects": fileURLToPath(new URL("../effects/src/index.ts", import.meta.url)),
        },
    },
    test: {
        globals: true,
        include: ["src/**/*.integration.test.ts", "src/**/*.integration.test.tsx"],
        setupFiles: ["./src/test-setup/clear-cache.ts"],
        passWithNoTests: true,
        browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
            headless: true,
            screenshotFailures: false,
        },
    },
});
