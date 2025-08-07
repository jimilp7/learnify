import { test, expect } from '@playwright/test';

test.describe('Learning Preferences Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Navigate to preferences screen
    await page.fill('textarea[placeholder="Type anything..."]', 'JavaScript basics');
    await page.click('button:has-text("Next")');
    
    // Wait for preferences screen to load
    await expect(page.locator('h1:has-text("How do you learn best?")')).toBeVisible();
  });

  test('should display learning preferences screen with all options', async ({ page }) => {
    // Check if the main heading is visible
    await expect(page.locator('h1:has-text("How do you learn best?")')).toBeVisible();
    
    // Check if the description is visible
    await expect(page.locator('text=Select all that apply to personalize your experience')).toBeVisible();
    
    // Check if all learning style options are visible
    await expect(page.locator('text=Visual')).toBeVisible();
    await expect(page.locator('text=Auditory')).toBeVisible();
    await expect(page.locator('text=Hands-on')).toBeVisible();
    await expect(page.locator('text=Reading/Writing')).toBeVisible();
    await expect(page.locator('text=Logical')).toBeVisible();
    await expect(page.locator('text=Social')).toBeVisible();
    
    // Check if all emojis are visible
    await expect(page.locator('text=👁️')).toBeVisible();
    await expect(page.locator('text=🎧')).toBeVisible();
    await expect(page.locator('text=🤲')).toBeVisible();
    await expect(page.locator('text=📚')).toBeVisible();
    await expect(page.locator('text=🧮')).toBeVisible();
    await expect(page.locator('text=👥')).toBeVisible();
  });

  test('should disable Next button when no preferences are selected', async ({ page }) => {
    // Check that Next button is initially disabled
    await expect(page.locator('button:has-text("Next")')).toBeDisabled();
  });

  test('should enable Next button when at least one preference is selected', async ({ page }) => {
    // Click on Visual preference
    await page.click('text=Visual');
    
    // Check that Next button is now enabled
    await expect(page.locator('button:has-text("Next")')).toBeEnabled();
  });

  test('should allow selecting and deselecting multiple preferences', async ({ page }) => {
    // Select Visual preference
    await page.click('text=Visual');
    await expect(page.locator('text=1 preference selected')).toBeVisible();
    
    // Select Auditory preference
    await page.click('text=Auditory');
    await expect(page.locator('text=2 preferences selected')).toBeVisible();
    
    // Select Logical preference
    await page.click('text=Logical');
    await expect(page.locator('text=3 preferences selected')).toBeVisible();
    
    // Deselect Visual preference
    await page.click('text=Visual');
    await expect(page.locator('text=2 preferences selected')).toBeVisible();
    
    // Deselect all remaining preferences
    await page.click('text=Auditory');
    await page.click('text=Logical');
    
    // Next button should be disabled again
    await expect(page.locator('button:has-text("Next")')).toBeDisabled();
  });

  test('should highlight selected preferences with different colors', async ({ page }) => {
    // Select Visual preference 
    await page.click('text=Visual');
    
    // Check the visual styling changed (should have colored background)
    const visualButton = page.locator('button').filter({ hasText: 'Visual' });
    await expect(visualButton).toHaveClass(/bg-purple-400/);
    
    // Select Auditory preference
    await page.click('text=Auditory');
    
    // Check the auditory styling changed
    const auditoryButton = page.locator('button').filter({ hasText: 'Auditory' });
    await expect(auditoryButton).toHaveClass(/bg-blue-400/);
  });

  test('should navigate back to topic selection when back button is clicked', async ({ page }) => {
    // Click the back button
    await page.click('button >> svg');
    
    // Should navigate back to topic selection screen
    await expect(page.locator('h1:has-text("What do you want to learn?")')).toBeVisible();
  });

  test('should proceed to depth selection when Next is clicked with preferences selected', async ({ page }) => {
    // Select some preferences
    await page.click('text=Visual');
    await page.click('text=Auditory');
    
    // Click Next button
    await page.click('button:has-text("Next")');
    
    // Should navigate to depth selection screen
    await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
  });

  test('should maintain responsive design on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // All elements should still be visible
    await expect(page.locator('h1:has-text("How do you learn best?")')).toBeVisible();
    await expect(page.locator('text=Visual')).toBeVisible();
    await expect(page.locator('text=Auditory')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // All elements should still be visible
    await expect(page.locator('h1:has-text("How do you learn best?")')).toBeVisible();
    await expect(page.locator('text=Visual')).toBeVisible();
    await expect(page.locator('text=Auditory')).toBeVisible();
  });

  test('should complete full user flow from topic to depth via preferences', async ({ page }) => {
    // We're already on the preferences screen from beforeEach
    
    // Select multiple preferences
    await page.click('text=Visual');
    await page.click('text=Hands-on');
    await page.click('text=Logical');
    
    // Verify selection count
    await expect(page.locator('text=3 preferences selected')).toBeVisible();
    
    // Proceed to depth selection
    await page.click('button:has-text("Next")');
    
    // Should be on depth selection screen
    await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
    await expect(page.locator('text=Learning: JavaScript basics')).toBeVisible();
  });
});