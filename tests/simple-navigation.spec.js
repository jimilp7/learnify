// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Simple Navigation Flow', () => {
  test('basic app navigation with new learning style step', async ({ page }) => {
    await page.goto('/');
    
    // Topic Selection
    await expect(page.locator('h1')).toContainText('What do you want to learn?');
    await page.locator('textarea').fill('Test Topic');
    await page.locator('button', { hasText: 'Next' }).click();
    
    // Depth Selection  
    await expect(page.locator('h1')).toContainText('How deep?');
    await page.locator('button', { hasText: 'Normal' }).click();
    await page.locator('button', { hasText: 'Next' }).click();
    
    // Learning Style Selection (NEW STEP)
    await expect(page.locator('h1')).toContainText('How do you learn?');
    await expect(page.locator('button', { hasText: 'Visual' })).toHaveClass(/bg-purple-400/); // Default selection
    await page.locator('button', { hasText: 'Next' }).click();
    
    // Generating Plan
    await expect(page.locator('h1')).toContainText('Generating Lesson Plan');
  });
});