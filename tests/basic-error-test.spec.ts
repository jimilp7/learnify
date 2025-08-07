import { test, expect } from '@playwright/test';

test.describe('Basic Error Handling', () => {
  
  test('should show error message when API fails', async ({ page }) => {
    await test.step('navigate to app', async () => {
      await page.goto('http://localhost:3000');
      await page.waitForSelector('textarea[placeholder="Type anything..."]');
    });

    await test.step('complete topic and preferences', async () => {
      await page.fill('textarea[placeholder="Type anything..."]', 'Test Topic');
      await page.click('button:has-text("Next")');
      await page.waitForSelector('text=Learning Preferences', { timeout: 10000 });
      
      await page.click('button:has-text("Visual"):first');
      await page.click('button:has-text("Next")');
      await page.waitForSelector('text=How deep should we go?', { timeout: 10000 });
    });

    await test.step('simulate API failure', async () => {
      await page.route('**/api/generate-plan', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });

      await page.click('button:has-text("Simple")');
      
      // Should show error message
      await page.waitForSelector('text=Server error. Please try again in a moment.', { timeout: 15000 });
      await expect(page.locator('text=Server error. Please try again in a moment.')).toBeVisible();
    });

    await test.step('verify app recovers after removing error', async () => {
      await page.unroute('**/api/generate-plan');
      await page.click('button:has-text("Simple")');
      await page.waitForSelector('text=Your Learning Plan', { timeout: 20000 });
      await expect(page.locator('text=Your Learning Plan')).toBeVisible();
    });
  });

  test('should handle different error types appropriately', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('textarea[placeholder="Type anything..."]');
    
    await page.fill('textarea[placeholder="Type anything..."]', 'Test Topic');
    await page.click('button:has-text("Next")');
    await page.waitForSelector('text=Learning Preferences');
    
    await page.click('button:has-text("Visual"):first');
    await page.click('button:has-text("Next")');
    await page.waitForSelector('text=How deep should we go?');
    
    // Test 429 rate limit error
    await page.route('**/api/generate-plan', (route) => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Rate limited' })
      });
    });

    await page.click('button:has-text("Normal")');
    await page.waitForSelector('text=Too many requests', { timeout: 15000 });
    await expect(page.locator('text=Too many requests. Please wait a moment and try again.')).toBeVisible();
  });

});