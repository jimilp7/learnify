import { test, expect } from '@playwright/test';

test.describe('Progressive Audio Generation', () => {
  
  test('should allow immediate interaction after first paragraph audio is ready', async ({ page }) => {
    await test.step('navigate to the application', async () => {
      await page.goto('http://localhost:3000');
      await expect(page).toHaveTitle(/Learnify/);
    });

    await test.step('enter a topic to learn', async () => {
      const topicInput = page.getByPlaceholder('Type anything...');
      await topicInput.fill('JavaScript basics');
      
      const nextButton = page.getByRole('button', { name: 'Next' });
      await expect(nextButton).toBeEnabled();
      await nextButton.click();
    });

    await test.step('skip learning preferences', async () => {
      // Wait for learning preferences screen and proceed
      await page.waitForSelector('text=Learning Preferences', { timeout: 10000 });
      const continueButton = page.getByRole('button', { name: 'Continue' });
      await continueButton.click();
    });

    await test.step('select learning depth', async () => {
      // Wait for depth selection screen
      await page.waitForSelector('text=How deep should we go?', { timeout: 10000 });
      
      // Select "Simple" depth for faster testing
      const simpleOption = page.getByText('Simple');
      await simpleOption.click();
      
      const generateButton = page.getByRole('button', { name: 'Generate Plan' });
      await generateButton.click();
    });

    await test.step('wait for lesson plan generation', async () => {
      // Wait for plan generation
      await page.waitForSelector('text=Generating your personalized lesson plan...', { timeout: 5000 });
      
      // Wait for lesson plan to appear
      await page.waitForSelector('text=Start Learning', { timeout: 60000 });
      
      // Click "Start Learning" on the first lesson
      const startLearningButton = page.getByRole('button', { name: 'Start Learning' }).first();
      await startLearningButton.click();
    });

    await test.step('wait for content generation', async () => {
      // Wait for content generation screen
      await page.waitForSelector('text=Generating lesson content...', { timeout: 10000 });
      
      // Wait for lesson content to load
      await page.waitForSelector('text=What you\'ll learn:', { timeout: 60000 });
    });

    await test.step('verify progressive audio generation starts immediately', async () => {
      // Should show "Generating first audio segment..." initially
      await expect(page.getByText('Generating first audio segment...')).toBeVisible({ timeout: 5000 });
      
      // Wait for first paragraph audio to be ready (should be quick - under 10 seconds)
      // The "Generating first audio segment..." should disappear when ready
      await expect(page.getByText('Generating first audio segment...')).toBeHidden({ timeout: 15000 });
      
      // Should show background generation progress
      await expect(page.getByText(/Generating remaining audio in background/)).toBeVisible({ timeout: 2000 });
    });

    await test.step('verify audio player becomes interactive immediately', async () => {
      // Audio player should be available with hasAudio=true immediately after first paragraph
      const playButton = page.getByRole('button', { name: /play|pause/i });
      await expect(playButton).toBeVisible({ timeout: 2000 });
      await expect(playButton).toBeEnabled({ timeout: 2000 });
    });

    await test.step('verify paragraph status indicators work correctly', async () => {
      // First paragraph should have a green dot (completed)
      const firstParagraph = page.locator('[class*="prose"] > div').first();
      await expect(firstParagraph.locator('div.bg-green-500')).toBeVisible({ timeout: 2000 });
      
      // Should see generating indicators (spinning circles) for other paragraphs
      const generatingIndicators = page.locator('div.animate-spin').filter({ hasText: '' });
      await expect(generatingIndicators).toHaveCount({ min: 1 }, { timeout: 5000 });
    });

    await test.step('verify background generation progress updates', async () => {
      // Check that the progress indicator updates as more paragraphs are generated
      const progressText = page.getByText(/Generating remaining audio in background \(\d+\/\d+ ready\)/);
      await expect(progressText).toBeVisible();
      
      // Wait for progress to increase (this might take a while depending on TTS speed)
      // We'll wait for at least 2 paragraphs to be ready
      await expect(page.getByText(/\(2\/\d+ ready\)|\(3\/\d+ ready\)|\(4\/\d+ ready\)/)).toBeVisible({ timeout: 30000 });
    });

    await test.step('verify user can start playing immediately', async () => {
      // Click the play button to start audio
      const playButton = page.getByRole('button', { name: /play/i });
      await playButton.click();
      
      // Should switch to pause button
      await expect(page.getByRole('button', { name: /pause/i })).toBeVisible({ timeout: 2000 });
      
      // First paragraph should be highlighted during playback
      const firstParagraph = page.locator('[class*="prose"] > div').first();
      await expect(firstParagraph.locator('p.bg-blue-50')).toBeVisible({ timeout: 2000 });
    });

    await test.step('verify skeleton loaders for ungenerated paragraphs', async () => {
      // Should see skeleton loaders for paragraphs that haven't been generated yet
      const skeletonLoaders = page.locator('div.animate-pulse.bg-gray-200');
      await expect(skeletonLoaders).toHaveCount({ min: 1 }, { timeout: 2000 });
    });

    await test.step('verify error handling with retry functionality', async () => {
      // Check if any paragraphs failed (would show red retry button)
      const retryButtons = page.locator('button[title*="Retry audio generation"]');
      const retryCount = await retryButtons.count();
      
      if (retryCount > 0) {
        // If there are retry buttons, test the retry functionality
        const firstRetryButton = retryButtons.first();
        await firstRetryButton.click();
        
        // Should show generating status again
        await expect(page.locator('div.animate-spin').first()).toBeVisible({ timeout: 2000 });
      }
    });
  });

  test('should demonstrate significant performance improvement over sequential generation', async ({ page }) => {
    await test.step('measure time to first interaction', async () => {
      const startTime = Date.now();
      
      // Complete the lesson setup flow quickly
      await page.goto('http://localhost:3000');
      
      // Enter topic
      await page.getByPlaceholder('Type anything...').fill('Python basics');
      await page.getByRole('button', { name: 'Next' }).click();
      
      // Skip preferences
      await page.waitForSelector('text=Learning Preferences');
      await page.getByRole('button', { name: 'Continue' }).click();
      
      // Select simple depth
      await page.waitForSelector('text=How deep should we go?');
      await page.getByText('Simple').click();
      await page.getByRole('button', { name: 'Generate Plan' }).click();
      
      // Wait for plan and start learning
      await page.waitForSelector('text=Start Learning', { timeout: 60000 });
      await page.getByRole('button', { name: 'Start Learning' }).first().click();
      
      // Wait for content
      await page.waitForSelector('text=What you\'ll learn:', { timeout: 60000 });
      
      // Measure time until user can interact (play button enabled)
      await page.waitForSelector('button[class*="hasAudio"]:not([disabled])', { timeout: 15000 });
      
      const timeToInteraction = Date.now() - startTime;
      
      // Should be able to interact within 15 seconds after content loads
      // This is a massive improvement over the original 30-60 second wait
      console.log(`Time to first interaction: ${timeToInteraction}ms`);
      expect(timeToInteraction).toBeLessThan(15000); // Under 15 seconds from lesson content appearance
    });
  });

  test('should handle lesson navigation with audio cache', async ({ page }) => {
    await test.step('complete lesson setup and generate audio', async () => {
      await page.goto('http://localhost:3000');
      
      // Quick setup
      await page.getByPlaceholder('Type anything...').fill('React hooks');
      await page.getByRole('button', { name: 'Next' }).click();
      
      await page.waitForSelector('text=Learning Preferences');
      await page.getByRole('button', { name: 'Continue' }).click();
      
      await page.waitForSelector('text=How deep should we go?');
      await page.getByText('Simple').click();
      await page.getByRole('button', { name: 'Generate Plan' }).click();
      
      await page.waitForSelector('text=Start Learning', { timeout: 60000 });
      await page.getByRole('button', { name: 'Start Learning' }).first().click();
      
      await page.waitForSelector('text=What you\'ll learn:', { timeout: 60000 });
      
      // Wait for first audio to be ready
      await expect(page.getByText('Generating first audio segment...')).toBeHidden({ timeout: 15000 });
    });

    await test.step('navigate away and back to test caching', async () => {
      // Go back to lesson plan
      const backButton = page.locator('button').filter({ hasText: 'ArrowLeft' }).first();
      await backButton.click();
      
      // Should be back at lesson plan
      await expect(page.getByText('Start Learning')).toBeVisible({ timeout: 5000 });
      
      // Go back to the same lesson
      await page.getByRole('button', { name: 'Start Learning' }).first().click();
      
      // Should load much faster due to caching
      await page.waitForSelector('text=What you\'ll learn:', { timeout: 10000 });
      
      // Should immediately show cached audio without "Generating first audio segment..."
      const playButton = page.getByRole('button', { name: /play/i });
      await expect(playButton).toBeEnabled({ timeout: 3000 }); // Much faster with cache
    });
  });
});