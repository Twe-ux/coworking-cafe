import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — CoworKing Café site-v2
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3002",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    // Desktop — navigation principale
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Mobile — responsive + PWA
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
    // Safari mobile — iOS PWA
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 15"] },
    },
  ],

  // Démarrer le serveur Next.js avant les tests
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3002",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
