import { test, expect } from '@playwright/test';

test('Error handling demo - API failure and recovery', async ({ page }) => {
  await test.step('navigate to app and enter topic', async () => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('textarea[placeholder="Type anything..."]');
    await page.fill('textarea[placeholder="Type anything..."]', 'JavaScript Functions');
    await page.click('button:has-text("Next")');
  });

  await test.step('navigate through preferences screen', async () => {
    // Wait for any text that indicates we're on the preferences screen
    await page.waitForSelector('text=How do you learn best?', { timeout: 10000 });
    await page.locator('button:has-text("Visual")').first().click();
    await page.click('button:has-text("Next")');
  });

  await test.step('reach depth selection screen', async () => {
    await page.waitForSelector('text=How deep should we go?', { timeout: 10000 });
    await expect(page.locator('text=How deep should we go?')).toBeVisible();
  });

  await test.step('simulate API failure and verify error handling', async () => {
    // Intercept API to cause failure
    await page.route('**/api/generate-plan', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.click('button:has-text("Normal")');
    
    // Should show error message and stay on depth selection screen
    await page.waitForSelector('text=Server error', { timeout: 15000 });
    await expect(page.locator('text=How deep should we go?')).toBeVisible();
  });

  await test.step('recover from error and complete flow', async () => {
    // Remove the error-causing route
    await page.unroute('**/api/generate-plan');
    
    // Try again - should work now
    await page.click('button:has-text("Normal")');
    
    // Should successfully reach lesson plan
    await page.waitForSelector('text=Your Learning Plan', { timeout: 20000 });
    await expect(page.locator('text=Your Learning Plan')).toBeVisible();
    await expect(page.locator('button:has-text("Start Learning")')).toBeVisible();
  });

  await test.step('test lesson content error handling', async () => {
    // Intercept content generation to cause failure
    await page.route('**/api/generate-content', (route) => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Rate limit exceeded' })
      });
    });

    await page.click('button:has-text("Start Learning")');
    
    // Should show rate limit error and return to lesson plan
    await page.waitForSelector('text=Too many requests', { timeout: 15000 });
    await expect(page.locator('text=Your Learning Plan')).toBeVisible();
  });

  await test.step('demonstrate successful recovery', async () => {
    // Remove error route
    await page.unroute('**/api/generate-content');
    
    // Try starting lesson again
    await page.click('button:has-text("Start Learning")');
    
    // Should reach lesson content screen
    await page.waitForSelector('text=Lesson 1 of', { timeout: 20000 });
    await expect(page.locator('text=What you\'ll learn:')).toBeVisible();
  });
});