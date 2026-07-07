import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test configuration for Firefly (Svitlyachok).
 * Tests assume backend is running on http://localhost:8080 and frontend on http://localhost:5173.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests serially to avoid DB race conditions
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1, // Single worker to avoid DB conflicts
  reporter: process.env.CI ? 'github' : 'list',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'cd firefly-fe && npm run dev',
      url: 'http://localhost:5173',
      timeout: 60 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
