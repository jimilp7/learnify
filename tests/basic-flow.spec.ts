import { test, expect } from '@playwright/test';

test('basic learning style flow should work', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Step 1: Topic Selection
  const topicTextarea = page.locator('textarea[placeholder="Type anything..."]');
  await expect(topicTextarea).toBeVisible();
  await topicTextarea.fill('JavaScript basics');
  
  // Click Next button
  const nextButton = page.locator('button:has-text("Next")');
  await nextButton.click();
  
  // Step 2: Depth Selection
  await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
  const normalDepth = page.locator('button:has-text("Normal")');
  await normalDepth.click();
  await nextButton.click();
  
  // Step 3: Learning Style Selection (NEW STEP)
  await expect(page.locator('h1:has-text("Learning Style?")')).toBeVisible();
  await expect(page.locator('text=Learning: JavaScript basics')).toBeVisible();
  
  // Check if all learning style options are present
  await expect(page.locator('button:has-text("Visual")')).toBeVisible();
  await expect(page.locator('button:has-text("Auditory")')).toBeVisible();
  await expect(page.locator('button:has-text("Hands-on")')).toBeVisible();
  await expect(page.locator('button:has-text("Reading")')).toBeVisible();
  
  // Select Visual learning style
  const visualStyle = page.locator('button:has-text("Visual")');
  await visualStyle.click();
  await nextButton.click();
  
  // Should go to Generating Plan screen
  await expect(page.locator('h1:has-text("Generating Lesson Plan")')).toBeVisible();
  
  // Wait for the spinner to appear
  await expect(page.locator('.animate-spin')).toBeVisible();
  
  console.log('✅ Basic learning style flow completed successfully!');
});