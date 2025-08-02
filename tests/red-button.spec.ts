import { test, expect } from '@playwright/test';

test.describe('Red Next Button', () => {
  test('should display red Next button on Topic Selection page', async ({ page }) => {
    await page.goto('/');
    
    // Fill in topic to enable the button
    await page.fill('textarea', 'Machine Learning');
    
    // Find the Next button specifically in the form (not the dev tools)
    const nextButton = page.locator('button').filter({ hasText: /^Next$/ }).first();
    
    // Wait for button to be enabled
    await expect(nextButton).toBeEnabled();
    
    // Check that the button has red background color
    await expect(nextButton).toHaveClass(/bg-red-500/);
    
    // Verify hover state would be red-600
    await expect(nextButton).toHaveClass(/hover:bg-red-600/);
    
    // Take a screenshot for verification
    await page.screenshot({ path: '/workspace/test-videos/topic-selection-red-button.png' });
  });

  test('should display red Next button on Depth Selection page', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to depth selection
    await page.fill('textarea', 'JavaScript');
    await page.locator('button').filter({ hasText: /^Next$/ }).first().click();
    
    // Wait for depth selection page
    await expect(page.getByText('How deep?')).toBeVisible();
    
    // Find the Next button on depth selection
    const nextButton = page.locator('button').filter({ hasText: /^Next$/ }).first();
    
    // Check that the button has red background color
    await expect(nextButton).toHaveClass(/bg-red-500/);
    
    // Verify hover state would be red-600
    await expect(nextButton).toHaveClass(/hover:bg-red-600/);
    
    // Take a screenshot for verification
    await page.screenshot({ path: '/workspace/test-videos/depth-selection-red-button.png' });
  });

  test('should verify button interaction and visual state', async ({ page }) => {
    await page.goto('/');
    
    // Test topic selection flow
    await page.fill('textarea', 'React Development');
    const topicNextButton = page.locator('button').filter({ hasText: /^Next$/ }).first();
    
    // Hover over button to test hover state
    await topicNextButton.hover();
    
    // Click to proceed
    await topicNextButton.click();
    
    // Wait for depth selection
    await expect(page.getByText('How deep?')).toBeVisible();
    
    // Test depth selection button
    const depthNextButton = page.locator('button').filter({ hasText: /^Next$/ }).first();
    
    // Hover over depth button
    await depthNextButton.hover();
    
    // Take final screenshot showing both pages were successfully navigated with red buttons
    await page.screenshot({ path: '/workspace/test-videos/red-button-flow-complete.png' });
  });
});