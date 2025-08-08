import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';

test.describe('Error Boundaries and Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('Application Error Recovery', () => {
    test('should handle and recover from component errors with error boundary', async ({ page }) => {
      await test.step('navigate to topic selection', async () => {
        await expect(page.locator('h1')).toContainText('What do you want to learn?');
      });

      await test.step('start learning journey', async () => {
        await page.fill('textarea', 'JavaScript async programming');
        await page.click('button:has-text("Continue to Preferences")');
      });

      await test.step('select learning preferences', async () => {
        await expect(page.locator('h1')).toContainText('How do you learn best?');
        await page.click('button:has-text("Continue to Depth Selection")');
      });

      await test.step('select learning depth', async () => {
        await expect(page.locator('h1')).toContainText('How deep should we go?');
        await page.click('button:has-text("Generate Learning Plan")');
      });

      await test.step('verify loading state shows', async () => {
        await expect(page.locator('text=Generating your personalized learning plan')).toBeVisible();
      });

      await test.step('wait for lesson plan generation', async () => {
        await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 30000 });
      });

      await test.step('start first lesson', async () => {
        await page.click('button:has-text("Start Learning Journey")');
      });

      await test.step('verify lesson content loads', async () => {
        await expect(page.locator('h1')).toContainText('Lesson 1 of', { timeout: 20000 });
      });

      await test.step('verify error boundary contains errors gracefully', async () => {
        // Even if audio generation fails, the lesson content should still be readable
        await expect(page.locator('div.prose')).toBeVisible({ timeout: 10000 });
        
        // Check if error states are handled gracefully
        const errorMessage = page.locator('text=Audio Generation Failed');
        const skipButton = page.locator('button:has-text("Skip Audio & Read")');
        const retryButton = page.locator('button:has-text("Try Again")');
        
        if (await errorMessage.isVisible()) {
          console.log('Audio generation failed - testing error recovery options');
          await expect(skipButton).toBeVisible();
          await expect(retryButton).toBeVisible();
          
          // Test skip functionality
          await skipButton.click();
          await expect(page.locator('text=Audio Skipped')).toBeVisible();
          await expect(page.locator('div.prose')).toBeVisible();
        }
      });
    });

    test('should show retry options when audio generation fails', async ({ page }) => {
      // Mock audio generation failure by intercepting the API call
      await page.route('/api/generate-lesson-audio', async route => {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Audio service temporarily unavailable',
            details: 'TTS service is down',
            retryable: true,
            requestId: 'test-error-123'
          })
        });
      });

      await test.step('navigate to audio generation', async () => {
        await page.fill('textarea', 'React hooks tutorial');
        await page.click('button:has-text("Continue to Preferences")');
        await page.click('button:has-text("Continue to Depth Selection")');
        await page.click('button:has-text("Generate Learning Plan")');
        await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 30000 });
        await page.click('button:has-text("Start Learning Journey")');
        await expect(page.locator('h1')).toContainText('Lesson 1 of', { timeout: 20000 });
      });

      await test.step('verify error handling UI appears', async () => {
        await expect(page.locator('text=Audio Generation Failed')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('text=Audio service temporarily unavailable')).toBeVisible();
        await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
        await expect(page.locator('button:has-text("Skip Audio & Read")')).toBeVisible();
      });

      await test.step('test skip audio functionality', async () => {
        await page.click('button:has-text("Skip Audio & Read")');
        await expect(page.locator('text=Audio Skipped')).toBeVisible();
        await expect(page.locator('text=You can still read the lesson content below')).toBeVisible();
        await expect(page.locator('button:has-text("Try Audio Again")')).toBeVisible();
      });

      await test.step('verify lesson content is still accessible', async () => {
        await expect(page.locator('div.prose p')).toHaveCount.above(0);
        await expect(page.locator('div.prose p').first()).toBeVisible();
      });
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network error
      await page.route('/api/generate-lesson-audio', async route => {
        await route.abort('failed');
      });

      await test.step('navigate to lesson content', async () => {
        await page.fill('textarea', 'Node.js basics');
        await page.click('button:has-text("Continue to Preferences")');
        await page.click('button:has-text("Continue to Depth Selection")');
        await page.click('button:has-text("Generate Learning Plan")');
        await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 30000 });
        await page.click('button:has-text("Start Learning Journey")');
        await expect(page.locator('h1')).toContainText('Lesson 1 of', { timeout: 20000 });
      });

      await test.step('verify network error handling', async () => {
        // Should show loading initially, then error state
        const errorState = page.locator('text=Audio Generation Failed');
        await expect(errorState).toBeVisible({ timeout: 20000 });
        
        // Should have recovery options
        await expect(page.locator('button:has-text("Skip Audio & Read")')).toBeVisible();
      });
    });

    test('should handle API timeout errors', async ({ page }) => {
      // Mock slow API response
      await page.route('/api/generate-lesson-audio', async route => {
        // Delay response to simulate timeout
        await new Promise(resolve => setTimeout(resolve, 8000));
        await route.fulfill({
          status: 504,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Audio generation timed out',
            details: 'Request took too long to process',
            retryable: true
          })
        });
      });

      await test.step('navigate to lesson content', async () => {
        await page.fill('textarea', 'Python data structures');
        await page.click('button:has-text("Continue to Preferences")');
        await page.click('button:has-text("Continue to Depth Selection")');
        await page.click('button:has-text("Generate Learning Plan")');
        await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 30000 });
        await page.click('button:has-text("Start Learning Journey")');
        await expect(page.locator('h1')).toContainText('Lesson 1 of', { timeout: 20000 });
      });

      await test.step('verify timeout handling', async () => {
        await expect(page.locator('text=Generating audio...')).toBeVisible();
        await expect(page.locator('text=Audio Generation Failed')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
      });
    });

    test('should show retry progress and handle retry attempts', async ({ page }) => {
      let attemptCount = 0;
      
      await page.route('/api/generate-lesson-audio', async route => {
        attemptCount++;
        if (attemptCount <= 2) {
          // Fail first 2 attempts
          await route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Service temporarily unavailable',
              retryable: true
            })
          });
        } else {
          // Succeed on 3rd attempt - mock successful audio response
          const audioBuffer = new ArrayBuffer(1024);
          await route.fulfill({
            status: 200,
            contentType: 'audio/wav',
            body: Buffer.from(audioBuffer)
          });
        }
      });

      await test.step('navigate to lesson content', async () => {
        await page.fill('textarea', 'CSS Grid layout');
        await page.click('button:has-text("Continue to Preferences")');
        await page.click('button:has-text("Continue to Depth Selection")');
        await page.click('button:has-text("Generate Learning Plan")');
        await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 30000 });
        await page.click('button:has-text("Start Learning Journey")');
        await expect(page.locator('h1')).toContainText('Lesson 1 of', { timeout: 20000 });
      });

      await test.step('verify initial failure and retry', async () => {
        // Should eventually show error after retries
        await expect(page.locator('text=Audio Generation Failed')).toBeVisible({ timeout: 20000 });
        await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
      });

      await test.step('test manual retry', async () => {
        await page.click('button:has-text("Try Again")');
        
        // Should show retrying state
        await expect(page.locator('text=Retrying audio generation')).toBeVisible({ timeout: 5000 });
        
        // Should eventually succeed (3rd attempt)
        // Check that error state disappears and content is available
        await expect(page.locator('text=Audio Generation Failed')).toBeHidden({ timeout: 15000 });
        await expect(page.locator('div.prose p')).toBeVisible();
      });
    });

    test('should handle lesson content generation errors', async ({ page }) => {
      // Mock lesson content generation error
      await page.route('/api/generate-content', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Content generation failed',
            details: 'OpenAI API error'
          })
        });
      });

      await test.step('navigate to lesson plan', async () => {
        await page.fill('textarea', 'Machine learning basics');
        await page.click('button:has-text("Continue to Preferences")');
        await page.click('button:has-text("Continue to Depth Selection")');
        await page.click('button:has-text("Generate Learning Plan")');
        await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 30000 });
      });

      await test.step('start lesson and handle content error', async () => {
        await page.click('button:has-text("Start Learning Journey")');
        
        // Should show content generation loading
        await expect(page.locator('text=Generating lesson content')).toBeVisible();
        
        // Error boundary should catch content generation error
        // User should either see error message or be redirected back
        const errorBoundary = page.locator('text=Something went wrong');
        const backToLessons = page.locator('h1:has-text("Your Learning Plan")');
        
        await Promise.race([
          expect(errorBoundary).toBeVisible({ timeout: 15000 }),
          expect(backToLessons).toBeVisible({ timeout: 15000 })
        ]);
      });
    });

    test('should preserve user progress through errors', async ({ page }) => {
      await test.step('complete learning flow to lesson content', async () => {
        await page.fill('textarea', 'Docker containers');
        await page.click('button:has-text("Continue to Preferences")');
        await page.click('button:has-text("Continue to Depth Selection")');
        await page.click('button:has-text("Generate Learning Plan")');
        await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 30000 });
        await page.click('button:has-text("Start Learning Journey")');
        await expect(page.locator('h1')).toContainText('Lesson 1 of', { timeout: 20000 });
      });

      await test.step('verify user can navigate back and restart', async () => {
        // Should be able to go back to lesson plan
        await page.click('button[aria-label="Go back"], button:has(svg)');
        await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 10000 });
        
        // Should be able to start a different lesson
        const lessonButtons = page.locator('button:has-text("Start")');
        const lessonCount = await lessonButtons.count();
        
        if (lessonCount > 1) {
          await lessonButtons.nth(1).click();
          await expect(page.locator('h1')).toContainText('Lesson', { timeout: 20000 });
        }
      });
    });
  });
});