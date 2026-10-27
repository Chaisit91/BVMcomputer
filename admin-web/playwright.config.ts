import { defineConfig, devices } from '@playwright/test'

// Full browser E2E — both admin-web's own dev server and Backend-web's API
// must already be running (or get auto-started below) for these to pass.
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: 'npm run dev',
      cwd: '../Backend-web',
      url: 'http://localhost:8080/health',
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
})
