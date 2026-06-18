import {defineConfig, devices} from "@playwright/test";

// E2E config for the PokerFlip squeeze/peel component.
// Boots the Vite dev server on a fixed port and runs the specs in e2e/.
export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? "line" : "list",
    use: {
        baseURL: "http://localhost:5173",
        trace: "on-first-retry",
    },
    projects: [
        {name: "chromium", use: {...devices["Desktop Chrome"]}},
    ],
    webServer: {
        command: "npx vite --port 5173 --strictPort",
        url: "http://localhost:5173/",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
