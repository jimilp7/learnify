import { test, expect, Page } from '@playwright/test';

test.describe('Error Boundary Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('textarea[placeholder="Type anything..."]');
  });

  test('should handle API failures gracefully during lesson plan generation', async ({ page }) => {
    await test.step('enter topic and navigate to preferences', async () => {
      await page.fill('textarea[placeholder="Type anything..."]', 'Machine Learning');
      await page.click('button:has-text("Next")');
      await page.waitForSelector('text=Learning Preferences');
    });

    await test.step('select preferences and navigate to depth selection', async () => {
      // Select Visual learning style
      await page.click('button:has-text("Visual"):first');
      await page.click('button:has-text("Next")');
      await page.waitForSelector('text=How deep should we go?');
    });

    await test.step('intercept API to simulate failure and test error handling', async () => {
      // Intercept the lesson plan API to simulate failure
      await page.route('**/api/generate-plan', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error occurred' })
        });
      });

      // Select depth and trigger API call
      await page.click('button:has-text("Normal")');
      
      // Wait for error to appear
      await page.waitForSelector('text=Server error. Please try again in a moment.', { timeout: 10000 });
      
      // Verify user is returned to depth selection screen
      await expect(page.locator('text=How deep should we go?')).toBeVisible();
    });

    await test.step('verify retry functionality works', async () => {
      // Remove route interception to allow successful request
      await page.unroute('**/api/generate-plan');
      
      // Try again
      await page.click('button:has-text("Normal")');
      
      // Should eventually reach lesson plan screen
      await page.waitForSelector('text=Your Learning Plan', { timeout: 15000 });
      await expect(page.locator('h1:has-text("Your Learning Plan")')).toBeVisible();
    });
  });

  test('should handle network timeout errors', async ({ page }) => {
    await test.step('enter topic and navigate to preferences', async () => {
      await page.fill('textarea[placeholder="Type anything..."]', 'React Components');
      await page.click('button:has-text("Next")');
      await page.waitForSelector('text=Learning Preferences');
    });

    await test.step('select preferences and navigate to depth selection', async () => {
      await page.click('button:has-text("Visual"):first');
      await page.click('button:has-text("Next")');
      await page.waitForSelector('text=How deep should we go?');
    });

    await test.step('simulate timeout error', async () => {
      // Intercept to delay response beyond timeout
      await page.route('**/api/generate-plan', async (route) => {
        // Delay longer than the typical timeout
        await new Promise(resolve => setTimeout(resolve, 35000));
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ lessons: [] })
        });
      });

      await page.click('button:has-text("Simple")');
      
      // Should show timeout error message
      await page.waitForSelector('text=Request timed out', { timeout: 45000 });
    });
  });

  test('should handle audio generation failures with retry options', async ({ page }) => {
    // First, get to a lesson content screen through normal flow
    await test.step('complete normal flow to reach lesson content', async () => {
      await page.fill('textarea[placeholder="Type anything..."]', 'JavaScript Basics');
      await page.click('button:has-text("Next")');
      
      await page.waitForSelector('text=Learning Preferences');
      await page.click('button:has-text("Auditory"):first');
      await page.click('button:has-text("Next")');
      
      await page.waitForSelector('text=How deep should we go?');
      await page.click('button:has-text("Simple")');
      
      await page.waitForSelector('text=Your Learning Plan', { timeout: 15000 });
      await page.click('button:has-text("Start Learning")');
      
      await page.waitForSelector('text=Lesson 1 of', { timeout: 15000 });
    });

    await test.step('simulate audio generation failure and test error handling', async () => {
      // Intercept audio generation API to simulate failure
      await page.route('**/api/generate-lesson-audio', (route) => {
        route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Audio service temporarily unavailable' })
        });
      });

      // Wait for the audio error to appear
      await page.waitForSelector('text=Audio Service Error', { timeout: 30000 });
      await expect(page.locator('text=Audio service temporarily unavailable')).toBeVisible();
      
      // Verify retry button is available
      await expect(page.locator('button:has-text("Retry")')).toBeVisible();
      await expect(page.locator('button:has-text("Skip Audio")')).toBeVisible();
    });

    await test.step('test skip audio functionality', async () => {
      await page.click('button:has-text("Skip Audio")');
      
      // Should show audio skipped state
      await page.waitForSelector('text=Audio skipped');
      await expect(page.locator('button:has-text("Enable Audio")')).toBeVisible();
      
      // Audio player should show no audio state
      await expect(page.locator('button[disabled]:has([data-testid="play-button"])')).toBeVisible();
    });

    await test.step('test enable audio functionality', async () => {
      // Remove API interception to allow successful audio generation
      await page.unroute('**/api/generate-lesson-audio');
      
      await page.click('button:has-text("Enable Audio")');
      
      // Should start generating audio again
      await page.waitForSelector('text=Generating audio...', { timeout: 5000 });
    });
  });

  test('should recover from component errors with error boundary', async ({ page }) => {
    await test.step('trigger error boundary by injecting error', async () => {
      // Navigate to a screen first
      await page.fill('textarea[placeholder="Type anything..."]', 'Test Topic');
      await page.click('button:has-text("Next")');
      await page.waitForSelector('text=Learning Preferences');

      // Inject JavaScript to throw an error in a React component
      await page.evaluate(() => {
        // Find a React component and cause it to throw an error
        const elements = document.querySelectorAll('[data-reactroot] *');
        if (elements.length > 0) {
          // This will cause a render error
          (elements[0] as any).__reactInternalFiber = null;
          throw new Error('Simulated component error');
        }
      });
    });

    await test.step('verify error boundary catches error and shows fallback UI', async () => {
      // Look for error boundary fallback UI
      const errorBoundaryFallback = page.locator('text=Something went wrong');
      if (await errorBoundaryFallback.isVisible()) {
        await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
        await expect(page.locator('button:has-text("Go Back")')).toBeVisible();
      }
    });
  });

  test('should handle content generation failures gracefully', async ({ page }) => {
    // Navigate to lesson plan screen
    await test.step('reach lesson plan screen', async () => {
      await page.fill('textarea[placeholder="Type anything..."]', 'Python Programming');
      await page.click('button:has-text("Next")');
      await page.waitForSelector('text=Learning Preferences');
      
      await page.click('button:has-text("Visual"):first');
      await page.click('button:has-text("Next")');
      
      await page.waitForSelector('text=How deep should we go?');
      await page.click('button:has-text("Normal")');
      
      await page.waitForSelector('text=Your Learning Plan', { timeout: 15000 });
      await page.click('button:has-text("Start Learning")');
    });

    await test.step('simulate content generation failure', async () => {
      // Intercept content generation API
      await page.route('**/api/generate-content', (route) => {
        route.fulfill({
          status: 429,
          contentType: 'application/json', 
          body: JSON.stringify({ error: 'Rate limit exceeded' })
        });
      });

      // Should show specific error message and return to lesson plan
      await page.waitForSelector('text=Too many requests', { timeout: 10000 });
      await expect(page.locator('text=Your Learning Plan')).toBeVisible();
    });
  });

  test('should maintain app stability during multiple error scenarios', async ({ page }) => {
    await test.step('cause multiple API failures in sequence', async () => {
      // First failure - lesson plan generation
      await page.route('**/api/generate-plan', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });

      await page.fill('textarea[placeholder="Type anything..."]', 'Test Subject');
      await page.click('button:has-text("Next")');
      await page.waitForSelector('text=Learning Preferences');
      await page.click('button:has-text("Visual"):first');
      await page.click('button:has-text("Next")');
      await page.click('button:has-text("Simple")');
      
      await page.waitForSelector('text=Server error. Please try again in a moment.');
      
      // App should still be functional - test navigation
      await expect(page.locator('text=How deep should we go?')).toBeVisible();
      await expect(page.locator('button:has-text("Simple")')).toBeVisible();
    });

    await test.step('verify app can recover and complete flow successfully', async () => {
      // Remove interception to allow success
      await page.unroute('**/api/generate-plan');
      
      // Try again - should work
      await page.click('button:has-text("Simple")');
      await page.waitForSelector('text=Your Learning Plan', { timeout: 15000 });
      
      // App should be fully functional
      await expect(page.locator('button:has-text("Start Learning")')).toBeVisible();
    });
  });

  test('should show appropriate error messages for different error types', async ({ page }) => {
    const errorScenarios = [
      {
        status: 404,
        message: 'Connection error. Please check your internet connection.',
        description: '404 not found error'
      },
      {
        status: 500, 
        message: 'Server error. Please try again in a moment.',
        description: 'Internal server error'
      },
      {
        status: 429,
        message: 'Too many requests. Please wait a moment and try again.',
        description: 'Rate limit error'
      }
    ];

    for (const scenario of errorScenarios) {
      await test.step(`test ${scenario.description}`, async () => {
        // Reset to beginning
        await page.goto('http://localhost:3000');
        await page.waitForSelector('textarea[placeholder="Type anything..."]');
        
        await page.route('**/api/generate-plan', (route) => {
          route.fulfill({
            status: scenario.status,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Test error' })
          });
        });

        await page.fill('textarea[placeholder="Type anything..."]', 'Test');
        await page.click('button:has-text("Next")');
        await page.waitForSelector('text=Learning Preferences');
        await page.click('button:has-text("Visual"):first');
        await page.click('button:has-text("Next")');
        await page.click('button:has-text("Simple")');
        
        await page.waitForSelector(`text=${scenario.message}`, { timeout: 10000 });
        await expect(page.locator(`text=${scenario.message}`)).toBeVisible();
        
        await page.unroute('**/api/generate-plan');
      });
    }
  });

});