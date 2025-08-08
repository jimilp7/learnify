import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';

test.describe('Error Recovery Demo', () => {
  test('demonstrate error boundaries and recovery mechanisms', async ({ page }) => {
    // Set longer timeout for this comprehensive test
    test.setTimeout(60000);

    await test.step('open app and verify initial load', async () => {
      await page.goto(BASE_URL);
      await expect(page.locator('h1')).toContainText('What do you want to learn?', { timeout: 10000 });
    });

    await test.step('mock all API endpoints for fast demo', async () => {
      // Mock lesson plan generation
      await page.route('/api/generate-plan', async route => {
        // Add small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            lessons: [
              {
                id: '1',
                title: 'Error Handling Basics',
                description: 'Learn how to handle errors gracefully in web applications',
                duration: 90
              },
              {
                id: '2',
                title: 'Recovery Strategies',
                description: 'Implement user-friendly error recovery patterns',
                duration: 120
              }
            ]
          })
        });
      });

      // Mock content generation
      await page.route('/api/generate-content', async route => {
        await new Promise(resolve => setTimeout(resolve, 800));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: `Error handling is crucial for user experience.

When applications encounter errors, they should fail gracefully rather than crashing completely.

Good error handling includes:
- Clear error messages
- Recovery options for users
- Fallback functionality when possible
- Logging for developers

React Error Boundaries provide a way to catch errors in component trees and show fallback UI instead of crashing the entire application.`
          })
        });
      });
    });

    await test.step('complete user flow quickly', async () => {
      // Fill topic
      await page.fill('textarea', 'Error Handling Best Practices');
      await page.click('button:has-text("Continue to Preferences")');
      
      // Skip to depth selection (preferences has defaults)
      await expect(page.locator('h1')).toContainText('How do you learn best?', { timeout: 5000 });
      await page.click('button:has-text("Continue to Depth Selection")');
      
      // Generate plan
      await expect(page.locator('h1')).toContainText('How deep should we go?', { timeout: 5000 });
      await page.click('button:has-text("Generate Learning Plan")');
      
      // Wait for lesson plan
      await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 15000 });
      await expect(page.locator('text=Error Handling Basics')).toBeVisible();
    });

    await test.step('start lesson and reach content', async () => {
      await page.click('button:has-text("Start Learning Journey")');
      await expect(page.locator('h1')).toContainText('Lesson 1 of 2', { timeout: 15000 });
      await expect(page.locator('text=Error Handling Basics')).toBeVisible();
    });

    await test.step('demonstrate audio error handling', async () => {
      // Mock audio API to fail initially
      let audioAttempts = 0;
      await page.route('/api/generate-lesson-audio', async route => {
        audioAttempts++;
        console.log(`Audio API attempt #${audioAttempts}`);
        
        if (audioAttempts <= 3) {
          // Fail first few attempts to show retry mechanism
          await route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Audio service temporarily unavailable',
              details: 'TTS service is experiencing high load. Please try again.',
              retryable: true,
              requestId: `attempt-${audioAttempts}`
            })
          });
        } else {
          // Eventually succeed to show recovery
          const dummyAudio = Buffer.alloc(1024);
          await route.fulfill({
            status: 200,
            contentType: 'audio/wav',
            body: dummyAudio
          });
        }
      });

      // Reload or refresh to trigger audio generation
      await page.reload();
      await expect(page.locator('h1')).toContainText('Lesson 1 of 2', { timeout: 10000 });
    });

    await test.step('verify error handling UI appears', async () => {
      // Should show loading first, then error
      const loadingState = page.locator('text=Generating audio');
      const errorState = page.locator('text=Audio Generation Failed');
      
      // Wait for either loading to appear or error state
      await Promise.race([
        expect(loadingState).toBeVisible({ timeout: 5000 }).catch(() => {}),
        expect(errorState).toBeVisible({ timeout: 10000 })
      ]);

      // Eventually should show error state
      await expect(errorState).toBeVisible({ timeout: 15000 });
      await expect(page.locator('text=Audio service temporarily unavailable')).toBeVisible();
    });

    await test.step('verify recovery options are available', async () => {
      // Should have both recovery options
      await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
      await expect(page.locator('button:has-text("Skip Audio & Read")')).toBeVisible();
      
      // Content should still be visible for reading
      await expect(page.locator('div.prose')).toBeVisible();
      await expect(page.locator('text=Error handling is crucial')).toBeVisible();
    });

    await test.step('test skip audio functionality', async () => {
      await page.click('button:has-text("Skip Audio & Read")');
      
      // Should show skipped state
      await expect(page.locator('text=Audio Skipped')).toBeVisible();
      await expect(page.locator('text=You can still read the lesson content')).toBeVisible();
      await expect(page.locator('button:has-text("Try Audio Again")')).toBeVisible();
      
      // Content should remain accessible
      await expect(page.locator('div.prose p')).toHaveCount.above(0);
    });

    await test.step('test retry from skipped state', async () => {
      await page.click('button:has-text("Try Audio Again")');
      
      // Should show retry in progress
      await expect(page.locator('text=Retrying audio generation')).toBeVisible({ timeout: 5000 });
      
      // Should eventually succeed (we set up mock to succeed after 3 attempts)
      await expect(page.locator('text=Audio Skipped')).toBeHidden({ timeout: 10000 });
      await expect(page.locator('text=Audio Generation Failed')).toBeHidden({ timeout: 5000 });
    });

    await test.step('verify app remains functional', async () => {
      // App should be fully functional - can navigate back
      await page.click('button:has(svg)'); // Back button
      await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 5000 });
      
      // Can start another lesson
      const startButtons = page.locator('button:has-text("Start")');
      if (await startButtons.count() > 1) {
        await startButtons.nth(1).click();
        await expect(page.locator('h1')).toContainText('Lesson 2 of 2', { timeout: 10000 });
      }
    });

    await test.step('demonstrate error boundary protection', async () => {
      // Throughout all errors, the app should never show blank screen
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('text=Lesson')).toBeVisible();
      
      // No JavaScript errors should crash the app
      const jsErrors: string[] = [];
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });
      
      // Trigger some interactions to ensure no crashes
      await page.click('button:has(svg)'); // Navigate back if possible
      
      // Verify no critical errors occurred
      const criticalErrors = jsErrors.filter(err => 
        err.includes('TypeError') || 
        err.includes('ReferenceError') ||
        err.includes('Cannot read')
      );
      
      expect(criticalErrors.length).toBe(0);
    });
  });
});