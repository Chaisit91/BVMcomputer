import { defineConfig } from '@playwright/test'

// API-only tests — no browser needed, Playwright's `request` fixture hits
// the real Express app directly. `reuseExistingServer` picks up the dev
// server already running during normal work instead of double-starting it.
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8080',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080/health',
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
