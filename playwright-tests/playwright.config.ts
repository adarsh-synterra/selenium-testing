import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the selenium-testing sample-app.
 *
 * Prerequisite: the sample-app dev server must be running.
 *
 *   cd ../sample-app
 *   npm run dev
 *
 * The dev server runs on port 3000 if free, otherwise 3001. Override with:
 *   BASE_URL=http://localhost:3001 npx playwright test
 *
 * Teaching note: in a fuller setup you would configure `webServer` here so
 * Playwright starts the dev server automatically. We're deferring that to
 * keep the first lesson focused on writing tests, not infra.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3001",
    // Capture trace on first retry — great for teaching how to debug failures.
    trace: "on-first-retry",
    // Screenshots and videos only on failure to keep artifacts small.
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Add firefox / webkit later. For teaching, one browser is enough to start.
  ],
});
