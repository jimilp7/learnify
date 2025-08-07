import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-files',
  use: {
    // Enable video recording for ALL tests
    video: 'on',
    // Enable trace collection for debugging
    trace: 'on',
  },
  // Configure project-specific settings
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});