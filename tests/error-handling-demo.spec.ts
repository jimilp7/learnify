import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';

test.describe('Error Handling Demo', () => {
  test('complete error handling demonstration', async ({ page }) => {
    await test.step('navigate to app and start learning journey', async () => {
      await page.goto(BASE_URL);
      await expect(page.locator('h1')).toContainText('What do you want to learn?');
    });

    await test.step('fill topic and proceed through flow', async () => {
      await page.fill('textarea', 'React Error Boundaries');
      await page.click('button:has-text("Continue to Preferences")');
      await expect(page.locator('h1')).toContainText('How do you learn best?');
    });

    await test.step('select preferences and continue', async () => {
      // Click continue with default preferences
      await page.click('button:has-text("Continue to Depth Selection")');
      await expect(page.locator('h1')).toContainText('How deep should we go?');
    });

    await test.step('mock API calls for controlled testing', async () => {
      // Mock lesson plan generation to succeed quickly
      await page.route('/api/generate-plan', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            lessons: [
              {
                id: 'lesson-1',
                title: 'Introduction to Error Boundaries',
                description: 'Learn the basics of React Error Boundaries and why they are important for robust applications.',
                duration: 90
              },
              {
                id: 'lesson-2', 
                title: 'Implementing Error Boundaries',
                description: 'Step-by-step guide to creating and using Error Boundaries in React applications.',
                duration: 120
              },
              {
                id: 'lesson-3',
                title: 'Error Recovery Patterns',
                description: 'Advanced patterns for error recovery and user-friendly error handling.',
                duration: 100
              }
            ]
          })
        });
      });

      // Mock lesson content generation to succeed
      await page.route('/api/generate-content', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: `React Error Boundaries are a powerful feature that allows you to catch JavaScript errors anywhere in your component tree.

Error boundaries work like a JavaScript catch block, but for components. They catch errors during rendering, in lifecycle methods, and in constructors of the whole tree below them.

Here are the key benefits of using Error Boundaries:
- Prevent your entire app from crashing due to errors in one component
- Provide a fallback UI when something goes wrong  
- Log error information for debugging and monitoring
- Improve user experience with graceful error handling

To create an Error Boundary, you need to define either getDerivedStateFromError or componentDidCatch lifecycle methods in a class component.`
          })
        });
      });
    });

    await test.step('generate lesson plan', async () => {
      await page.click('button:has-text("Generate Learning Plan")');
      await expect(page.locator('text=Generating your personalized learning plan')).toBeVisible();
      await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 10000 });
    });

    await test.step('verify lesson plan shows error boundary lessons', async () => {
      await expect(page.locator('text=Introduction to Error Boundaries')).toBeVisible();
      await expect(page.locator('text=Implementing Error Boundaries')).toBeVisible();
      await expect(page.locator('text=Error Recovery Patterns')).toBeVisible();
    });

    await test.step('start first lesson', async () => {
      await page.click('button:has-text("Start Learning Journey")');
      await expect(page.locator('text=Generating lesson content')).toBeVisible();
      await expect(page.locator('h1')).toContainText('Lesson 1 of 3', { timeout: 10000 });
    });

    await test.step('verify lesson content loads', async () => {
      await expect(page.locator('h1')).toContainText('Introduction to Error Boundaries');
      await expect(page.locator('text=What you\'ll learn:')).toBeVisible();
      await expect(page.locator('div.prose')).toBeVisible();
      await expect(page.locator('text=React Error Boundaries are a powerful feature')).toBeVisible();
    });

    await test.step('simulate audio generation failure', async () => {
      // Mock audio API to fail
      await page.route('/api/generate-lesson-audio', async route => {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Audio service temporarily unavailable',
            details: 'TTS service is experiencing high load',
            retryable: true,
            requestId: 'demo-error-123'
          })
        });
      });

      // Trigger a retry or refresh to see error handling
      await page.reload();
      await expect(page.locator('h1')).toContainText('Introduction to Error Boundaries', { timeout: 10000 });
    });

    await test.step('verify audio error handling UI', async () => {
      // Should show error state after audio generation attempts
      await expect(page.locator('text=Audio Generation Failed')).toBeVisible({ timeout: 15000 });
      await expect(page.locator('text=Audio service temporarily unavailable')).toBeVisible();
    });

    await test.step('test error recovery options', async () => {
      // Should show retry and skip options
      await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
      await expect(page.locator('button:has-text("Skip Audio & Read")')).toBeVisible();

      // Test skip audio functionality
      await page.click('button:has-text("Skip Audio & Read")');
      await expect(page.locator('text=Audio Skipped')).toBeVisible();
      await expect(page.locator('text=You can still read the lesson content below')).toBeVisible();
    });

    await test.step('verify lesson content remains accessible', async () => {
      // Content should still be readable even without audio
      await expect(page.locator('div.prose p')).toHaveCount.above(0);
      await expect(page.locator('text=React Error Boundaries are a powerful feature')).toBeVisible();
      
      // Should have option to retry audio
      await expect(page.locator('button:has-text("Try Audio Again")')).toBeVisible();
    });

    await test.step('test retry audio functionality', async () => {
      // Mock audio API to succeed on retry
      await page.route('/api/generate-lesson-audio', async route => {
        const audioBuffer = new ArrayBuffer(1024);
        await route.fulfill({
          status: 200,
          contentType: 'audio/wav',
          body: Buffer.from(audioBuffer)
        });
      });

      await page.click('button:has-text("Try Audio Again")');
      
      // Should show retry in progress
      await expect(page.locator('text=Retrying audio generation')).toBeVisible({ timeout: 5000 });
      
      // Audio skipped notice should disappear
      await expect(page.locator('text=Audio Skipped')).toBeHidden({ timeout: 10000 });
    });

    await test.step('verify navigation still works after errors', async () => {
      // Should be able to navigate back to lesson plan
      await page.click('button:has(svg), button[aria-label="Go back"]');
      await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 10000 });
      
      // Should be able to start a different lesson
      const startButtons = page.locator('button:has-text("Start")');
      const buttonCount = await startButtons.count();
      
      if (buttonCount > 1) {
        await startButtons.nth(1).click();
        await expect(page.locator('h1')).toContainText('Lesson 2 of 3', { timeout: 10000 });
        await expect(page.locator('text=Implementing Error Boundaries')).toBeVisible();
      }
    });

    await test.step('demonstrate error boundary protection', async () => {
      // The app should remain functional throughout all error scenarios
      // User should never see a blank page or app crash
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('text=Lesson')).toBeVisible();
    });
  });
});