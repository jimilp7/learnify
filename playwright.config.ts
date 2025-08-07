import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-files',
  use: {
    // Enable video recording for ALL tests
    video: 'on',
    // Enable trace collection for debugging
    trace: 'on',
    // Run tests in headless mode for sandbox compatibility
    headless: true,
    // Add 1s delay between actions for viewable videos
    launchOptions: {
      slowMo: 1000,
    },
  },
  // Configure project-specific settings
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});