import { test, expect } from '@playwright/test';

test.describe('Learning Preferences Feature', () => {
  test('complete user flow through learning preferences', async ({ page }) => {
    await test.step('navigate to application', async () => {
      await page.goto('http://localhost:3000');
      await expect(page.locator('h2:has-text("Learnify")')).toBeVisible();
      await expect(page.locator('h1:has-text("What do you want to learn?")')).toBeVisible();
    });

    await test.step('enter learning topic', async () => {
      const topicInput = page.locator('textarea[placeholder*="Type anything"]');
      await expect(topicInput).toBeVisible();
      await topicInput.fill('JavaScript fundamentals');
      await expect(topicInput).toHaveValue('JavaScript fundamentals');
    });

    await test.step('proceed to learning preferences', async () => {
      const nextButton = page.locator('button:has-text("Next")');
      await expect(nextButton).toBeEnabled();
      await nextButton.click();
      await expect(page.locator('h1:has-text("How do you learn best?")')).toBeVisible();
      await expect(page.locator('p:has-text("Learning: JavaScript fundamentals")')).toBeVisible();
    });

    await test.step('select visual learning style', async () => {
      const visualOption = page.locator('button:has-text("Visual Learner")');
      await expect(visualOption).toBeVisible();
      await visualOption.click();
      await expect(visualOption).toHaveClass(/bg-purple-500/);
    });

    await test.step('select fast learning pace', async () => {
      const fastOption = page.locator('button:has-text("Move quickly")');
      await expect(fastOption).toBeVisible();
      await fastOption.click();
      await expect(fastOption).toHaveClass(/bg-red-500/);
    });

    await test.step('select high interactivity', async () => {
      const interactiveOption = page.locator('button:has-text("Interactive")');
      await expect(interactiveOption).toBeVisible();
      await interactiveOption.click();
      await expect(interactiveOption).toHaveClass(/bg-indigo-500/);
    });

    await test.step('select many examples', async () => {
      const manyExamplesOption = page.locator('button:has-text("Lots of examples")');
      await expect(manyExamplesOption).toBeVisible();
      await manyExamplesOption.click();
      await expect(manyExamplesOption).toHaveClass(/bg-emerald-500/);
    });

    await test.step('continue to depth selection', async () => {
      const continueButton = page.locator('button:has-text("Continue to Depth Selection")');
      await expect(continueButton).toBeEnabled();
      await continueButton.click();
      await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
      await expect(page.locator('p:has-text("Learning: JavaScript fundamentals")')).toBeVisible();
    });

    await test.step('select learning depth', async () => {
      const normalDepth = page.locator('button:has-text("Normal")').first();
      await expect(normalDepth).toBeVisible();
      await normalDepth.click();
      await expect(normalDepth).toHaveClass(/bg-green-500/);
    });

    await test.step('proceed to lesson plan generation', async () => {
      const nextButton = page.locator('button:has-text("Next")');
      await expect(nextButton).toBeEnabled();
      await nextButton.click();
      await expect(page.locator('h1:has-text("Generating your lesson plan...")')).toBeVisible();
    });

    await test.step('wait for lesson plan completion', async () => {
      // Wait for lesson plan to be generated (may take some time)
      await expect(page.locator('h1:has-text("Your Learning Journey")')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('[data-testid="lesson-card"]').first()).toBeVisible();
    });

    await test.step('verify lesson plan displays', async () => {
      // Check that lessons are displayed
      const lessonCards = page.locator('[data-testid="lesson-card"]');
      await expect(lessonCards).toHaveCount({ min: 3, max: 5 });
      
      // Check that start learning button is present
      const startButton = page.locator('button:has-text("Start Learning")');
      await expect(startButton).toBeVisible();
    });
  });

  test('back navigation works correctly', async ({ page }) => {
    await test.step('navigate to preferences page', async () => {
      await page.goto('http://localhost:3000');
      await page.locator('textarea').fill('React hooks');
      await page.locator('button:has-text("Next")').click();
      await expect(page.locator('h1:has-text("How do you learn best?")')).toBeVisible();
    });

    await test.step('navigate back to topic selection', async () => {
      const backButton = page.locator('button[aria-label="Go back"]').first();
      await backButton.click();
      await expect(page.locator('h1:has-text("What do you want to learn?")')).toBeVisible();
      await expect(page.locator('textarea')).toHaveValue('React hooks');
    });

    await test.step('navigate forward again and check preferences', async () => {
      await page.locator('button:has-text("Next")').click();
      await expect(page.locator('h1:has-text("How do you learn best?")')).toBeVisible();
      
      // Make selections
      await page.locator('button:has-text("Auditory Learner")').click();
      await page.locator('button:has-text("Take it slow")').click();
      
      await page.locator('button:has-text("Continue to Depth Selection")').click();
      await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
    });

    await test.step('navigate back to preferences and verify selections', async () => {
      const backButton = page.locator('button').first();
      await backButton.click();
      await expect(page.locator('h1:has-text("How do you learn best?")')).toBeVisible();
      
      // Verify previous selections are maintained
      await expect(page.locator('button:has-text("Auditory Learner")')).toHaveClass(/bg-blue-500/);
      await expect(page.locator('button:has-text("Take it slow")')).toHaveClass(/bg-green-500/);
    });
  });

  test('default preferences are properly set', async ({ page }) => {
    await test.step('navigate to preferences page', async () => {
      await page.goto('http://localhost:3000');
      await page.locator('textarea').fill('Python basics');
      await page.locator('button:has-text("Next")').click();
      await expect(page.locator('h1:has-text("How do you learn best?")')).toBeVisible();
    });

    await test.step('verify default selections', async () => {
      // Check default selections are highlighted
      await expect(page.locator('button:has-text("Auditory Learner")')).toHaveClass(/bg-blue-500/);
      await expect(page.locator('button:has-text("Regular pace")')).toHaveClass(/bg-blue-500/);
      await expect(page.locator('button:has-text("Balanced")')).toHaveClass(/bg-violet-500/);
      await expect(page.locator('button:has-text("Some examples")')).toHaveClass(/bg-teal-500/);
    });

    await test.step('continue with defaults', async () => {
      const continueButton = page.locator('button:has-text("Continue to Depth Selection")');
      await expect(continueButton).toBeEnabled();
      await continueButton.click();
      await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
    });
  });

  test('preferences validation works', async ({ page }) => {
    await test.step('navigate to preferences page', async () => {
      await page.goto('http://localhost:3000');
      await page.locator('textarea').fill('Data structures');
      await page.locator('button:has-text("Next")').click();
      await expect(page.locator('h1:has-text("How do you learn best?")')).toBeVisible();
    });

    await test.step('verify button is enabled with defaults', async () => {
      const continueButton = page.locator('button:has-text("Continue to Depth Selection")');
      await expect(continueButton).toBeEnabled();
    });

    await test.step('modify selections and continue', async () => {
      await page.locator('button:has-text("Hands-on Learner")').click();
      await page.locator('button:has-text("Move quickly")').click();
      await page.locator('button:has-text("Passive")').click();
      await page.locator('button:has-text("Focus on theory")').click();
      
      const continueButton = page.locator('button:has-text("Continue to Depth Selection")');
      await expect(continueButton).toBeEnabled();
      await continueButton.click();
      await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
    });
  });
});