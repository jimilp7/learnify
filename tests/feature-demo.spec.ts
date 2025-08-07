import { test, expect } from '@playwright/test';

test('Complete Learning Preferences Feature Demo', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Start at homepage
  await expect(page.locator('h2')).toContainText('Learnify');
  await expect(page.locator('h1')).toContainText('What do you want to learn?');
  
  // Fill in topic
  await page.fill('textarea', 'Machine Learning Fundamentals');
  await page.waitForTimeout(1000); // slowMo for video
  
  // Navigate to learning preferences
  await page.click('button:has-text("Next")');
  await expect(page.locator('h1')).toContainText('How do you learn best?');
  await expect(page.locator('p')).toContainText('Select all that apply');
  
  // Demonstrate all learning style options
  await expect(page.locator('text=Visual Learner')).toBeVisible();
  await expect(page.locator('text=Auditory Learner')).toBeVisible();  
  await expect(page.locator('text=Hands-on Learner')).toBeVisible();
  await expect(page.locator('text=Reading/Writing')).toBeVisible();
  await expect(page.locator('text=Social Learner')).toBeVisible();
  await expect(page.locator('text=Independent Learner')).toBeVisible();
  
  // Show that Next button is disabled initially
  await expect(page.locator('button:has-text("Next")')).toBeDisabled();
  
  // Select multiple learning preferences with pauses for video
  await page.click('button:has-text("Visual Learner")');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Hands-on Learner")');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Independent Learner")');
  await page.waitForTimeout(1000);
  
  // Verify selections are highlighted
  await expect(page.locator('button:has-text("Visual Learner")')).toHaveClass(/bg-blue-500/);
  await expect(page.locator('button:has-text("Hands-on Learner")')).toHaveClass(/bg-blue-500/);
  await expect(page.locator('button:has-text("Independent Learner")')).toHaveClass(/bg-blue-500/);
  
  // Demonstrate toggling - deselect one
  await page.click('button:has-text("Independent Learner")');
  await page.waitForTimeout(1000);
  await expect(page.locator('button:has-text("Independent Learner")')).toHaveClass(/bg-gray-50/);
  
  // Re-select it
  await page.click('button:has-text("Independent Learner")');
  await page.waitForTimeout(1000);
  
  // Show Next button is now enabled
  await expect(page.locator('button:has-text("Next")')).toBeEnabled();
  
  // Navigate to depth selection
  await page.click('button:has-text("Next")');
  await expect(page.locator('h1')).toContainText('How deep?');
  await expect(page.locator('text=Learning: Machine Learning Fundamentals')).toBeVisible();
  
  // Demonstrate back navigation
  await page.click('button svg');
  await expect(page.locator('h1')).toContainText('How do you learn best?');
  
  // Verify preferences are still selected
  await expect(page.locator('button:has-text("Visual Learner")')).toHaveClass(/bg-blue-500/);
  await expect(page.locator('button:has-text("Hands-on Learner")')).toHaveClass(/bg-blue-500/);
  await expect(page.locator('button:has-text("Independent Learner")')).toHaveClass(/bg-blue-500/);
  
  // Navigate forward again
  await page.click('button:has-text("Next")');
  await expect(page.locator('h1')).toContainText('How deep?');
});