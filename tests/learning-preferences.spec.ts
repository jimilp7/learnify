import { test, expect } from '@playwright/test';

test.describe('Learning Preferences Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should navigate from topic to preferences to depth', async ({ page }) => {
    // Start at topic selection
    await expect(page.locator('h1')).toContainText('What do you want to learn?');
    
    // Enter a topic
    await page.fill('textarea', 'JavaScript programming');
    await page.click('button:has-text("Next")');
    
    // Should now be on learning preferences page
    await expect(page.locator('h1')).toContainText('How do you learn best?');
    await expect(page.locator('p')).toContainText('Select all that apply');
    
    // Check that all learning style options are present
    await expect(page.locator('text=Visual Learner')).toBeVisible();
    await expect(page.locator('text=Auditory Learner')).toBeVisible();
    await expect(page.locator('text=Hands-on Learner')).toBeVisible();
    await expect(page.locator('text=Reading/Writing')).toBeVisible();
    await expect(page.locator('text=Social Learner')).toBeVisible();
    await expect(page.locator('text=Independent Learner')).toBeVisible();
    
    // Next button should be disabled initially
    await expect(page.locator('button:has-text("Next")')).toBeDisabled();
    
    // Select some learning preferences
    await page.click('button:has-text("Visual Learner")');
    await page.click('button:has-text("Hands-on Learner")');
    
    // Next button should now be enabled
    await expect(page.locator('button:has-text("Next")')).toBeEnabled();
    
    // Click Next to proceed to depth selection
    await page.click('button:has-text("Next")');
    
    // Should now be on depth selection page
    await expect(page.locator('h1')).toContainText('How deep?');
    await expect(page.locator('text=Learning: JavaScript programming')).toBeVisible();
  });

  test('should allow toggling learning preferences on and off', async ({ page }) => {
    // Navigate to learning preferences page
    await page.fill('textarea', 'Python programming');
    await page.click('button:has-text("Next")');
    
    // Select a preference
    const visualLearnerButton = page.locator('button:has-text("Visual Learner")');
    await visualLearnerButton.click();
    
    // Check that it's selected (should have blue background)
    await expect(visualLearnerButton).toHaveClass(/bg-blue-500/);
    
    // Click again to deselect
    await visualLearnerButton.click();
    
    // Check that it's deselected (should have gray background)
    await expect(visualLearnerButton).toHaveClass(/bg-gray-50/);
    
    // Next button should be disabled again
    await expect(page.locator('button:has-text("Next")')).toBeDisabled();
  });

  test('should allow selecting multiple preferences', async ({ page }) => {
    // Navigate to learning preferences page
    await page.fill('textarea', 'Data Science');
    await page.click('button:has-text("Next")');
    
    // Select multiple preferences
    await page.click('button:has-text("Visual Learner")');
    await page.click('button:has-text("Reading/Writing")');
    await page.click('button:has-text("Independent Learner")');
    
    // All three should be selected
    await expect(page.locator('button:has-text("Visual Learner")')).toHaveClass(/bg-blue-500/);
    await expect(page.locator('button:has-text("Reading/Writing")')).toHaveClass(/bg-blue-500/);
    await expect(page.locator('button:has-text("Independent Learner")')).toHaveClass(/bg-blue-500/);
    
    // Next button should be enabled
    await expect(page.locator('button:has-text("Next")')).toBeEnabled();
  });

  test('should navigate back to topic selection', async ({ page }) => {
    // Navigate to learning preferences page
    await page.fill('textarea', 'Machine Learning');
    await page.click('button:has-text("Next")');
    
    // Verify we're on preferences page
    await expect(page.locator('h1')).toContainText('How do you learn best?');
    
    // Click back button (arrow left icon)
    await page.click('button svg');
    
    // Should be back at topic selection
    await expect(page.locator('h1')).toContainText('What do you want to learn?');
    // Note: the topic field is cleared when navigating back, which is current expected behavior
    await expect(page.locator('textarea')).toBeVisible();
  });
});