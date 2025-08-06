import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: '/workspace/test-videos',
  use: {
    video: 'on',
    trace: 'on',
    headless: true,
    screenshot: 'on',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  reporter: [
    ['json', { outputFile: '/workspace/test-videos/playwright-results-upload_to_pr.json' }],
    ['html', { outputFolder: '/workspace/test-results/html-report' }]
  ],
});