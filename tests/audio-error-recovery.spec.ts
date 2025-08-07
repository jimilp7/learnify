import { test, expect } from '@playwright/test';

test.describe('Audio Error Recovery', () => {
  
  test.beforeEach(async ({ page }) => {
    // Complete the full flow to reach audio generation
    await page.goto('http://localhost:3000');
    await page.waitForSelector('textarea[placeholder="Type anything..."]');
    
    // Fill in topic
    await page.fill('textarea[placeholder="Type anything..."]', 'Audio Testing');
    await page.click('button:has-text("Next")');
    
    // Select preferences 
    await page.waitForSelector('text=Learning Preferences');
    await page.click('button:has-text("Auditory"):first');
    await page.click('button:has-text("Next")');
    
    // Select depth
    await page.waitForSelector('text=How deep should we go?');
    await page.click('button:has-text("Simple")');
    
    // Wait for lesson plan
    await page.waitForSelector('text=Your Learning Plan', { timeout: 15000 });
    await page.click('button:has-text("Start Learning")');
    
    // Should reach lesson content screen
    await page.waitForSelector('text=Lesson 1 of', { timeout: 15000 });
  });

  test('should show retry options when audio generation fails', async ({ page }) => {
    await test.step('intercept audio API to simulate failure', async () => {
      await page.route('**/api/generate-lesson-audio', (route) => {
        route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'TTS service unavailable' })
        });
      });

      // Wait for audio error to appear
      await page.waitForSelector('text=Audio Service Error', { timeout: 30000 });
    });

    await test.step('verify error UI elements', async () => {
      // Check error message is displayed
      await expect(page.locator('text=TTS service unavailable')).toBeVisible();
      
      // Check retry button with counter
      await expect(page.locator('button:has-text("Retry"):has-text("3 left")')).toBeVisible();
      
      // Check skip audio option
      await expect(page.locator('button:has-text("Skip Audio")')).toBeVisible();
      
      // Check reset option
      await expect(page.locator('button:has-text("Reset")')).toBeVisible();
    });

    await test.step('test retry functionality decrements counter', async () => {
      // Click retry
      await page.click('button:has-text("Retry"):has-text("3 left")');
      
      // Should show 2 retries left
      await page.waitForSelector('button:has-text("Retry"):has-text("2 left")', { timeout: 5000 });
      
      // Try again
      await page.click('button:has-text("Retry"):has-text("2 left")');
      
      // Should show 1 retry left
      await page.waitForSelector('button:has-text("Retry"):has-text("1 left")', { timeout: 5000 });
    });

    await test.step('test max retries reached behavior', async () => {
      // Use last retry
      await page.click('button:has-text("Retry"):has-text("1 left")');
      
      // After max retries, retry button should be disabled or gone
      await page.waitForTimeout(3000);
      const retryButton = page.locator('button:has-text("Retry")');
      const hasRetryButton = await retryButton.count() > 0;
      
      if (hasRetryButton) {
        // If button exists, it should be disabled
        await expect(retryButton).toBeDisabled();
      }
      
      // Skip and Reset should still be available
      await expect(page.locator('button:has-text("Skip Audio")')).toBeVisible();
      await expect(page.locator('button:has-text("Reset")')).toBeVisible();
    });
  });

  test('should allow skipping audio and continuing lesson', async ({ page }) => {
    await test.step('cause audio failure and skip', async () => {
      await page.route('**/api/generate-lesson-audio', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Audio generation failed' })
        });
      });

      await page.waitForSelector('text=Audio Generation Failed', { timeout: 30000 });
      await page.click('button:has-text("Skip Audio")');
    });

    await test.step('verify audio skipped state', async () => {
      // Should show audio skipped notification
      await page.waitForSelector('text=Audio skipped');
      await expect(page.locator('button:has-text("Enable Audio")')).toBeVisible();
      
      // Audio player should be disabled
      await expect(page.locator('.fixed.bottom-0')).toBeVisible(); // Player should still be there
      
      // Play button should be disabled since no audio
      const playButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      await expect(playButton).toBeDisabled();
    });

    await test.step('verify lesson content is still readable', async () => {
      // Text should still be visible and readable
      await expect(page.locator('text=What you\'ll learn:')).toBeVisible();
      
      // Should be able to navigate between lessons
      await expect(page.locator('text=Lesson 1 of')).toBeVisible();
    });
  });

  test('should reset audio generation successfully', async ({ page }) => {
    await test.step('cause audio failure', async () => {
      await page.route('**/api/generate-lesson-audio', (route) => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Bad request' })
        });
      });

      await page.waitForSelector('text=Audio Service Error', { timeout: 30000 });
      await expect(page.locator('button:has-text("Reset")')).toBeVisible();
    });

    await test.step('test reset functionality', async () => {
      // Remove the error-causing route
      await page.unroute('**/api/generate-lesson-audio');
      
      // Click reset
      await page.click('button:has-text("Reset")');
      
      // Should start generating audio again
      await page.waitForSelector('text=Generating audio...', { timeout: 5000 });
      
      // Eventually audio should load successfully (assuming normal API works)
      // We'll wait a bit to see if it recovers
      await page.waitForTimeout(10000);
      
      // Check that error message is gone
      await expect(page.locator('text=Audio Service Error')).not.toBeVisible();
    });
  });

  test('should handle network timeouts in audio generation', async ({ page }) => {
    await test.step('simulate timeout', async () => {
      await page.route('**/api/generate-lesson-audio', async (route) => {
        // Delay response beyond timeout threshold
        await new Promise(resolve => setTimeout(resolve, 35000));
        route.fulfill({
          status: 200,
          contentType: 'audio/wav',
          body: Buffer.alloc(1000) // Empty audio buffer
        });
      });

      // Should eventually show timeout error
      await page.waitForSelector('text=Connection Problem', { timeout: 45000 });
      await expect(page.locator('text=Request timed out')).toBeVisible();
    });

    await test.step('verify recovery from timeout', async () => {
      // Remove timeout route
      await page.unroute('**/api/generate-lesson-audio');
      
      // Try reset
      await page.click('button:has-text("Reset")');
      
      // Should start generating normally
      await page.waitForSelector('text=Generating audio...', { timeout: 5000 });
    });
  });

  test('should handle partial audio generation failures', async ({ page }) => {
    let callCount = 0;
    
    await test.step('simulate failure on second paragraph', async () => {
      await page.route('**/api/generate-lesson-audio', (route) => {
        callCount++;
        if (callCount === 1) {
          // First call succeeds
          route.fulfill({
            status: 200,
            contentType: 'audio/wav',
            body: Buffer.alloc(1000)
          });
        } else {
          // Second call fails
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Failed to generate audio for paragraph 2' })
          });
        }
      });

      // Wait for error to show up
      await page.waitForSelector('text=Audio Generation Failed', { timeout: 30000 });
      
      // Should show which paragraph failed
      await expect(page.locator('text=Error occurred at paragraph 2')).toBeVisible();
    });

    await test.step('verify partial content is still usable', async () => {
      // First paragraph should be generated (visual indicator)
      const paragraphs = page.locator('.prose p');
      const firstParagraph = paragraphs.first();
      
      // First paragraph should not be grayed out (has audio)
      await expect(firstParagraph).not.toHaveClass(/text-gray-400/);
      
      // Skip audio and continue
      await page.click('button:has-text("Skip Audio")');
      
      // All content should be readable now
      await expect(page.locator('text=Audio skipped')).toBeVisible();
    });
  });

  test('should enable audio after skipping', async ({ page }) => {
    await test.step('skip audio initially', async () => {
      await page.route('**/api/generate-lesson-audio', (route) => {
        route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Service unavailable' })
        });
      });

      await page.waitForSelector('text=Audio Service Error', { timeout: 30000 });
      await page.click('button:has-text("Skip Audio")');
      await page.waitForSelector('text=Audio skipped');
    });

    await test.step('re-enable audio generation', async () => {
      // Remove error-causing route
      await page.unroute('**/api/generate-lesson-audio');
      
      // Click enable audio
      await page.click('button:has-text("Enable Audio")');
      
      // Should start generating audio
      await page.waitForSelector('text=Generating audio...', { timeout: 5000 });
      
      // Skip notification should disappear
      await expect(page.locator('text=Audio skipped')).not.toBeVisible();
      
      // Audio player should become enabled once audio loads
      await page.waitForTimeout(8000); // Give time for audio to generate
      const playButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      
      // Play button should no longer be disabled (assuming audio generated successfully)
      const isDisabled = await playButton.isDisabled();
      if (!isDisabled) {
        // Audio successfully generated
        console.log('Audio generation recovered successfully');
      }
    });
  });

});