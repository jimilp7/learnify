import { test, expect } from '@playwright/test';

test('Complete user flow with learning preferences', async ({ page }) => {
  // Start from topic selection
  await page.goto('/');
  await expect(page.locator('h1:has-text("What do you want to learn?")')).toBeVisible();
  
  // Fill in a topic
  await page.fill('textarea[placeholder="Type anything..."]', 'Machine Learning');
  await page.click('button:has-text("Next")');
  
  // Now on preferences screen
  await expect(page.locator('h1:has-text("How do you learn best?")')).toBeVisible();
  await expect(page.locator('text=Learning: Machine Learning')).toBeVisible();
  
  // Select multiple learning preferences
  await page.click('button:has-text("Visual")');
  await page.click('button:has-text("Hands-on")');
  await page.click('button:has-text("Analytical")');
  
  // Verify selections
  await expect(page.locator('text=3 preferences selected')).toBeVisible();
  
  // Proceed to depth selection
  await page.click('button:has-text("Next")');
  
  // Now on depth selection screen
  await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
  await expect(page.locator('text=Learning: Machine Learning')).toBeVisible();
  
  // Test navigation back to preferences
  await page.locator('button').first().click();
  
  // Back on preferences, selections should be maintained
  await expect(page.locator('h1:has-text("How do you learn best?")')).toBeVisible();
  await expect(page.locator('text=3 preferences selected')).toBeVisible();
  
  // Verify all three preferences are still selected
  await expect(page.locator('button:has-text("Visual")')).toHaveClass(/bg-purple-500/);
  await expect(page.locator('button:has-text("Hands-on")')).toHaveClass(/bg-orange-500/);
  await expect(page.locator('button:has-text("Analytical")')).toHaveClass(/bg-indigo-500/);
  
  // Complete the flow by going back to depth selection
  await page.click('button:has-text("Next")');
  await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
  
  // Select a depth level
  await page.click('button:has-text("Normal")');
  await page.click('button:has-text("Next")');
  
  // Should proceed to the generating plan screen
  await expect(page.locator('text=Generating Lesson Plan')).toBeVisible();
});