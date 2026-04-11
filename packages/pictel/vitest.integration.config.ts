import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
    test: {
        globals: true,
        include: ["src/integration/**/*.test.ts", "src/integration/**/*.test.tsx"],
        passWithNoTests: true,
        browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
            headless: true,
        },
    },
});
