import { test, expect } from '@playwright/test';

test.describe('Green Button Implementation', () => {
  // Setup basic auth for all tests
  test.use({
    httpCredentials: {
      username: 'learnify',
      password: 'agihouse'
    }
  });

  test('Topic Selection Next button should be green', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for the topic selection screen to load
    await expect(page.locator('h1:has-text("What do you want to learn?")')).toBeVisible();
    
    // Enter a topic to enable the Next button
    const textarea = page.locator('textarea[placeholder="Type anything..."]');
    await textarea.fill('JavaScript fundamentals');
    
    // Check if the Next button has green background
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeVisible();
    await expect(nextButton).toHaveClass(/bg-green-500/);
    await expect(nextButton).toHaveClass(/hover:bg-green-600/);
  });

  test('Depth Selection Next button should be green', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Navigate to depth selection
    const textarea = page.locator('textarea[placeholder="Type anything..."]');
    await textarea.fill('Python programming');
    
    const topicNextButton = page.locator('button:has-text("Next")');
    await topicNextButton.click();
    
    // Wait for depth selection screen
    await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
    
    // Check if the Next button has green background
    const depthNextButton = page.locator('button:has-text("Next")');
    await expect(depthNextButton).toBeVisible();
    await expect(depthNextButton).toHaveClass(/bg-green-500/);
    await expect(depthNextButton).toHaveClass(/hover:bg-green-600/);
  });

  test('Complete flow - buttons should be green throughout', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Topic Selection
    const textarea = page.locator('textarea[placeholder="Type anything..."]');
    await textarea.fill('React components');
    
    const topicNextButton = page.locator('button:has-text("Next")');
    await expect(topicNextButton).toHaveClass(/bg-green-500/);
    await topicNextButton.click();
    
    // Depth Selection  
    await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
    
    // Select a depth level (Normal is selected by default)
    const depthNextButton = page.locator('button:has-text("Next")');
    await expect(depthNextButton).toHaveClass(/bg-green-500/);
    await depthNextButton.click();
    
    // Wait for generating plan screen
    await expect(page.locator('h1:has-text("Generating Lesson Plan")')).toBeVisible({ timeout: 10000 });
    
    // Wait for lesson plan screen (may take some time due to API call)
    await expect(page.locator('h1:has-text("Your Learning Path")')).toBeVisible({ timeout: 60000 });
    
    // Check Start Learning button is green
    const startButton = page.locator('button:has-text("Start Learning")');
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveClass(/bg-green-500/);
    await expect(startButton).toHaveClass(/hover:bg-green-600/);
  });

  test('Button states and interactions work correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Initially Next button should be disabled when textarea is empty
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeDisabled();
    await expect(nextButton).toHaveClass(/disabled:bg-gray-200/);
    
    // After typing, button should be enabled and green
    const textarea = page.locator('textarea[placeholder="Type anything..."]');
    await textarea.fill('Machine Learning');
    
    await expect(nextButton).toBeEnabled();
    await expect(nextButton).toHaveClass(/bg-green-500/);
    
    // Hover effect should work (green-600 on hover)
    await nextButton.hover();
    // Note: Hover effects might not be easily testable in Playwright, but we can verify the class exists
    await expect(nextButton).toHaveClass(/hover:bg-green-600/);
  });
});