import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-files',
  use: {
    video: 'on',
    trace: 'on',
    // Run tests in headless mode for sandbox compatibility
    headless: true,
    // Add 1 second delay between actions for viewable videos
    slowMo: 1000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});