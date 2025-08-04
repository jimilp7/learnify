// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Learning Style Selection Feature', () => {
  test('should navigate through complete flow with learning style selection', async ({ page }) => {
    // Start from the home page
    await page.goto('/');
    
    // Step 1: Topic Selection
    await expect(page.locator('h1')).toContainText('What do you want to learn?');
    
    const topicInput = page.locator('textarea');
    await expect(topicInput).toBeVisible();
    await expect(topicInput).toBeFocused();
    
    await topicInput.fill('JavaScript fundamentals');
    
    const nextButton = page.locator('button', { hasText: 'Next' });
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    
    // Step 2: Depth Selection
    await expect(page.locator('h1')).toContainText('How deep?');
    await expect(page.locator('text=Learning: JavaScript fundamentals')).toBeVisible();
    
    // Select Normal depth
    const normalDepth = page.locator('button', { hasText: 'Normal' });
    await expect(normalDepth).toBeVisible();
    await normalDepth.click();
    
    await expect(normalDepth).toHaveClass(/bg-green-500/);
    
    const depthNextButton = page.locator('button', { hasText: 'Next' });
    await depthNextButton.click();
    
    // Step 3: Learning Style Selection (NEW FEATURE)
    await expect(page.locator('h1')).toContainText('How do you learn?');
    await expect(page.locator('text=JavaScript fundamentals • Normal (High School)')).toBeVisible();
    
    // Check all learning style options are present
    await expect(page.locator('button', { hasText: 'Visual' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Auditory' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Hands-on' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Analytical' })).toBeVisible();
    
    // Check default selection (Visual should be selected by default)
    const visualOption = page.locator('button', { hasText: 'Visual' });
    await expect(visualOption).toHaveClass(/bg-purple-400/);
    
    // Select a different learning style (Analytical)
    const analyticalOption = page.locator('button', { hasText: 'Analytical' });
    await analyticalOption.click();
    await expect(analyticalOption).toHaveClass(/bg-purple-700/);
    
    // Visual option should no longer be selected
    await expect(visualOption).not.toHaveClass(/bg-purple-400/);
    
    const learningStyleNextButton = page.locator('button', { hasText: 'Next' });
    await learningStyleNextButton.click();
    
    // Step 4: Generating Plan
    await expect(page.locator('h1')).toContainText('Generating your plan...');
    await expect(page.locator('text=JavaScript fundamentals')).toBeVisible();
    await expect(page.locator('text=Normal')).toBeVisible();
    
    // Wait for lesson plan to be generated (this may take time due to API call)
    await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 60000 });
    
    // Step 5: Lesson Plan should be displayed
    await expect(page.locator('text=JavaScript fundamentals')).toBeVisible();
    await expect(page.locator('text=Normal')).toBeVisible();
    
    // Should have lessons displayed
    const lessonElements = page.locator('[class*="lesson"], .lesson, div:has-text("min")').filter({ hasText: /\d+\s*min/ });
    await expect(lessonElements.first()).toBeVisible({ timeout: 10000 });
  });

  test('should allow back navigation from learning style to depth selection', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to learning style selection
    await page.locator('textarea').fill('React components');
    await page.locator('button', { hasText: 'Next' }).click();
    
    await page.locator('button', { hasText: 'Advanced' }).click();
    await page.locator('button', { hasText: 'Next' }).click();
    
    // Should be on learning style selection
    await expect(page.locator('h1')).toContainText('How do you learn?');
    
    // Click back button
    const backButton = page.locator('button').first(); // Arrow left button
    await backButton.click();
    
    // Should be back on depth selection
    await expect(page.locator('h1')).toContainText('How deep?');
    await expect(page.locator('text=Learning: React components')).toBeVisible();
  });

  test('should persist learning style selection when navigating back and forth', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to learning style selection
    await page.locator('textarea').fill('Python basics');
    await page.locator('button', { hasText: 'Next' }).click();
    
    await page.locator('button', { hasText: 'Simple' }).click();
    await page.locator('button', { hasText: 'Next' }).click();
    
    // Select Auditory learning style
    await page.locator('button', { hasText: 'Auditory' }).click();
    await expect(page.locator('button', { hasText: 'Auditory' })).toHaveClass(/bg-purple-500/);
    
    // Go back to depth selection
    await page.locator('button').first().click();
    
    // Go forward again to learning style
    await page.locator('button', { hasText: 'Next' }).click();
    
    // Auditory should still be selected
    await expect(page.locator('button', { hasText: 'Auditory' })).toHaveClass(/bg-purple-500/);
  });

  test('should display different learning style options with correct styling', async ({ page }) => {
    await page.goto('/');
    
    // Quick navigation to learning style selection
    await page.locator('textarea').fill('Web development');
    await page.locator('button', { hasText: 'Next' }).click();
    await page.locator('button', { hasText: 'Normal' }).click();
    await page.locator('button', { hasText: 'Next' }).click();
    
    // Test each learning style option
    const styles = [
      { name: 'Visual', emoji: '👁️', color: 'bg-purple-400' },
      { name: 'Auditory', emoji: '👂', color: 'bg-purple-500' },
      { name: 'Hands-on', emoji: '✋', color: 'bg-purple-600' },
      { name: 'Analytical', emoji: '🧠', color: 'bg-purple-700' }
    ];
    
    for (const style of styles) {
      const button = page.locator('button', { hasText: style.name });
      await expect(button).toBeVisible();
      await expect(button.locator('span', { hasText: style.emoji })).toBeVisible();
      
      // Click to select and check styling
      await button.click();
      await expect(button).toHaveClass(new RegExp(style.color));
      
      // Check text is white when selected
      await expect(button).toHaveClass(/text-white/);
    }
  });
});