import { test, expect } from '@playwright/test';

test.describe('Learning Preferences Demo', () => {
  test('demonstrates learning preferences feature flow', async ({ page }) => {
    await test.step('navigate to application', async () => {
      await page.goto('http://localhost:3000');
      await page.waitForSelector('h2:has-text("Learnify")');
      await page.waitForSelector('h1:has-text("What do you want to learn?")');
    });

    await test.step('enter learning topic', async () => {
      const topicInput = page.locator('textarea[placeholder*="Type anything"]');
      await topicInput.fill('JavaScript fundamentals');
      await page.waitForTimeout(1000); // For video clarity
    });

    await test.step('proceed to learning preferences', async () => {
      const nextButton = page.locator('button:has-text("Next")');
      await nextButton.click();
      await page.waitForSelector('h1:has-text("How do you learn best?")');
      await page.waitForTimeout(2000); // For video clarity
    });

    await test.step('select visual learning style', async () => {
      const visualOption = page.locator('button:has-text("Visual Learner")');
      await visualOption.click();
      await page.waitForTimeout(1000);
    });

    await test.step('select fast learning pace', async () => {
      const fastOption = page.locator('button:has-text("Move quickly")');
      await fastOption.scrollIntoViewIfNeeded();
      await fastOption.click();
      await page.waitForTimeout(1000);
    });

    await test.step('select high interactivity', async () => {
      const interactiveOption = page.locator('button:has-text("Interactive")');
      await interactiveOption.scrollIntoViewIfNeeded();
      await interactiveOption.click();
      await page.waitForTimeout(1000);
    });

    await test.step('select many examples', async () => {
      const manyExamplesOption = page.locator('button:has-text("Lots of examples")');
      await manyExamplesOption.scrollIntoViewIfNeeded();
      await manyExamplesOption.click();
      await page.waitForTimeout(1000);
    });

    await test.step('continue to depth selection', async () => {
      const continueButton = page.locator('button:has-text("Continue to Depth Selection")');
      await continueButton.scrollIntoViewIfNeeded();
      await continueButton.click();
      await page.waitForSelector('h1:has-text("How deep?")');
      await page.waitForTimeout(2000);
    });

    await test.step('select normal learning depth', async () => {
      const normalDepth = page.locator('button:has-text("Normal")').first();
      await normalDepth.click();
      await page.waitForTimeout(1000);
    });

    await test.step('start lesson plan generation', async () => {
      const nextButton = page.locator('button:has-text("Next")');
      await nextButton.click();
      await page.waitForSelector('h1:has-text("Generating your lesson plan...")');
      await page.waitForTimeout(3000); // Show generation screen
    });
  });

  test('demonstrates back navigation through preferences', async ({ page }) => {
    await test.step('navigate through the flow to depth selection', async () => {
      await page.goto('http://localhost:3000');
      await page.locator('textarea').fill('React hooks');
      await page.locator('button:has-text("Next")').click();
      
      // Set some preferences
      await page.locator('button:has-text("Auditory Learner")').click();
      await page.waitForTimeout(500);
      await page.locator('button:has-text("Take it slow")').click();
      await page.waitForTimeout(500);
      
      // Continue to depth
      await page.locator('button:has-text("Continue to Depth Selection")').click();
      await page.waitForSelector('h1:has-text("How deep?")');
      await page.waitForTimeout(1000);
    });

    await test.step('navigate back to preferences', async () => {
      const backButton = page.locator('button').first();
      await backButton.click();
      await page.waitForSelector('h1:has-text("How do you learn best?")');
      await page.waitForTimeout(2000);
    });

    await test.step('navigate back to topic selection', async () => {
      const backButton = page.locator('button[aria-label="Go back"]');
      await backButton.click();
      await page.waitForSelector('h1:has-text("What do you want to learn?")');
      await page.waitForTimeout(2000);
    });

    await test.step('verify topic is preserved', async () => {
      const topicInput = page.locator('textarea');
      await expect(topicInput).toHaveValue('React hooks');
      await page.waitForTimeout(1000);
    });
  });
});