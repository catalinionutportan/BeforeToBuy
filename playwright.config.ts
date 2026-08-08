import { defineConfig, devices } from "@playwright/test";

const E2E_INTERNAL_SECRET =
  process.env.INTERNAL_API_SECRET ||
  process.env.CRON_SECRET ||
  "playwright-internal-api-secret-32chars!";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
    trace: "on-first-retry",
    extraHTTPHeaders: {
      Origin: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
    },
  },
  webServer: {
    command: "npx next start --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      CONSENT_SIGNING_SECRET:
        process.env.CONSENT_SIGNING_SECRET ||
        "playwright-consent-signing-secret-32-chars",
      CRON_SECRET: E2E_INTERNAL_SECRET,
      INTERNAL_API_SECRET: E2E_INTERNAL_SECRET,
      // Ensure CI `next start` (NODE_ENV=production) without Vercel KV stays usable.
      RATE_LIMIT_FAIL_OPEN: "1",
      // Avoid 120s evoMAG remote pulls during smoke — use checked-in sample feeds.
      FORCE_SAMPLE_FEEDS: "1",
    },
  },
});
