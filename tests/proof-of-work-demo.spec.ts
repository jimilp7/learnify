import { test, expect } from '@playwright/test';

test.describe('Error Handling Proof of Work', () => {
  test.setTimeout(120000); // 2 minutes

  test('demonstrate comprehensive error handling and recovery features', async ({ page }) => {
    await test.step('navigate to learnify application', async () => {
      await page.goto('http://localhost:3002');
      await expect(page.locator('h1')).toContainText('What do you want to learn?');
    });

    await test.step('enter topic and proceed to preferences', async () => {
      const topicInput = page.locator('input[type="text"]').first();
      await topicInput.fill('Error Handling Test Topic');
      
      // Wait for the Next button to become enabled
      await page.waitForSelector('button:has-text("Next"):not([disabled])', { timeout: 10000 });
      await page.locator('button:has-text("Next")').click();
      
      // Wait for preferences page
      await expect(page.locator('h1')).toContainText('Customize Your Learning', { timeout: 15000 });
    });

    await test.step('complete preferences selection', async () => {
      // Select visual learner
      await page.locator('label:has-text("Visual Learner")').click();
      await page.waitForTimeout(1000);
      
      // Select regular pace  
      await page.locator('label:has-text("Regular pace")').click();
      await page.waitForTimeout(1000);
      
      // Select balanced interactivity
      await page.locator('label:has-text("Balanced")').click();
      await page.waitForTimeout(1000);
      
      // Select some examples
      await page.locator('label:has-text("Some examples")').click();
      await page.waitForTimeout(1000);
      
      // Click next
      await page.locator('button:has-text("Next")').click();
      
      // Wait for depth selection
      await expect(page.locator('h1')).toContainText('Choose your learning depth', { timeout: 15000 });
    });

    await test.step('test API error handling with server error', async () => {
      // Mock API failure for lesson plan generation
      await page.route('/api/generate-plan', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      // Select simple depth
      await page.locator('label:has-text("Simple")').click();
      await page.waitForTimeout(1000);
      
      // Trigger lesson plan generation
      await page.locator('button:has-text("Generate Learning Plan")').click();
      
      // Should show generating state first
      await expect(page.locator('text=Generating your personalized learning plan')).toBeVisible({ timeout: 10000 });
    });

    await test.step('verify error message appears and app stays functional', async () => {
      // Wait for error message to appear (with retries, this might take time)
      await expect(page.locator('text=Server error')).toBeVisible({ timeout: 90000 });
      
      // Should revert back to depth selection with error displayed
      await expect(page.locator('h1')).toContainText('Choose your learning depth');
      
      // Verify the error boundary didn't crash the app
      await expect(page.locator('label:has-text("Simple")')).toBeVisible();
      await expect(page.locator('button:has-text("Generate Learning Plan")')).toBeVisible();
    });

    await test.step('demonstrate retry functionality works', async () => {
      // Clear the mock and replace with successful response
      await page.unroute('/api/generate-plan');
      
      await page.route('/api/generate-plan', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            lessons: [
              {
                id: '1',
                title: 'Error Recovery Demo',
                description: 'This lesson demonstrates successful error recovery',
                duration: 4
              }
            ]
          })
        });
      });
      
      // Retry the lesson plan generation
      await page.locator('button:has-text("Generate Learning Plan")').click();
      
      // Should succeed this time
      await expect(page.locator('text=Your personalized learning plan is ready!')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('text=Error Recovery Demo')).toBeVisible();
    });

    await test.step('verify lesson plan page shows recovery success', async () => {
      // Verify we can see the lesson details
      await expect(page.locator('text=Error Recovery Demo')).toBeVisible();
      await expect(page.locator('text=This lesson demonstrates successful error recovery')).toBeVisible();
      
      // Start the lesson to test audio error handling
      await page.locator('button:has-text("Start Learning")').click();
    });

    await test.step('test audio generation error handling', async () => {
      // Mock content generation success
      await page.route('/api/generate-content', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: 'This is test content for audio error demonstration.\n\nThis is the second paragraph.\n\nAnd this is the final paragraph.'
          })
        });
      });
      
      // Mock audio generation failure
      await page.route('/api/generate-lesson-audio', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'TTS Service Unavailable' })
        });
      });
      
      // Wait for lesson content page
      await expect(page.locator('text=Error Recovery Demo')).toBeVisible({ timeout: 20000 });
    });

    await test.step('demonstrate audio error recovery options', async () => {
      // Wait for audio error message to appear
      await expect(page.locator('text=Audio Generation Failed')).toBeVisible({ timeout: 90000 });
      
      // Verify retry and skip options are available
      await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
      await expect(page.locator('button:has-text("Continue Reading")')).toBeVisible();
      
      // Test the skip audio functionality
      await page.locator('button:has-text("Continue Reading")').click();
      
      // Should show reading mode
      await expect(page.locator('text=Reading mode - Audio playback is disabled')).toBeVisible();
      
      // Content should be fully visible
      await expect(page.locator('text=This is test content')).toBeVisible();
      await expect(page.locator('text=This is the second paragraph')).toBeVisible();
      await expect(page.locator('text=And this is the final paragraph')).toBeVisible();
    });
  });
});