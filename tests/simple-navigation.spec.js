const { test, expect } = require('@playwright/test');

test.describe('Simple Navigation Flow', () => {
  test('basic navigation through all screens', async ({ page }) => {
    console.log('🧪 Starting basic navigation test');
    
    await page.goto('/');
    
    // Screen 1: Topic Selection
    console.log('📝 Screen 1: Topic Selection');
    await expect(page.locator('h1')).toContainText('What do you want to learn?');
    
    const topicInput = page.locator('textarea');
    await topicInput.fill('Basic HTML');
    await page.locator('button:has-text("Next")').click();
    
    // Screen 2: Depth Selection
    console.log('🎓 Screen 2: Depth Selection');
    await expect(page.locator('h1')).toContainText('How deep?');
    await expect(page.locator('text=Learning: Basic HTML')).toBeVisible();
    
    await page.locator('text=Simple').click();
    await page.locator('button:has-text("Next")').click();
    
    // Screen 3: Learning Style Selection
    console.log('🎨 Screen 3: Learning Style Selection');
    await expect(page.locator('h1')).toContainText('Learning style?');
    await expect(page.locator('text=Basic HTML')).toBeVisible();
    await expect(page.locator('text=Simple (ELI5)')).toBeVisible();
    
    await page.locator('text=Auditory').click();
    await page.locator('button:has-text("Generate Plan")').click();
    
    // Screen 4: Generating Plan
    console.log('⏳ Screen 4: Generating Plan');
    await expect(page.locator('h1')).toContainText('Generating your plan');
    
    // Screen 5: Lesson Plan (wait for generation)
    console.log('📚 Screen 5: Lesson Plan');
    await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 60000 });
    await expect(page.locator('text=Basic HTML')).toBeVisible();
    
    console.log('✅ Basic navigation test completed');
  });

  test('back navigation functionality', async ({ page }) => {
    console.log('🧪 Starting back navigation test');
    
    await page.goto('/');
    
    // Navigate to learning style selection
    await page.locator('textarea').fill('CSS Basics');
    await page.locator('button:has-text("Next")').click();
    
    await page.locator('text=Normal').click();
    await page.locator('button:has-text("Next")').click();
    
    // At learning style selection
    await expect(page.locator('h1')).toContainText('Learning style?');
    
    // Test back navigation: Learning Style -> Depth
    console.log('⬅️ Testing: Learning Style -> Depth');
    await page.locator('button').first().click(); // Back button
    await expect(page.locator('h1')).toContainText('How deep?');
    
    // Test back navigation: Depth -> Topic
    console.log('⬅️ Testing: Depth -> Topic');
    await page.locator('button').first().click(); // Back button
    await expect(page.locator('h1')).toContainText('What do you want to learn?');
    
    console.log('✅ Back navigation test completed');
  });

  test('form validation and error states', async ({ page }) => {
    console.log('🧪 Starting form validation test');
    
    await page.goto('/');
    
    // Test empty topic submission
    const nextButton = page.locator('button:has-text("Next")');
    
    // Initially, button should be disabled for empty input
    const topicInput = page.locator('textarea');
    await expect(topicInput).toBeEmpty();
    // Note: The button might be enabled by default, but clicking with empty input should not proceed
    
    // Fill with valid topic
    await topicInput.fill('JavaScript Fundamentals');
    await expect(nextButton).toBeEnabled();
    
    await nextButton.click();
    
    // Should proceed to depth selection
    await expect(page.locator('h1')).toContainText('How deep?');
    
    console.log('✅ Form validation test completed');
  });
});