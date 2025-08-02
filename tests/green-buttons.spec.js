// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Green Next Buttons', () => {
  test('Topic Selection Next button should be green', async ({ page }) => {
    await page.goto('/');
    
    // Fill in topic to enable the button
    const topicTextarea = page.locator('textarea[placeholder="Type anything..."]');
    await topicTextarea.fill('Machine Learning');
    
    // Check the Next button has green styling
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeVisible();
    
    // Check if button has green background classes
    const buttonClass = await nextButton.getAttribute('class');
    expect(buttonClass).toContain('bg-green-500');
    expect(buttonClass).toContain('hover:bg-green-600');
    
    // Verify the button is enabled
    await expect(nextButton).toBeEnabled();
    
    // Click to proceed to next screen
    await nextButton.click();
    
    // Verify we moved to depth selection
    await expect(page.locator('text=How deep?')).toBeVisible();
  });

  test('Depth Selection Next button should be green', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to depth selection
    const topicTextarea = page.locator('textarea[placeholder="Type anything..."]');
    await topicTextarea.fill('JavaScript Fundamentals');
    await page.locator('button:has-text("Next")').click();
    
    // Wait for depth selection screen
    await expect(page.locator('text=How deep?')).toBeVisible();
    
    // Select a depth option (Normal is selected by default)
    const normalOption = page.locator('button:has-text("Normal")');
    await normalOption.click();
    
    // Check the Next button has green styling
    const nextButton = page.locator('button:has-text("Next")').last();
    await expect(nextButton).toBeVisible();
    
    // Check if button has green background classes
    const buttonClass = await nextButton.getAttribute('class');
    expect(buttonClass).toContain('bg-green-500');
    expect(buttonClass).toContain('hover:bg-green-600');
    
    // Verify the button is enabled
    await expect(nextButton).toBeEnabled();
  });

  test('Green buttons are consistent across the app', async ({ page }) => {
    await page.goto('/');
    
    // Test Topic Selection
    await page.locator('textarea[placeholder="Type anything..."]').fill('Python Programming');
    let nextButton = page.locator('button:has-text("Next")');
    let buttonClass = await nextButton.getAttribute('class');
    expect(buttonClass).toContain('bg-green-500');
    
    await nextButton.click();
    
    // Test Depth Selection
    await expect(page.locator('text=How deep?')).toBeVisible();
    nextButton = page.locator('button:has-text("Next")').last();
    buttonClass = await nextButton.getAttribute('class');
    expect(buttonClass).toContain('bg-green-500');
  });

  test('Green button hover effects work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Fill topic and check hover effect
    await page.locator('textarea[placeholder="Type anything..."]').fill('React Hooks');
    const nextButton = page.locator('button:has-text("Next")');
    
    // Hover over the button
    await nextButton.hover();
    
    // Verify button is still visible and has green styling
    await expect(nextButton).toBeVisible();
    const buttonClass = await nextButton.getAttribute('class');
    expect(buttonClass).toContain('hover:bg-green-600');
  });

  test('Disabled state maintains correct styling', async ({ page }) => {
    await page.goto('/');
    
    // Initially the button should be disabled (empty topic)
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeDisabled();
    
    // Check disabled styling
    const buttonClass = await nextButton.getAttribute('class');
    expect(buttonClass).toContain('disabled:bg-gray-200');
    expect(buttonClass).toContain('disabled:text-gray-400');
  });
});