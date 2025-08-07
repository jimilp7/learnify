import { test } from '@playwright/test';

test('capture learning preferences screenshot', async ({ page }) => {
  // Navigate to the preferences page
  await page.goto('http://localhost:3000');
  await page.locator('textarea').fill('TypeScript fundamentals');
  await page.locator('button:has-text("Next")').click();
  
  // Wait for the page to load and take screenshot
  await page.waitForSelector('h1:has-text("How do you learn best?")');
  await page.waitForTimeout(1000); // Let page settle
  
  // Take a full page screenshot
  await page.screenshot({ 
    path: 'test-files/learning-preferences-ui-upload_to_pr.png',
    fullPage: true
  });
});