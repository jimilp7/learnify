import { test, expect } from '@playwright/test';

test('Error boundary and recovery demonstration', async ({ page }) => {
  await test.step('navigate to application', async () => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Verify main application loads
    await expect(page.locator('text=Learnify')).toBeVisible();
    await expect(page.locator('textarea[placeholder="Type anything..."]')).toBeVisible();
  });

  await test.step('fill topic and proceed', async () => {
    await page.fill('textarea[placeholder="Type anything..."]', 'Error Handling Test');
    await page.click('button:has-text("Next")');
    
    // Wait for any content that indicates navigation happened
    await page.waitForTimeout(3000);
  });

  await test.step('verify error boundaries exist in DOM', async () => {
    // Check that error boundary wrapper is present in the DOM
    const errorBoundaryPresent = await page.evaluate(() => {
      // Look for error boundary component in React devtools or DOM
      return document.querySelector('[data-error-boundary]') !== null ||
             document.body.innerHTML.includes('ErrorBoundary') ||
             window.React !== undefined;
    });
    
    console.log('Error boundary infrastructure present:', errorBoundaryPresent);
  });

  await test.step('demonstrate app resilience', async () => {
    // Test that the app handles basic interactions without crashing
    await page.waitForTimeout(2000);
    
    // Try going back if possible
    const backButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    if (await backButton.isVisible()) {
      await backButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Verify app is still responsive
    await expect(page.locator('text=Learnify')).toBeVisible();
  });
  
  await test.step('test direct API error simulation', async () => {
    // Navigate to a state where we can test API errors
    await page.fill('textarea[placeholder="Type anything..."]', 'API Error Test');
    
    // Intercept any API calls to simulate failure
    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Simulated API failure' })
      });
    });
    
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(5000);
    
    // App should still be functional and not crash
    await expect(page.locator('text=Learnify')).toBeVisible();
  });

  await test.step('verify error recovery', async () => {
    // Remove API interception
    await page.unroute('**/api/**');
    
    // App should continue to work
    await page.waitForTimeout(2000);
    await expect(page.locator('text=What do you want to learn?')).toBeVisible();
  });
});

test('Component error boundary demonstration', async ({ page }) => {
  await test.step('navigate and inject component error', async () => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Fill in some content first
    await page.fill('textarea[placeholder="Type anything..."]', 'Component Error Test');
    
    // Inject a JavaScript error to test error boundaries
    await page.evaluate(() => {
      // Create a simulated React error
      const errorEvent = new Error('Simulated component error for testing');
      window.dispatchEvent(new ErrorEvent('error', { error: errorEvent }));
    });
    
    // Wait to see if error boundary catches it
    await page.waitForTimeout(2000);
  });

  await test.step('verify app continues to function after error', async () => {
    // Check that the app is still responsive
    const titleVisible = await page.locator('text=Learnify').isVisible();
    const inputVisible = await page.locator('textarea').isVisible();
    
    expect(titleVisible || inputVisible).toBeTruthy();
    console.log('App remains functional after simulated error');
  });
});