import { test, expect } from '@playwright/test';

test.describe('Learning Preferences Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display learning preferences screen after topic selection', async ({ page }) => {
    // Navigate from topic to preferences
    await page.fill('textarea[placeholder="What would you like to learn?"]', 'JavaScript programming');
    await page.click('button:has-text("Next")');
    
    // Verify we're on preferences screen
    await expect(page.locator('h1:has-text("How do you learn best?")')).toBeVisible();
    await expect(page.locator('text=Learning: JavaScript programming')).toBeVisible();
    await expect(page.locator('text=Select all that apply')).toBeVisible();
  });

  test('should display all 6 learning preference options', async ({ page }) => {
    // Navigate to preferences screen
    await page.fill('textarea[placeholder="What would you like to learn?"]', 'React development');
    await page.click('button:has-text("Next")');
    
    // Verify all preference options are present
    await expect(page.locator('button:has-text("Visual")')).toBeVisible();
    await expect(page.locator('button:has-text("Auditory")')).toBeVisible();
    await expect(page.locator('button:has-text("Hands-on")')).toBeVisible();
    await expect(page.locator('button:has-text("Reading/Writing")')).toBeVisible();
    await expect(page.locator('button:has-text("Social")')).toBeVisible();
    await expect(page.locator('button:has-text("Independent")')).toBeVisible();
  });

  test('should allow single preference selection', async ({ page }) => {
    // Navigate to preferences screen
    await page.fill('textarea[placeholder="What would you like to learn?"]', 'Python basics');
    await page.click('button:has-text("Next")');
    
    // Select Visual preference
    await page.click('button:has-text("Visual")');
    
    // Verify visual feedback - button should have selected state
    const visualButton = page.locator('button:has-text("Visual")');
    await expect(visualButton).toHaveClass(/bg-purple-500/);
    
    // Verify Next button is enabled
    await expect(page.locator('button:has-text("Next")').last()).not.toBeDisabled();
  });

  test('should allow multiple preference selection', async ({ page }) => {
    // Navigate to preferences screen
    await page.fill('textarea[placeholder="What would you like to learn?"]', 'Data Science');
    await page.click('button:has-text("Next")');
    
    // Select multiple preferences
    await page.click('button:has-text("Visual")');
    await page.click('button:has-text("Hands-on")');
    await page.click('button:has-text("Reading/Writing")');
    
    // Verify all selected preferences have visual feedback
    await expect(page.locator('button:has-text("Visual")')).toHaveClass(/bg-purple-500/);
    await expect(page.locator('button:has-text("Hands-on")')).toHaveClass(/bg-orange-500/);
    await expect(page.locator('button:has-text("Reading/Writing")')).toHaveClass(/bg-emerald-500/);
    
    // Verify Next button is enabled
    await expect(page.locator('button:has-text("Next")').last()).not.toBeDisabled();
  });

  test('should allow deselecting preferences by clicking again', async ({ page }) => {
    // Navigate to preferences screen
    await page.fill('textarea[placeholder="What would you like to learn?"]', 'Machine Learning');
    await page.click('button:has-text("Next")');
    
    // Select and then deselect Visual preference
    await page.click('button:has-text("Visual")');
    await expect(page.locator('button:has-text("Visual")')).toHaveClass(/bg-purple-500/);
    
    await page.click('button:has-text("Visual")');
    await expect(page.locator('button:has-text("Visual")')).toHaveClass(/bg-gray-50/);
    
    // Verify Next button is disabled when no preferences selected
    await expect(page.locator('button:has-text("Next")').last()).toBeDisabled();
  });

  test('should disable Next button when no preferences are selected', async ({ page }) => {
    // Navigate to preferences screen
    await page.fill('textarea[placeholder="What would you like to learn?"]', 'Web Development');
    await page.click('button:has-text("Next")');
    
    // Verify Next button is initially disabled
    await expect(page.locator('button:has-text("Next")').last()).toBeDisabled();
    
    // Select a preference
    await page.click('button:has-text("Auditory")');
    
    // Verify Next button is now enabled
    await expect(page.locator('button:has-text("Next")').last()).not.toBeDisabled();
    
    // Deselect the preference
    await page.click('button:has-text("Auditory")');
    
    // Verify Next button is disabled again
    await expect(page.locator('button:has-text("Next")').last()).toBeDisabled();
  });

  test('should navigate to depth selection after preference selection', async ({ page }) => {
    // Navigate to preferences screen
    await page.fill('textarea[placeholder="What would you like to learn?"]', 'Node.js development');
    await page.click('button:has-text("Next")');
    
    // Select preferences and proceed
    await page.click('button:has-text("Visual")');
    await page.click('button:has-text("Hands-on")');
    await page.click('button:has-text("Next")').last();
    
    // Verify we're on depth selection screen
    await expect(page.locator('h1:has-text("What depth level?")')).toBeVisible();
    await expect(page.locator('text=Learning: Node.js development')).toBeVisible();
  });

  test('should have working back button navigation', async ({ page }) => {
    // Navigate to preferences screen
    await page.fill('textarea[placeholder="What would you like to learn?"]', 'CSS Flexbox');
    await page.click('button:has-text("Next")');
    
    // Verify we're on preferences screen
    await expect(page.locator('h1:has-text("How do you learn best?")')).toBeVisible();
    
    // Click back button
    await page.click('button[aria-label="Go back"]').or(page.locator('button').first());
    
    // Verify we're back on topic selection screen
    await expect(page.locator('h1:has-text("What would you like to learn?")')).toBeVisible();
    await expect(page.locator('textarea[placeholder="What would you like to learn?"]')).toHaveValue('CSS Flexbox');
  });

  test('should maintain state when navigating back and forth', async ({ page }) => {
    // Navigate to preferences screen
    await page.fill('textarea[placeholder="What would you like to learn?"]', 'TypeScript');
    await page.click('button:has-text("Next")');
    
    // Select some preferences
    await page.click('button:has-text("Visual")');
    await page.click('button:has-text("Reading/Writing")');
    
    // Navigate to depth selection
    await page.click('button:has-text("Next")').last();
    
    // Navigate back to preferences
    await page.click('button[aria-label="Go back"]').or(page.locator('button').first());
    
    // Verify preferences are still selected
    await expect(page.locator('button:has-text("Visual")')).toHaveClass(/bg-purple-500/);
    await expect(page.locator('button:has-text("Reading/Writing")')).toHaveClass(/bg-emerald-500/);
    await expect(page.locator('button:has-text("Next")').last()).not.toBeDisabled();
  });

  test('should complete full flow: topic -> preferences -> depth -> plan generation', async ({ page }) => {
    // Complete topic selection
    await page.fill('textarea[placeholder="What would you like to learn?"]', 'React Hooks');
    await page.click('button:has-text("Next")');
    
    // Complete preferences selection
    await page.click('button:has-text("Visual")');
    await page.click('button:has-text("Hands-on")');
    await page.click('button:has-text("Next")').last();
    
    // Complete depth selection
    await page.click('button:has-text("Normal")');
    
    // Verify we reach generating plan screen
    await expect(page.locator('h1:has-text("Generating your personalized lesson plan...")')).toBeVisible();
    await expect(page.locator('text=Topic: React Hooks')).toBeVisible();
    await expect(page.locator('text=Depth: Normal')).toBeVisible();
  }, { timeout: 60000 }); // Increased timeout for API calls

  test('should show visual feedback on hover and selection states', async ({ page }) => {
    // Navigate to preferences screen
    await page.fill('textarea[placeholder="What would you like to learn?"]', 'Vue.js');
    await page.click('button:has-text("Next")');
    
    const visualButton = page.locator('button:has-text("Visual")');
    
    // Test hover state
    await visualButton.hover();
    await expect(visualButton).toHaveClass(/hover:bg-gray-100/);
    
    // Test selection state
    await visualButton.click();
    await expect(visualButton).toHaveClass(/bg-purple-500/);
    await expect(visualButton).toHaveClass(/scale-\[1\.02\]/);
    
    // Verify emoji and selection indicator are present
    await expect(page.locator('span:has-text("👁️")')).toBeVisible();
    await expect(visualButton.locator('div.w-6.h-6.rounded-full.bg-white.bg-opacity-30')).toBeVisible();
  });
});