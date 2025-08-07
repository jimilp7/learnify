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
  // Prevent test directory collisions with unique reporting
  reporter: [
    ['list'],
    ['html', { outputFolder: './test-files/reports/playwright-report' }]
  ],
  // Configure project-specific settings with unique video directories
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Add timestamp to prevent directory collisions
        contextOptions: {
          recordVideo: {
            dir: `./test-files/videos-${Date.now()}/`,
          }
        }
      },
    },
  ],
});